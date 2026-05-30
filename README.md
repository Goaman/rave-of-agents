# rave-of-agents

A console — **web and terminal** — for running Claude agents that you can watch,
message mid-run, and nest recursively. Launch an agent, follow its transcript as
it streams, push it a new message at any time, and watch the tree of sub-agents
it spawns. Sessions run in detached worker processes, so **they keep running
even when the server is down** and re-attach when it comes back.

Built on the [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk-typescript)
in streaming-input mode, with [Bun](https://bun.sh) and [SolidJS](https://www.solidjs.com/).

## What's inside

- **Live agent sessions** — each agent is a long-lived `query()` fed by a
  message queue, so you can interject mid-turn and it keeps its context.
- **Recursive sub-agent tree** — every agent gets a `super_agent` MCP tool and
  can spawn nested agents that spawn their own, rendered live as a lineage tree.
- **Survives restarts** — sessions run in detached workers persisted to
  Supabase; stopping the server doesn't kill the agents.
- **Two front-ends, one backend** — a SolidJS web UI and an ANSI TUI over the
  same websocket.
- **Project board** — a Projects tab backed by Linear (proxied through the
  Soda Straw gateway): projects ⇄ Linear projects, tasks ⇄ Linear issues.
- **The rave** — a pixel-art arena view where every session and sub-agent is a
  little character walking around, driven live by the session stream.

## Quick start

```bash
bun install                                # first time only
mkdir -p ~/.rave-of-agents                 # all secrets live here
cp .env.example ~/.rave-of-agents/.env     # then fill it in (Supabase + Linear creds)

bun run start                              # web UI  → http://localhost:4317
bun run tui                                # terminal UI (same backend)
```

No `ANTHROPIC_API_KEY` needed: the server points the SDK at your logged-in
`claude` CLI and reuses its credentials (set `CLAUDE_BIN` to override, or set
`ANTHROPIC_API_KEY` if you prefer). Change the port with `PORT=8080 bun run start`.

**Web:** *+ new agent* → describe the task → launch; type in the composer
(⌘/Ctrl+Enter) to message the running agent.
**TUI:** `j`/`k` select · `n` new · `m` message · `g` interrupt · `x` close · `q` quit.

## Scripts

| Command          | What it does                                              |
| ---------------- | --------------------------------------------------------- |
| `bun run start`  | Start the web server (bundles the client, serves the UI). |
| `bun run dev`    | Same as `start` (no file-watch — see note below).         |
| `bun run tui`    | Terminal UI; embeds a server if none is running.          |
| `bun run test`   | Super-tree reducer control test.                          |

> `dev` deliberately has no `--watch`: the server supervises long-lived agent
> sessions, and a reload would tear down every live `query()`. Restart manually
> after editing server code.

## Configuration

All secrets load from `~/.rave-of-agents/.env` (override the path with
`RAVE_OF_AGENTS_ENV_FILE`, or the runtime dir with `RAVE_OF_AGENTS_DIR`) so the
server works from any directory; a `.env` in the cwd or exported env vars take
precedence. See [`.env.example`](.env.example) and `app/env.ts`.

- **Supabase** (`SUPABASE_URL`, `SUPABASE_KEY`) — durable session storage.
- **Linear via Soda Straw** (`SODA_STRAW_GATEWAY_URL`, `SODA_STRAW_API_KEY`,
  `LINEAR_TEAM_ID`) — the project board. The server never talks to Linear
  directly; every read/write is proxied through the scoped Soda Straw gateway.

## Architecture

```
web (SolidJS) ─┐                 ┌─ AgentManager (supervisor): spawn + connect
tui (ANSI)    ─┴─ ws ─▶ Bun server ─┤   │
                        (hub,        │   └─ unix socket ─▶ session-worker (DETACHED)
                         fan-out)    │                       ├─ query() ── claude (SDK)
              outlives the server ──▶│                       ├─ MessageQueue → push
                                     │                       ├─ super-agent log → SuperTree
                                     │                       └─ persist to Supabase
                                     └─ on restart: re-attach to live worker sockets
```

The supervisor (`agent-manager.ts`) spawns one detached worker
(`session-worker.ts`) per session and relays its events to the websocket hub
(`server.ts`). Because workers are detached, the server is just a supervisor —
on startup it re-attaches to any worker that outlived it.

**Full details, file-by-file walkthrough, persistence model, Linear mapping, and
the verified behaviours live in [`app/README.md`](app/README.md).**

## Layout

```
app/            server, supervisor, worker, TUI, and the SolidJS client
app/client/     web UI (solid-js/html — no JSX/Vite)
app/public/     bundled client, styles, and rave sprites
db/migrations/  Supabase schema migrations
scripts/        tooling (e.g. sprite generation)
.claude/        the super-agent MCP skill the agents use to nest
```
