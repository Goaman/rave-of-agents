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

import type { SubAgentNode } from "./types.ts";

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
  // Per-spawn correlation id minted by the parent's MCP server. Present on
  // spawn/server_start/child_done/error events so siblings spawned in parallel
  // (which start and finish out of order) attribute to the right node by id
  // rather than by FIFO order. Absent in legacy logs → we fall back to FIFO.
  cid?: string;
}

export class SuperTree {
  private nodes: SubAgentNode[] = [];
  private pidToKey = new Map<number, string>(); // bound pid -> node key
  private cidToNode = new Map<string, SubAgentNode>(); // spawn cid -> node
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

  private keyForPid(pid: number, depth: number): string | null {
    // depth 0 is the session root (console agent) — represented by null parent.
    if (depth === 0) return null;
    return this.pidToKey.get(pid) ?? null;
  }

  apply(e: RawEvent) {
    switch (e.event) {
      case "spawn": {
        const parentKey = this.keyForPid(e.pid, e.depth);
        const node: SubAgentNode = {
          key: `n${++this.seq}`,
          pid: null,
          depth: (e.childDepth ?? e.depth + 1),
          parentKey,
          model: e.model ?? null,
          prompt: e.prompt ?? "",
          resultPreview: null,
          result: null,
          status: "spawning",
          startedAt: Date.parse(e.ts ?? "") || Date.now(),
        };
        this.nodes.push(node);
        if (e.cid) this.cidToNode.set(e.cid, node);
        this.dirty = true;
        return;
      }

      case "server_start": {
        if (e.depth === 0) return; // the session's own root server, not a sub-agent
        // Prefer exact cid match (the child reports the cid its parent assigned),
        // so parallel siblings bind to the right node regardless of start order.
        const node =
          (e.cid && this.cidToNode.get(e.cid)) ||
          // Legacy/no-cid fallback: oldest still-unbound node at this depth.
          this.nodes.find(
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
        const node = this.resolveChild(e);
        if (node) {
          node.status = "done";
          node.resultPreview = e.resultPreview ?? null;
          node.result = e.result ?? e.resultPreview ?? null;
          this.dirty = true;
        }
        return;
      }

      case "child_exit":
      case "spawn_error":
      case "depth_limit":
      case "parse_error": {
        const node = this.resolveChild(e);
        if (node) {
          node.status = "error";
          node.resultPreview = node.resultPreview ?? `(${e.event})`;
          this.dirty = true;
        }
        return;
      }
    }
  }

  // Resolve the node a completion/error event refers to. Exact cid match first
  // (correct under parallel spawning); otherwise fall back to the oldest
  // unfinished child of the emitting parent at the child depth (legacy logs).
  private resolveChild(e: RawEvent): SubAgentNode | undefined {
    if (e.cid) {
      const byCid = this.cidToNode.get(e.cid);
      if (byCid) return byCid;
    }
    const parentKey = this.keyForPid(e.pid, e.depth);
    return this.unresolvedChild(parentKey, e.childDepth ?? e.depth + 1);
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
