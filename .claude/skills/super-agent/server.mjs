#!/usr/bin/env node
// super-agent: a minimal stdio MCP server exposing one tool, `super_agent`.
//
// `super_agent` spawns a fresh headless Claude (`claude -p`) and hands that
// child the SAME MCP server (via --mcp-config + --strict-mcp-config). The child
// therefore also has the `super_agent` tool and can spawn its own child, and so
// on — each level is a real top-level Claude process, which is how we get
// arbitrarily deep nesting (Claude Code's built-in Task sub-agents cannot
// themselves spawn sub-agents).
//
// Recursion depth rides along in the MCP server's env (SUPER_AGENT_DEPTH) and
// increments at every level; SUPER_AGENT_MAX_DEPTH is a runaway guard.
//
// No npm dependencies: the MCP stdio protocol (newline-delimited JSON-RPC 2.0)
// is implemented by hand below.

import { spawn } from "node:child_process";
import { appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import path from "node:path";

const SERVER_PATH = fileURLToPath(import.meta.url);
const PROTOCOL_VERSION = "2024-11-05";

const DEPTH = parseInt(process.env.SUPER_AGENT_DEPTH || "0", 10);
const MAX_DEPTH = parseInt(process.env.SUPER_AGENT_MAX_DEPTH || "5", 10);
// The headless agent binary. Overridable so tests can inject a fake `claude`.
const CLAUDE_BIN = process.env.SUPER_AGENT_CLAUDE_BIN || "claude";
const LOG_FILE =
  process.env.SUPER_AGENT_LOG || path.join(homedir(), ".claude", "super-agent.log");

function log(event, extra = {}) {
  try {
    appendFileSync(
      LOG_FILE,
      JSON.stringify({
        ts: new Date().toISOString(),
        pid: process.pid,
        depth: DEPTH,
        event,
        ...extra,
      }) + "\n"
    );
  } catch {
    /* logging is best-effort */
  }
}

// --- the one tool ---------------------------------------------------------

const TOOL = {
  name: "super_agent",
  description:
    "Spawn a nested, fully autonomous Claude agent to handle a self-contained " +
    "task and return its final answer. Unlike a normal sub-agent, the spawned " +
    "agent ALSO has the `super_agent` tool, so it can spawn its own nested " +
    "agents — enabling deep multi-level delegation. Give it a complete, " +
    "self-contained prompt (it does not see this conversation). It returns only " +
    "its final text answer. PARALLELISM: when you have multiple INDEPENDENT " +
    "subtasks, call super_agent multiple times in a SINGLE message — the spawns " +
    "run concurrently and you get all results back together. Only chain calls " +
    "sequentially when one subtask's output feeds the next.",
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description:
          "The complete, self-contained task for the nested agent. Include all " +
          "needed context. To force further nesting, tell it to call super_agent.",
      },
      model: {
        type: "string",
        description: "Optional model alias (e.g. 'opus', 'sonnet', 'haiku'). Defaults to inherited.",
      },
      max_turns: {
        type: "number",
        description: "Optional max agentic turns for the nested agent (default 16).",
      },
    },
    required: ["prompt"],
    additionalProperties: false,
  },
};

// Per-call correlation id. With parallel spawning, sibling agents at the same
// depth start and finish in arbitrary order, so the lineage builder cannot stitch
// spawn→server_start→child_done by FIFO order alone. We mint a globally-unique cid
// per spawn (pid-scoped counter), log it on every event for this call, AND hand it
// to the child via env so the child's own `server_start` carries the same cid. That
// lets the tree correlate each event to the exact node regardless of timing.
let callSeq = 0;
function nextCid() {
  return `${process.pid}.${++callSeq}`;
}

function childMcpConfig(cid) {
  // Hand the child the same server, with an incremented depth and its cid.
  return JSON.stringify({
    mcpServers: {
      superagent: {
        type: "stdio",
        command: process.execPath, // the same node binary
        args: [SERVER_PATH],
        env: {
          SUPER_AGENT_DEPTH: String(DEPTH + 1),
          SUPER_AGENT_MAX_DEPTH: String(MAX_DEPTH),
          SUPER_AGENT_LOG: LOG_FILE,
          SUPER_AGENT_CID: cid,
        },
      },
    },
  });
}

