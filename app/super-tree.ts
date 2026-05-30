// Folds super-agent.log JSONL events into a lineage tree of nested agents.
//
// The log is emitted by .claude/skills/super-agent/server.mjs. A parent at
// `depth` emits `spawn{childDepth}` then later `child_done{childDepth}`; the
// child runs as a new process that emits its own `server_start` at `childDepth`
// and may itself spawn deeper. The child's real pid only appears in its
// server_start, so we stitch parent→child by depth + FIFO order.
//
// We isolate one log file per console session, so every node here belongs to
// that session. depth 0 = the console agent's own MCP server (the session
// root); sub-agent nodes are depth >= 1.
//
// Beyond folding the log, this tree is also the live model the session-worker
// mutates directly to support *interrupting* and *talking to* a sub-agent:
// `spawn` records the child's process group (childPid) so the worker can signal
// it; `child_done` records the child's session id so the worker can resume it;
// and start/finishTurn append follow-up exchanges to a node's `turns`.

import type { SubAgentNode, SubAgentTurn } from "./types.ts";

export interface RawEvent {
  ts?: string;
  pid: number;
  depth: number;
  event: string;
  childDepth?: number;
  model?: string | null;
  prompt?: string;
  resultPreview?: string;
  result?: string;
  // The spawned `claude` process group leader (from `spawn`) and its session id
  // (from `child_done`) — see the file header.
  childPid?: number | null;
  sessionId?: string | null;
}

export class SuperTree {
  private nodes: SubAgentNode[] = [];
  private pidToKey = new Map<number, string>(); // bound pid -> node key
  private seq = 0;
  private dirty = false;

  // Did the last batch of apply() calls change anything worth broadcasting?
  takeDirty(): boolean {
    const d = this.dirty;
    this.dirty = false;
    return d;
  }

  list(): SubAgentNode[] {
    return this.nodes;
  }

  byKey(key: string): SubAgentNode | undefined {
    return this.nodes.find((n) => n.key === key);
  }

  // Adopt a list of nodes restored from storage so follow-ups/interrupts work on
  // a session that was reloaded from disk. We also reseed the pid map and the key
  // counter so freshly-logged spawns keep getting unique keys.
  hydrate(nodes: SubAgentNode[]) {
    this.nodes = nodes.map((n) => ({ ...n, turns: n.turns ?? legacyTurns(n) }));
    this.pidToKey.clear();
    for (const n of this.nodes) {
      if (n.pid != null) this.pidToKey.set(n.pid, n.key);
      const num = Number(n.key.replace(/^n/, ""));
      if (Number.isFinite(num)) this.seq = Math.max(this.seq, num);
    }
  }

  private keyForPid(pid: number, depth: number): string | null {
    // depth 0 is the session root (console agent) — represented by null parent.
    if (depth === 0) return null;
    return this.pidToKey.get(pid) ?? null;
  }

