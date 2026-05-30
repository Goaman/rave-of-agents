---
name: super-agent
description: Spawn deeply-nestable autonomous sub-agents that can themselves spawn sub-agents. Use when a task needs multi-level delegation beyond Claude Code's built-in Task tool — which spawns one layer of sub-agents that CANNOT spawn their own. Triggers on requests like "delegate this recursively", "have a sub-agent spawn sub-agents", "nested agents", "fan out work across multiple levels of agents".
---

# Super Agent

Claude Code's built-in `Task` tool spawns sub-agents, but those sub-agents **cannot
spawn sub-agents of their own** — nesting stops at one level. This skill provides a
`super_agent` tool with no such limit: every spawned agent is a real top-level
`claude -p` process that *also* has the `super_agent` tool, so it can spawn the next
level, and so on.

## How it works

`super_agent` is exposed by a tiny stdio MCP server (`server.mjs`) registered in
`.mcp.json`. When the tool is called:

1. It launches a fresh headless `claude -p <prompt>`.
2. That child is handed the **same** MCP server via `--mcp-config` +
   `--strict-mcp-config`, so the child also has `super_agent`.
3. A depth counter (`SUPER_AGENT_DEPTH`) rides along in the server's env and
   increments at each level; `SUPER_AGENT_MAX_DEPTH` (default 5) is the runaway guard.
4. The child's final answer (the `.result` field of its JSON output) is returned as
   the tool result.

Each level is an independent Claude process with its own fresh context — children do
**not** see the parent conversation, so every prompt must be **complete and
self-contained**.

```
main session
  └─ super_agent ──> claude (L1)
                        └─ super_agent ──> claude (L2)
                                              └─ super_agent ──> claude (L3) ...

# parallel fan-out (one super_agent_parallel call per level):
main session
  └─ super_agent_parallel ──┬─> claude (L1-a) ──> super_agent_parallel ──┬─> claude (L2)
                            │                                            └─> claude (L2)
                            └─> claude (L1-b) ──> super_agent_parallel ──┬─> claude (L2)
                                                                         └─> claude (L2)
```

## The tools

### `mcp__superagent__super_agent` — spawn ONE nested agent

| arg | required | meaning |
|-----|----------|---------|
| `prompt` | yes | Complete, self-contained task for the nested agent. To force further nesting, tell it to call `super_agent` itself. |
| `model` | no | Model alias: `opus`, `sonnet`, `haiku`. Defaults to the nested process's configured default. Pass `sonnet`/`haiku` to control cost on deep chains. |
| `max_turns` | no | Max agentic turns for the nested agent (default 16). |

### `mcp__superagent__super_agent_parallel` — spawn MANY at once, in parallel

| arg | required | meaning |
|-----|----------|---------|
| `tasks` | yes | Array of agents to spawn **concurrently**. Each item is either a plain string prompt, or an object `{ prompt, model?, max_turns? }` for per-agent overrides. |
| `model` | no | Default model alias applied to every task that doesn't set its own. |
| `max_turns` | no | Default max turns applied to every task that doesn't set its own. |

**Always use `super_agent_parallel` when you want sub-agents to run in
parallel.** A single call fans out *all* tasks simultaneously via `Promise.all`,
so they spawn instantaneously together. Do **not** emit several separate
`super_agent` calls hoping they run concurrently — the host may serialize calls
to the same MCP server, so that approach can run them one-at-a-time.

The combined result lists each agent's answer, labeled `=== agent i/N (ok|error) ===`.

Every spawned agent also has **both** tools, so a parallel child can itself call
`super_agent_parallel` to fan out the next level — that is how you get parallel
fan-out at every depth.

Example — "2 agents in parallel, each spawning 2 more in parallel, all say pong, use haiku":

```
super_agent_parallel({
  model: "haiku",
  tasks: [
    "Call super_agent_parallel with two haiku tasks, each saying exactly 'pong'. Return both replies.",
    "Call super_agent_parallel with two haiku tasks, each saying exactly 'pong'. Return both replies.",
  ]
})
```

## When to use it

- A subtask is large enough to warrant its own delegation tree (it will itself break
  work into sub-agents).
- You want isolated context windows per branch of work.
- You explicitly need more than one level of nesting.

For a single layer of parallel helpers, prefer the built-in `Task`/Agent tool — it is
cheaper and lower-latency. Reach for `super_agent` specifically when the *sub-agents
need to delegate further*.

## Cost & latency

Every level is a full Claude process. Depth N with fan-out F spawns up to F^N
processes. Keep `SUPER_AGENT_MAX_DEPTH` sane, pass `model: "sonnet"` or `"haiku"` for
deep/wide trees, and give precise prompts so children don't wander.

## Files

- `server.mjs` — the stdio MCP server (no npm dependencies; hand-rolled JSON-RPC).
- Registered in the repo's `.mcp.json` as server `superagent`.

## Observability

Every spawn/return is logged as JSON lines to `~/.claude/super-agent.log` (override
with `SUPER_AGENT_LOG`). Each line records `depth`, `pid`, and `event`
(`spawn`, `child_done`, `depth_limit`, …) — `tail -f` it to watch a delegation tree
unfold.
