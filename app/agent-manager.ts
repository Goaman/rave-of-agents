// Owns the lifecycle of interactive Claude agent sessions via the Agent SDK.
//
// Each session keeps a long-lived `query()` running in streaming-input mode: we
// feed it user messages through a queue-backed async generator, so a message
// can be pushed into a *running* agent at any time (e.g. from a websocket
// handler) and the session stays alive across turns.
//
// Sessions are persisted to disk (meta + transcript + sub-agent tree) and
// reloaded on startup as dormant sessions. Sending a message to a dormant
// session transparently resumes it via the SDK's `resume` (same sdkSessionId),
// so conversations survive a server restart.

import { query, type SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";
import { existsSync, openSync, readSync, closeSync, fstatSync } from "node:fs";
import { join } from "node:path";
import type {
  SessionMeta,
  SessionSnapshot,
  SubAgentNode,
  TranscriptEntry,
  TranscriptKind,
} from "./types.ts";
import { SuperTree, type RawEvent } from "./super-tree.ts";
import { loadAll, logPathFor, remove as removePersisted, save } from "./persistence.ts";

// Use the user's logged-in `claude` binary when present, so the SDK reuses the
// same OAuth credentials as the CLI (no ANTHROPIC_API_KEY needed).
const CLAUDE_BIN =
  process.env.CLAUDE_BIN ||
  [
    `${process.env.HOME}/.local/bin/claude`,
    "/opt/homebrew/bin/claude",
    "/usr/local/bin/claude",
  ].find((p) => existsSync(p)) ||
  undefined;

const REPO_ROOT = join(import.meta.dir, "..");
// The super_agent MCP server: lets a console agent recursively spawn sub-agents.
const SUPER_AGENT_SERVER =
  process.env.SUPER_AGENT_SERVER ||
  [
    join(REPO_ROOT, ".claude/skills/super-agent/server.mjs"),
    "/Volumes/Goadrive/perso/repos/strawit/.claude/skills/super-agent/server.mjs",
  ].find((p) => existsSync(p));
const NODE_BIN = process.env.NODE_BIN || Bun.which("node") || "node";
const MAX_DEPTH = process.env.SUPER_AGENT_MAX_DEPTH || "5";

// An async iterable you can push into at arbitrary times. The generator parks
// on a promise when empty and resumes when a message arrives, so `query()`
// stays alive between turns instead of ending after the first result.
class MessageQueue implements AsyncIterable<SDKUserMessage> {
  private items: SDKUserMessage[] = [];
  private wake: (() => void) | null = null;
  private closed = false;

  push(msg: SDKUserMessage) {
    this.items.push(msg);
    this.wake?.();
    this.wake = null;
  }

  close() {
    this.closed = true;
    this.wake?.();
    this.wake = null;
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<SDKUserMessage> {
    while (!this.closed || this.items.length > 0) {
      while (this.items.length > 0) yield this.items.shift()!;
      if (this.closed) break;
      await new Promise<void>((resolve) => (this.wake = resolve));
    }
  }
}

type Emit = (event: ManagerEvent) => void;

export type ManagerEvent =
  | { type: "session_added"; session: SessionMeta }
  | { type: "session_updated"; session: SessionMeta }
  | { type: "session_removed"; id: string }
  | { type: "entry"; sessionId: string; entry: TranscriptEntry }
  | { type: "tree"; sessionId: string; subAgents: SubAgentNode[] };

let nextEntryId = 1;
export function seedEntryId(n: number) {
  nextEntryId = Math.max(nextEntryId, n);
}

class Session {
  meta: SessionMeta;
  transcript: TranscriptEntry[] = [];
  private queue: MessageQueue | null = null;
  private q: ReturnType<typeof query> | null = null;
  private emit: Emit;

  // Nested-agent lineage. While live it's folded from the super-agent log; the
  // last view is persisted so dormant (restored) sessions still show the tree.
  readonly logPath: string;
  private subAgentsView: SubAgentNode[] = [];
  private tree = new SuperTree();
  private logFd: number | null = null;
  private logOffset = 0;
  private logBuf = "";
  private logTimer: ReturnType<typeof setInterval> | null = null;
  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    init: { id: string; label: string; model: string | null; cwd: string },
    emit: Emit,
    restored?: SessionSnapshot,
  ) {
    this.emit = emit;
    this.logPath = logPathFor(init.id);
    if (restored) {
      this.transcript = restored.transcript ?? [];
      this.subAgentsView = restored.subAgents ?? [];
      this.meta = { ...restored, busy: false, live: false };
    } else {
      this.meta = {
        id: init.id,
        label: init.label,
        model: init.model,
        cwd: init.cwd,
        status: "starting",
        sdkSessionId: null,
        createdAt: Date.now(),
        busy: true,
        live: true,
      };
    }
  }

  snapshot(): SessionSnapshot {
    return { ...this.meta, transcript: this.transcript, subAgents: this.subAgentsView };
  }

  private schedulePersist() {
    if (this.persistTimer) return;
    this.persistTimer = setTimeout(() => {
      this.persistTimer = null;
      save(this.snapshot());
    }, 400);
  }

  private update(patch: Partial<SessionMeta>) {
    this.meta = { ...this.meta, ...patch };
    this.emit({ type: "session_updated", session: this.meta });
    this.schedulePersist();
  }

  private addEntry(kind: TranscriptKind, text: string, tool?: string) {
    const entry: TranscriptEntry = {
      id: nextEntryId++,
      kind,
      // Strip ANSI escape sequences and stray control chars (the SDK sometimes
      // embeds them, e.g. a bold code in the model name) while keeping \n and
      // \t so the web UI's pre-wrap formatting stays intact.
      text: text
        .replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "")
        .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, ""),
      tool,
      ts: Date.now(),
    };
    this.transcript.push(entry);
    this.emit({ type: "entry", sessionId: this.meta.id, entry });
    this.schedulePersist();
  }

  private buildOptions(resume?: string): Record<string, unknown> {
    const options: Record<string, unknown> = {
      cwd: this.meta.cwd,
      permissionMode: "bypassPermissions",
      maxTurns: 100,
      includePartialMessages: false,
    };
    if (this.meta.model) options.model = this.meta.model;
    if (CLAUDE_BIN) options.pathToClaudeCodeExecutable = CLAUDE_BIN;
    if (resume) options.resume = resume;

    // Give the agent the super_agent tool, pointed at THIS session's isolated
    // log, so any nested agents it spawns are tracked under this session only.
    if (SUPER_AGENT_SERVER) {
      options.strictMcpConfig = true; // only our server; ignore project .mcp.json
      options.mcpServers = {
        superagent: {
          type: "stdio",
          command: NODE_BIN,
          args: [SUPER_AGENT_SERVER],
          env: {
            ...process.env,
            SUPER_AGENT_DEPTH: "0",
            SUPER_AGENT_MAX_DEPTH: MAX_DEPTH,
            SUPER_AGENT_LOG: this.logPath,
          },
        },
      };
    }
    return options;
  }

  // Begin a fresh query loop (resume continues a prior sdk session) and stream
  // the first user message in.
  private begin(initialPrompt: string, resume?: string) {
    this.queue = new MessageQueue();
    if (SUPER_AGENT_SERVER) {
      this.tree = new SuperTree(); // re-folds the (persistent) log from the top
      this.logFd = null;
      this.logOffset = 0;
      this.logBuf = "";
      this.startTailer();
    }
    this.update({ live: true });
    this.q = query({ prompt: this.queue, options: this.buildOptions(resume) as any });
    this.send(initialPrompt);
    this.runLoop();
  }

  // First run of a brand-new session.
  start(initialPrompt: string) {
    this.begin(initialPrompt);
  }

  // Re-attach to a dormant (restored / closed) session and continue it.
  resume(text: string) {
    this.addEntry("system", "↻ resuming session");
    this.begin(text, this.meta.sdkSessionId ?? undefined);
  }

  // Push a user message into the live session. Marks the agent busy.
  send(text: string) {
    this.addEntry("user", text);
    this.update({ status: "running", busy: true });
    this.queue?.push({
      type: "user",
      message: { role: "user", content: text },
      parent_tool_use_id: null,
    } as SDKUserMessage);
  }

  async interrupt() {
    try {
      await this.q?.interrupt();
      this.addEntry("system", "⏹ interrupted by user");
    } catch (e) {
      this.addEntry("error", `interrupt failed: ${String(e)}`);
    }
  }

  close() {
    this.queue?.close();
    this.stopTailer();
    this.update({ status: "done", busy: false, live: false });
  }

  destroy() {
    this.queue?.close();
    this.stopTailer();
    if (this.persistTimer) clearTimeout(this.persistTimer);
  }

  // --- super-agent log tailer (nested-agent lineage) ---
  private startTailer() {
    const poll = () => {
      try {
        if (this.logFd === null) {
          if (!existsSync(this.logPath)) return; // created lazily on first spawn
          this.logFd = openSync(this.logPath, "r");
        }
        const size = fstatSync(this.logFd).size;
        if (size < this.logOffset) {
          this.logOffset = 0; // truncated/rotated
          this.logBuf = "";
        }
        if (size <= this.logOffset) return;
        const len = size - this.logOffset;
        const buf = Buffer.allocUnsafe(len);
        const read = readSync(this.logFd, buf, 0, len, this.logOffset);
        this.logOffset += read;
        this.logBuf += buf.toString("utf8", 0, read);

        let nl: number;
        while ((nl = this.logBuf.indexOf("\n")) !== -1) {
          const line = this.logBuf.slice(0, nl).trim();
          this.logBuf = this.logBuf.slice(nl + 1);
          if (!line) continue;
          try {
            this.tree.apply(JSON.parse(line) as RawEvent);
          } catch {
            /* skip malformed line */
          }
        }
        if (this.tree.takeDirty()) {
          this.subAgentsView = this.tree.list();
          this.emit({ type: "tree", sessionId: this.meta.id, subAgents: this.subAgentsView });
          this.schedulePersist();
        }
      } catch {
        /* best-effort polling */
      }
    };
    this.logTimer = setInterval(poll, 300);
  }

  private stopTailer() {
    if (this.logTimer) clearInterval(this.logTimer);
    this.logTimer = null;
    if (this.logFd !== null) {
      try {
        closeSync(this.logFd);
      } catch {
        /* ignore */
      }
      this.logFd = null;
    }
  }

  private async runLoop() {
    try {
      for await (const msg of this.q!) {
        this.handle(msg as any);
      }
      // Generator finished (input closed and SDK drained).
      if (this.meta.status !== "error") this.update({ status: "done", busy: false, live: false });
    } catch (e) {
      this.addEntry("error", String((e as Error)?.message ?? e));
      this.update({ status: "error", busy: false, live: false });
    } finally {
      this.stopTailer();
    }
  }

  private handle(msg: any) {
    switch (msg.type) {
      case "system":
        if (msg.subtype === "init") {
          this.update({ sdkSessionId: msg.session_id ?? this.meta.sdkSessionId });
          this.addEntry("system", `session ready (model: ${msg.model ?? this.meta.model ?? "default"})`);
        }
        return;

      case "assistant": {
        const blocks = msg.message?.content ?? [];
        for (const b of blocks) {
          if (b.type === "text" && b.text?.trim()) {
            this.addEntry("assistant", b.text);
          } else if (b.type === "tool_use") {
            const input = b.input ? JSON.stringify(b.input) : "";
            this.addEntry(
              "tool_use",
              input.length > 300 ? input.slice(0, 300) + "…" : input,
              b.name,
            );
          }
        }
        this.update({ status: "running", busy: true });
        return;
      }

      case "result": {
        const txt = typeof msg.result === "string" ? msg.result : "";
        const cost =
          typeof msg.total_cost_usd === "number"
            ? ` ($${msg.total_cost_usd.toFixed(4)})`
            : "";
        if (msg.subtype && msg.subtype !== "success") {
          this.addEntry("error", `turn ended: ${msg.subtype}${cost}`);
        } else if (txt) {
          this.addEntry("result", `✓ done${cost}`);
        }
        // Turn finished — agent is now idle and ready for the next message.
        this.update({ status: "idle", busy: false });
        return;
      }

      // SDK "user" messages echo tool results back; we already show tool_use,
      // so skip to avoid duplicate noise.
      default:
        return;
    }
  }
}