  apply(e: RawEvent) {
    switch (e.event) {
      case "spawn": {
        const parentKey = this.keyForPid(e.pid, e.depth);
        const startedAt = Date.parse(e.ts ?? "") || Date.now();
        const prompt = e.prompt ?? "";
        this.nodes.push({
          key: `n${++this.seq}`,
          pid: null,
          depth: (e.childDepth ?? e.depth + 1),
          parentKey,
          model: e.model ?? null,
          prompt,
          resultPreview: null,
          result: null,
          status: "spawning",
          startedAt,
          childPid: e.childPid ?? null,
          sessionId: null,
          turns: [{ prompt, result: null, status: "running", startedAt }],
        });
        this.dirty = true;
        return;
      }

      case "server_start": {
        if (e.depth === 0) return; // the session's own root server, not a sub-agent
        // Bind to the oldest still-unbound node expecting this depth.
        const node = this.nodes.find(
          (n) => n.pid === null && n.depth === e.depth && n.status === "spawning",
        );
        if (node) {
          node.pid = e.pid;
          node.status = "running";
          this.pidToKey.set(e.pid, node.key);
          this.dirty = true;
        }
        return;
      }

      case "child_done": {
        const parentKey = this.keyForPid(e.pid, e.depth);
        const node = this.unresolvedChild(parentKey, e.childDepth ?? e.depth + 1);
        if (node) {
          node.status = "done";
          node.resultPreview = e.resultPreview ?? null;
          node.result = e.result ?? e.resultPreview ?? null;
          node.childPid = null;
          if (e.sessionId) node.sessionId = e.sessionId;
          finishLastTurn(node, "done", node.result);
          this.dirty = true;
        }
        return;
      }

      case "child_exit":
      case "spawn_error":
      case "depth_limit":
      case "parse_error": {
        const parentKey = this.keyForPid(e.pid, e.depth);
        const node = this.unresolvedChild(parentKey, e.childDepth ?? e.depth + 1);
        if (node) {
          node.status = "error";
          node.resultPreview = node.resultPreview ?? `(${e.event})`;
          node.childPid = null;
          finishLastTurn(node, "error", node.resultPreview);
          this.dirty = true;
        }
        return;
      }
    }
  }

  // --- direct mutation for follow-up (resume) turns, driven by the worker ---

  // Record the process group of the run currently driving `key` (so interrupt
  // can signal it). Used for follow-up turns the worker spawns itself.
  setChildPid(key: string, pid: number | null): boolean {
    const node = this.byKey(key);
    if (!node) return false;
    node.childPid = pid;
    this.dirty = true;
    return true;
  }

  // Begin a follow-up exchange: append a new running turn and flip the node back
  // to running. Returns the node (so the worker can read sessionId/model/depth).
  startTurn(key: string, prompt: string): SubAgentNode | undefined {
    const node = this.byKey(key);
    if (!node) return undefined;
    node.turns.push({ prompt, result: null, status: "running", startedAt: Date.now() });
    node.status = "running";
    node.result = null;
    node.resultPreview = null;
    this.dirty = true;
    return node;
  }

  // Complete the latest follow-up turn with its result (or error) and capture the
  // refreshed session id so the next follow-up resumes from here.
  finishTurn(key: string, ok: boolean, result: string, sessionId?: string | null): boolean {
    const node = this.byKey(key);
    if (!node) return false;
    node.status = ok ? "done" : "error";
    node.result = result;
    node.resultPreview = result ? result.slice(0, 200) : node.resultPreview;
    node.childPid = null;
    if (sessionId) node.sessionId = sessionId;
    finishLastTurn(node, ok ? "done" : "error", result);
    this.dirty = true;
    return true;
  }

  // Oldest child of `parentKey` at `depth` not yet finished.
  private unresolvedChild(parentKey: string | null, depth: number): SubAgentNode | undefined {
    return this.nodes.find(
      (n) =>
        n.parentKey === parentKey &&
        n.depth === depth &&
        (n.status === "spawning" || n.status === "running"),
    );
  }
}

// Mark the node's most recent turn finished. Tolerant of legacy nodes that were
// persisted before `turns` existed (then there is nothing to update).
function finishLastTurn(node: SubAgentNode, status: SubAgentTurn["status"], result: string | null) {
  const turn = node.turns[node.turns.length - 1];
  if (!turn) return;
  turn.status = status;
  turn.result = result;
}

// Reconstruct a single-turn history for a node restored from storage that predates
// the `turns` field, so the conversation view still renders something sensible.
function legacyTurns(n: SubAgentNode): SubAgentTurn[] {
  return [
    {
      prompt: n.prompt ?? "",
      result: n.result ?? n.resultPreview ?? null,
      status: n.status === "error" ? "error" : n.status === "done" ? "done" : "running",
      startedAt: n.startedAt ?? Date.now(),
    },
  ];
}