function runSuperAgent({ prompt, model, max_turns }) {
  return new Promise((resolve) => {
    const cid = nextCid();
    if (DEPTH >= MAX_DEPTH) {
      log("depth_limit", { cid, childDepth: DEPTH + 1, max: MAX_DEPTH });
      resolve({
        ok: false,
        text: `super_agent depth limit reached (${MAX_DEPTH}); refusing to nest further.`,
      });
      return;
    }

    const args = [
      "-p",
      prompt,
      "--output-format",
      "json",
      "--mcp-config",
      childMcpConfig(cid),
      "--strict-mcp-config", // ignore every other MCP source; only our server
      "--allowedTools",
      "mcp__superagent__super_agent",
      "--permission-mode",
      "bypassPermissions",
      "--max-turns",
      String(max_turns && max_turns > 0 ? max_turns : 16),
    ];
    if (model) args.push("--model", model);

    log("spawn", { cid, childDepth: DEPTH + 1, model: model || null, prompt });

    const child = spawn(CLAUDE_BIN, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));

    child.on("error", (e) => {
      log("spawn_error", { cid, childDepth: DEPTH + 1, message: e.message });
      resolve({ ok: false, text: `Failed to spawn nested claude: ${e.message}` });
    });

    child.on("close", (code) => {
      if (code !== 0) {
        log("child_exit", { cid, childDepth: DEPTH + 1, code, stderr: err.slice(0, 2000) });
        resolve({
          ok: false,
          text: `Nested claude exited with code ${code}.\nstderr:\n${err.slice(0, 2000)}`,
        });
        return;
      }
      try {
        const parsed = JSON.parse(out);
        const text = parsed.result ?? "(no result field)";
        log("child_done", {
          cid,
          childDepth: DEPTH + 1,
          resultPreview: String(text).slice(0, 200),
          result: String(text).slice(0, 8000), // full(ish) answer for the detail view
        });
        resolve({ ok: !parsed.is_error, text: String(text) });
      } catch (e) {
        log("parse_error", { cid, childDepth: DEPTH + 1, message: e.message, raw: out.slice(0, 1000) });
        resolve({ ok: false, text: `Could not parse nested claude output: ${e.message}` });
      }
    });
  });
}

// --- minimal MCP stdio server (newline-delimited JSON-RPC 2.0) -------------

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

function reply(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function replyError(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

async function handle(msg) {
  const { id, method, params } = msg;

  switch (method) {
    case "initialize":
      reply(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: "superagent", version: "1.0.0" },
      });
      return;

    case "notifications/initialized":
    case "initialized":
      return; // notification, no response

    case "ping":
      reply(id, {});
      return;

    case "tools/list":
      reply(id, { tools: [TOOL] });
      return;

    case "tools/call": {
      const name = params?.name;
      const argsIn = params?.arguments || {};
      if (name !== "super_agent") {
        replyError(id, -32602, `Unknown tool: ${name}`);
        return;
      }
      if (!argsIn.prompt || typeof argsIn.prompt !== "string") {
        replyError(id, -32602, "Missing required string argument: prompt");
        return;
      }
      const { ok, text } = await runSuperAgent(argsIn);
      reply(id, {
        content: [{ type: "text", text }],
        isError: !ok,
      });
      return;
    }

    default:
      if (id !== undefined) replyError(id, -32601, `Method not found: ${method}`);
      return;
  }
}

let buf = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf("\n")) !== -1) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue; // ignore malformed lines
    }
    Promise.resolve(handle(msg)).catch((e) => {
      if (msg && msg.id !== undefined) replyError(msg.id, -32603, String(e?.message || e));
    });
  }
});

process.stdin.on("end", () => process.exit(0));
// cid is the id our PARENT assigned this child (absent for the depth-0 root).
log("server_start", { cid: process.env.SUPER_AGENT_CID || null, serverPath: SERVER_PATH });
