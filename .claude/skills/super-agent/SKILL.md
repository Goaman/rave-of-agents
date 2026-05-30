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
```

## The tool

`mcp__superagent__super_agent`

| arg | required | meaning |
|-----|----------|---------|
| `prompt` | yes | Complete, self-contained task for the nested agent. To force further nesting, tell it to call `super_agent` itself. |
| `model` | no | Model alias: `opus`, `sonnet`, `haiku`. Defaults to the nested process's configured default. Pass `sonnet`/`haiku` to control cost on deep chains. |
| `max_turns` | no | Max agentic turns for the nested agent (default 16). |

## Parallelism — spawn concurrently when possible

Independent subtasks should be spawned **in parallel**, not one after another.
Issue several `super_agent` calls in a **single turn** (multiple tool_use blocks)
and they run concurrently — wall-clock time becomes the slowest branch, not the
sum of all branches. The MCP server handles each call on its own and never
serializes them, and each spawn carries a correlation id so the lineage tree
attributes every branch (and its sub-tree) correctly even when siblings finish
out of order.

- **Parallel** (do this): three unrelated directions to explore, N files to
  analyze independently, a fan-out of "research X / research Y / research Z".
  Fire all the `super_agent` calls in one message.
- **Sequential** (only when forced): when one branch's result is an input to the
  next. Chain those, but still parallelize anything independent within each step.

```
one turn ──┬─ super_agent (branch A) ─┐
           ├─ super_agent (branch B) ─┤── all run at once, results return together
           └─ super_agent (branch C) ─┘
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
