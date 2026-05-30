# Agent Console

A Bun + SolidJS UI (web **and** terminal) to **launch agents, watch their
transcript stream live, message a running agent at any time, and follow the
recursive sub-agent tree** — with sessions that survive a restart.

Unlike the one-shot `claude -p` super-agent (which reads no stdin and can't be
messaged mid-run), this uses the **Claude Agent SDK** in *streaming-input mode*:
each agent is a long-lived `query()` fed by a queue-backed async generator, so
you can push a new message into a live session whenever you want and it keeps
its context across turns.

Each console agent also gets the **`super_agent` MCP tool**, so it can spawn
nested agents — which can spawn their own, recursively. That lineage is rendered
live as a **sub-agent tree** (sidebar + conversation); click any node to open
that sub-agent's own conversation (its prompt, the agents it spawned, and what
it returned).

## Run (from the repo root)

```bash
bun install        # first time only
bun run start      # web UI  → http://localhost:4317
bun run tui        # terminal UI (same backend; embeds a server if none is up)
```

- `bun run dev` — web server with auto-restart on changes.
- `PORT=8080 bun run start` — change the port (the TUI honours `PORT` too).

The web UI: **+ new agent** → task → launch; type in the composer (⌘/Ctrl+Enter)
to message the running agent. The TUI: `j/k` select · `n` new · `m` message ·
`g` interrupt · `x` close · `q` quit.

## Persistence

Sessions (metadata, transcript, sub-agent tree) are saved under
`~/.agent-console/` (override with `AGENT_CONSOLE_DIR`) and reloaded on startup,
so your conversations are still there after a restart. A restored session is
**dormant**; sending it a message **resumes** it via the SDK's `resume` (same
session id), so you can keep talking to it. `delete` forgets a session for good.

## Auth

No `ANTHROPIC_API_KEY` required: the server points the SDK at your logged-in
`claude` binary (`~/.local/bin/claude`, or set `CLAUDE_BIN`) so it reuses the
CLI's credentials. Set `ANTHROPIC_API_KEY` instead if you prefer.

## How it works

```
web (SolidJS) ─┐                 ┌─ one query() per session (SDK, streaming in)
tui (ANSI)    ─┴─ ws ─▶ Bun server ─▶ AgentManager ─ MessageQueue → push anytime
                        (hub,            │           ─ resume() restores dormant
                         fan-out)        │           ─ persist to ~/.agent-console
                                         └─ per-session super-agent log → SuperTree
```

- **`server.ts`** — `startServer()`: bundles the client (`Bun.build`, no JSX
  step), serves static files, runs the `/ws` hub (snapshot on connect +
  broadcast). Runs directly or is embedded by the TUI.
- **`agent-manager.ts`** — session lifecycle: live `query()`, streaming-input
  `MessageQueue`, resume of dormant sessions, debounced persistence. Each session
  wires in the `super_agent` MCP server pointed at its **own isolated log file**,
  tailed live so nested-agent activity is provably that session's.
- **`super-tree.ts`** — pure reducer folding `spawn`/`server_start`/`child_done`
  log events into a lineage tree, stitching parent→child by depth + FIFO order.
- **`persistence.ts`** — JSON-per-session load/save under `~/.agent-console/`.
- **`client/`** — SolidJS via the `solid-js/html` tagged template (real
  fine-grained reactivity, bundled by Bun — no Babel/Vite).
- **`tui.ts`** — ANSI terminal client over the same websocket. All dynamic text
  is sanitized and fit to exact plain-text widths before colouring, so columns
  never drift regardless of agent output.
- **`types.ts`** — shared server↔client message + session types.

## Verified (real browser + real agents, Chromium via Playwright; TUI via a pty)

- live streaming + bidirectional messaging: haiku agent "17 × 23?" → **391**,
  then a follow-up "add 9" → **400** (remembered prior context);
- recursive sub-agent tree: an agent spawned L1 → L2 → "PONG"; the lineage
  rendered live in sidebar and conversation;
- click-into-sub-agent: opening an L1 node shows its prompt, its spawned L2, and
  its returned answer; the L2 drills down further;
- persistence: sessions reload after restart as dormant and resume on send;
- TUI: renders cleanly (0 column overflow) at 50–90 cols; navigation + send work.
```
