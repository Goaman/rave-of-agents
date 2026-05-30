#!/usr/bin/env node
// Proves the super_agent MCP server spawns nested agents in PARALLEL when it
// receives multiple tools/call requests concurrently — i.e. the server never
// serializes spawns behind one another.
//
// Strategy: point the server at a fake `claude` (fake-claude.mjs) that sleeps
// SLEEP ms then returns, stamping start/end to a shared timeline file. We fire
// N tools/call requests back-to-back (one assistant turn's worth of parallel
// tool_use blocks) and assert:
//   1. all N replies come back, each with the right result, and
//   2. total wall time ≈ one SLEEP (parallel), not N × SLEEP (serial), and
//   3. the fake-claude invocations actually overlapped in time.
//
// Run:  node .claude/skills/super-agent/test/parallel-spawn.test.mjs
// Exit 0 = pass, 1 = fail.

import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERVER = path.join(HERE, "..", "server.mjs");
const FAKE = path.join(HERE, "fake-claude.mjs");

const N = 4; // parallel spawns
const SLEEP = 700; // ms each fake spawn "works"
const tmp = mkdtempSync(path.join(tmpdir(), "superagent-test-"));
const TIMELINE = path.join(tmp, "timeline.jsonl");

function fail(msg) {
  console.error(`\x1b[31m✗ FAIL:\x1b[0m ${msg}`);
  cleanup();
  process.exit(1);
}
function pass(msg) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`);
}
function cleanup() {
  try {
    rmSync(tmp, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

// CLAUDE_BIN points at the fake directly — its `#!/usr/bin/env node` shebang
// runs it under node, and the server invokes it as `fake -p <prompt> ...`.
const server = spawn(process.execPath, [SERVER], {
  stdio: ["pipe", "pipe", "pipe"],
  env: {
    ...process.env,
    SUPER_AGENT_CLAUDE_BIN: FAKE,
    SUPER_AGENT_LOG: path.join(tmp, "super-agent.log"),
    SUPER_AGENT_FAKE_SLEEP: String(SLEEP),
    SUPER_AGENT_FAKE_TIMELINE: TIMELINE,
  },
});

let serverErr = "";
server.stderr.on("data", (d) => (serverErr += d));

// Collect newline-delimited JSON-RPC replies from the server.
const replies = new Map();
let buf = "";
const waiters = new Map();
server.stdout.on("data", (d) => {
  buf += d;
  let nl;
  while ((nl = buf.indexOf("\n")) !== -1) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    if (msg.id !== undefined) {
      replies.set(msg.id, msg);
      waiters.get(msg.id)?.(msg);
      waiters.delete(msg.id);
    }
  }
});

function send(obj) {
  server.stdin.write(JSON.stringify(obj) + "\n");
}
function waitFor(id, timeoutMs) {
  if (replies.has(id)) return Promise.resolve(replies.get(id));
  return new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error(`timeout waiting for id ${id}`)), timeoutMs);
    waiters.set(id, (m) => {
      clearTimeout(to);
      resolve(m);
    });
  });
}

async function main() {
  // Handshake.
  send({ jsonrpc: "2.0", id: 0, method: "initialize", params: {} });
  await waitFor(0, 5000);
  send({ jsonrpc: "2.0", method: "notifications/initialized" });

  // Fire N tools/call concurrently (as a batched parallel tool turn would).
  const t0 = Date.now();
  for (let i = 1; i <= N; i++) {
    send({
      jsonrpc: "2.0",
      id: i,
      method: "tools/call",
      params: { name: "super_agent", arguments: { prompt: `task ${i}` } },
    });
  }

  // Wait for all replies. Serial would need ~N*SLEEP; allow a generous ceiling
  // that is still well below serial time to make the assertion meaningful.
  const serialMs = N * SLEEP;
  const ceiling = Math.floor(serialMs * 0.6); // must beat 60% of serial time
  const results = await Promise.all(
    Array.from({ length: N }, (_, k) => waitFor(k + 1, serialMs + 5000)),
  );
  const elapsed = Date.now() - t0;

  // 1. correctness: every call returned its own result, no errors.
  for (let i = 1; i <= N; i++) {
    const r = results[i - 1];
    const text = r.result?.content?.[0]?.text ?? "";
    if (r.result?.isError) fail(`call ${i} returned isError`);
    if (!text.includes(`task ${i}`)) fail(`call ${i} got wrong result: ${JSON.stringify(text)}`);
  }
  pass(`all ${N} spawns returned their own correct result`);

  // 2. wall-clock: parallel, not serial.
  if (elapsed >= ceiling) {
    fail(
      `wall time ${elapsed}ms is not parallel — expected < ${ceiling}ms ` +
        `(serial would be ~${serialMs}ms for ${N} × ${SLEEP}ms)`,
    );
  }
  pass(`wall time ${elapsed}ms < ${ceiling}ms ceiling (serial ≈ ${serialMs}ms) — spawns ran in parallel`);

  // 3. timeline overlap: at the peak, all N fakes were running at once.
  if (!existsSync(TIMELINE)) fail("no timeline produced by fake-claude");
  const events = readFileSync(TIMELINE, "utf8")
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l));
  let live = 0;
  let peak = 0;
  for (const e of events.sort((a, b) => a.t - b.t)) {
    if (e.event === "start") live++;
    else if (e.event === "end") live--;
    peak = Math.max(peak, live);
  }
  if (peak < N) fail(`peak concurrency was ${peak}, expected ${N} (spawns did not overlap)`);
  pass(`peak concurrency ${peak}/${N} — all spawns were in flight simultaneously`);

  console.log(`\n\x1b[32mPASS\x1b[0m — super_agent spawns run in parallel.`);
  cleanup();
  server.kill();
  process.exit(0);
}

server.on("error", (e) => fail(`server failed to start: ${e.message}`));
setTimeout(() => fail(`global timeout; server stderr:\n${serverErr}`), 30000);

main().catch((e) => fail(`${e.message}\nserver stderr:\n${serverErr}`));