export class AgentManager {
  private sessions = new Map<string, Session>();
  private emit: Emit;
  private seq = 0;

  constructor(emit: Emit) {
    this.emit = emit;
    // Restore persisted sessions as dormant (not yet live).
    let maxEntryId = 0;
    for (const snap of loadAll()) {
      const session = new Session(
        { id: snap.id, label: snap.label, model: snap.model, cwd: snap.cwd },
        emit,
        snap,
      );
      this.sessions.set(snap.id, session);
      for (const e of snap.transcript ?? []) maxEntryId = Math.max(maxEntryId, e.id);
      const n = Number(snap.id.match(/^s(\d+)-/)?.[1] ?? 0);
      this.seq = Math.max(this.seq, n);
    }
    seedEntryId(maxEntryId + 1);
  }

  list(): SessionSnapshot[] {
    return [...this.sessions.values()].map((s) => s.snapshot());
  }

  create(input: { label?: string; prompt: string; model?: string; cwd?: string }): SessionMeta {
    const id = `s${++this.seq}-${Date.now().toString(36)}`;
    const label = input.label?.trim() || `agent ${this.seq}`;
    const cwd = input.cwd?.trim() || process.cwd();
    const model = input.model?.trim() || null;
    const session = new Session({ id, label, model, cwd }, this.emit);
    this.sessions.set(id, session);
    this.emit({ type: "session_added", session: session.meta });
    session.start(input.prompt);
    return session.meta;
  }

  // Live sessions get the message pushed in; dormant ones are resumed first.
  send(id: string, text: string) {
    const s = this.sessions.get(id);
    if (!s) return;
    if (s.meta.live) s.send(text);
    else s.resume(text);
  }

  async interrupt(id: string) {
    await this.sessions.get(id)?.interrupt();
  }

  close(id: string) {
    this.sessions.get(id)?.close();
  }

  // Permanently forget a session (stop it if live, drop its persisted file).
  delete(id: string) {
    const s = this.sessions.get(id);
    if (!s) return;
    s.destroy();
    this.sessions.delete(id);
    removePersisted(id);
    this.emit({ type: "session_removed", id });
  }
}
