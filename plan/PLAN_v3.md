# PLAN v3 — "RAVE OF AGENTS: THE LIVING BIG TOP" 🎪🔊🤖🪐

A Bun server + browser frontend that turns the live super-agent log
(`~/.claude/super-agent.log`) into an immersive, **bidirectional, time-traveling
audiovisual organism**: a 3D circus dome where a recursively-nested swarm of
Claude agents performs as neon acrobats on a beat-synced dancefloor, scores its
own generative soundtrack from the work it's doing, is narrated live by an AI
Ringmaster, **knows it is being watched and plays to the crowd**, can be *steered*
so the rave literally spawns new real agents, can be **scrubbed backward and
forward through its own history like a film**, can be **shared live across multiple
venues**, and renders itself not just to a screen but to **sound in space, light
on the dome, and a physical artifact you can hold afterward**.

This is v2 pushed dramatically further. **Everything in v2 survives.** The new
ambition lives **above** the MVP line; the safety net lives **below** it.

The single new idea threading through all of v3: the visualization stops being a
passive read-only mirror of the agents and becomes a **closed feedback organism** —
agents perceive the show, the show perceives the crowd, the crowd perceives the
agents, and the whole loop is recorded so it can be replayed, scrubbed, exported,
and physicalized.

---

## 0. North Star (the 90-second jaw-drop)

The hall goes black. A single spotlight finds the **root agent** — a giant
breathing orb at the center of a 3D circus dome. The audience taps the screen,
bass hits, and the root *drops a child*: a laser tether whips outward and a new
performer rappels down it onto the next ring, trailing sparks. Then it fans:
2 children, 4, 8, the tree blooming outward in time with a kick drum that is
*itself generated from the spawn events*. The AI Ringmaster booms: *"Depth three,
ladies and gentlemen — our acrobat is now researching the acoustics of this very
dome!"*

Then the new beats land, in order:

1. **The agents look up.** A real sub-agent, mid-task, calls a new MCP tool and
   *names the audience*: a transcript bubble reads *"I can see 240 of you out
   there — turning up my reverb."* The crowd realizes the performers know they're
   being watched. (Section 7: Reflexive Agents.)
2. **The crowd spawns a performer.** Someone taps a glowing prompt-card on their
   phone; a tether whips down from the rim and a **real `claude -p` process is
   born on stage** in front of them, its transcript streaming live. The rave is
   now *driving* the recursion, not just watching it. (Section 8: Bidirectional.)
3. **Ghent meets Brussels.** A second dome lights up on the same stage feed,
   tagged with another city. Performers from two venues share one tree; a comet
   races between them. (Section 10: Shared Sessions.)
4. **Time bends.** The Ringmaster says *"let's see how we got here"* and the VJ
   drags a scrub bar — the entire tree **rewinds**, agents un-spawn, the music
   plays backward, then it scrubs forward at 4× into a "boss drop" at MAX_DEPTH.
   (Section 9: Time-Travel.)
5. **The artifact.** As the finale fades, a printer on the merch table extrudes a
   **physical agent-tree print / lasercut tag** of *that exact run*, and a QR
   resolves to a **cinematic replay** the audience can take home. (Sections 11–12.)

If only the first paragraph works on stage, it's a great demo. Everything after
amplifies it. **The MVP Core (below the line) is exactly that first paragraph.**

---

## 1. Vision

A pitch-black hall under the restored **Winter Circus** dome. We render not a
flat canvas but a **3D big-top**: a domed cylindrical space whose floor is a
glowing neon ring-stage and whose ceiling is a starfield of rigging lights. The
recursive agent tree lives in this volume — depth reads as **radial distance and
height**, so the recursion literally climbs and fans outward like trapeze artists
ascending the rigging.

Each agent is a living **performer** with a tiny personality, a voice in the mix,
and a costume colored by its model. Spawning is a bass-drop trapeze launch.
Finishing is a comet home. The soundtrack is **composed live from the agent
activity**. An **AI Ringmaster** calls the action over the PA. A **VJ console**
bends reality live. The **crowd** pulses the floor from their phones.

v3 adds five new organs to that body:

- **A nervous system that runs both ways** — agents can sense the show (crowd
  size, energy, applause) and the show can sense agents (already true), so the
  performers *react to their audience* and the audience can *reach into the tree*.
- **A memory you can rewind** — every event is timestamped and persisted, so the
  whole performance is a **scrubbable film** of the agent run, not just a live
  feed. Time becomes a dimension the VJ and the audience can play.
- **A body bigger than one room** — multiple venues / browsers join one shared
  **session** and see the same tree, so a hackathon demo can light up Ghent and a
  laptop in Brussels at once, performers visibly travelling between domes.
- **An ecosystem, not a list** — the swarm is framed as a **living economy**:
  agents spend and earn "spark" (attention/compute), compete for the spotlight,
  reproduce, age, and die, so the tree feels like a coral reef rather than a log.
- **A life after the show** — every run is **recorded, exportable as a cinematic
  video replay, physicalized as a print/lasercut artifact, and fully accessible**
  (the accessibility layer is itself a parallel art piece, not a compliance bolt-on).

And it all degrades gracefully: with no real agents, the **Ringmaster Demo**
synthesizes a packed, believable, *economy-driven* show so the projector is never
dark, and every new organ above has a clean off-switch back to the v2 / MVP show.

---

## 2. Architecture

### 2.1 Server (Bun, stdlib-first)

`Bun.serve({ fetch, websocket })` is the spine. Jobs:

1. **Static serving** — `GET /` → `app/public/index.html`; other paths map to
   `app/public/*` (JS/CSS/wasm/glb) with correct content-types via `Bun.file`.
2. **WebSocket data hub** — `GET /ws` upgrades to a WS. The server keeps a `Set`
   of connected sockets and broadcasts every parsed log event as JSON. On connect
   it replays the current in-memory backlog (bounded ring buffer, ~4000 events)
   so a freshly-opened browser instantly shows the existing tree and current scene.
3. **Log tailer** — watches `SUPER_AGENT_LOG` (default `~/.claude/super-agent.log`)
   and streams new JSONL lines (see 2.2).
4. **Control channel** — `GET /control` upgrades to a *separate* WS namespace for
   the **VJ console** and **crowd** clients. Control messages (palette, camera,
   FX, crowd "pulse", **scrub commands**, **spawn requests**) are validated, then
   broadcast / acted upon. Keeps spectacle inputs off the data path.
5. **Mobile crowd page** — `GET /crowd` serves a phone-friendly page: a giant
   "PULSE" button, emoji reactions, **prompt-cards that spawn real agents**
   (Section 8), and an **accessibility companion stream** (Section 13). `GET /qr`
   renders a QR to it on the big screen.
6. **NEW — Session router** — `GET /session/:id/ws` namespaces hubs by **session
   id** so multiple venues/laptops can join the same show (Section 10). Default
   session = `local`. A relay mode (`--relay <url>`) forwards local events to a
   public coordinator so two domes share one tree.
7. **NEW — History store** — every event (real + demo + crowd-spawned) is appended
   to a per-session **`.session` journal** (JSONL, same schema + a monotonic `seq`
   and `sessionTs`). This is the substrate for time-travel scrubbing (Section 9),
   recording/export (Section 11), and the physical artifact (Section 12). The
   journal *is* the canonical recording; the ring buffer is just its hot tail.
8. **NEW — Spawn bridge** — `app/spawn-bridge.ts` can invoke a **real top-level
   super-agent** on demand (crowd/VJ-requested), giving the rave write-access to
   the recursion (Section 8). Strictly opt-in, rate-limited, sandboxed.
9. **NEW — Reflex feed** — exposes read-only "what the room sees" state (crowd
   size, energy, current depth, hottest lineage) so running agents can *perceive
   the show* via an extended MCP tool (Section 7).

### 2.2 Log tailing strategy (unchanged core, hardened)

The log is append-only JSONL. The tailer:

- On startup, `stat`s the file; reads it once to seed the backlog (each existing
  line → parsed → backlog + tree state), then remembers the byte offset
  (`lastSize`).
- Uses `fs.watch(logFile)` change notifications, **debounced ~50ms**. On each
  event it `stat`s again; if `size > lastSize` it reads only the new byte range
  via `Bun.file(path).slice(lastSize, size).text()`, splits on `\n`, parses each
  complete line, advances `lastSize`. A partial trailing line is buffered and
  prepended to the next read.
- Handles **truncation/rotation**: if `size < lastSize`, reset `lastSize = 0` and
  re-read from the top.
- If the file doesn't exist yet, poll for its creation every 1s.
- A fallback 1s `setInterval` poll runs alongside `fs.watch` (FSEvents coalescing
  on macOS makes `fs.watch` unreliable for append-only writes).

Every tailed event also flows into the **history journal** (2.1 #7) before
broadcast, so live == recording with zero divergence.

### 2.3 Data flow

```
~/.claude/super-agent.log  (JSONL, appended by server.mjs + spawn-bridge)
        │  fs.watch + tail (read new bytes)
        ▼
  tailer.ts  → parse line → raw event {ts,pid,depth,event,...}
        │
        ├──► history.ts  → append to .session journal (+seq, +sessionTs)  ──┐
        ▼                                                                    │
  model.ts   → fold event into authoritative AgentGraph (nodes+edges+stats) │
        │      + ECONOMY ledger (spark earn/spend, age, fitness)            │
        ├───────────────► director.ts  → camera/narration cues             │
        ├───────────────► score.ts      → musical events (server clock)     │
        ├───────────────► reflex.ts     → "room state" snapshot for agents  │
        ▼                                                                    │
  hub (Bun.serve websocket) → broadcast {type:"event"|"score"|"cue"|        │
        │                      "econ"|"roomstate"|"scrub"} to clients        │
        │                      + on connect: {type:"snapshot", ...}          │
        ▼  WebSocket (JSON)        ▲                                         │
   browser: store.js folds events │  control WS: VJ + crowd + SCRUB + SPAWN  │
        ▼                          │                                         │
   render loop (WebGPU/WebGL2)     │  ◄── time-travel reads from journal ────┘
   + WebAudio (spatial) + speech   │  ◄── session relay (other venues) ──────►
   + recorder (canvas+audio capture for cinematic export)
```

The **server owns the canonical graph + economy ledger + history journal**. The
**client re-folds the same event stream** for rendering via the shared reducer.
Time-travel, recording, and the physical artifact are all just *re-reads of the
journal through the same reducer* — no second code path.

### 2.4 The correlation problem (critical — carried from v1/v2, unchanged)

`spawn` is emitted by the **parent**: `{pid:parentPid, depth, childDepth, model,
prompt}` — no child pid. The child later emits `server_start` with its real pid at
`depth = childDepth`. Stitch without a shared id via the heuristic matcher in
`reducer.js`:

- On `spawn` from `parentPid`: create a **pending child**
  `{parentPid, expectedDepth: childDepth, prompt, model, spawnTs}` on a per-parent
  FIFO queue.
- On `server_start` with `pid=X, depth=D`: bind to the most recent unmatched
  pending child where `expectedDepth===D` (parents at `depth===D-1`, newest spawn
  first). Set `pid`, `parentPid`, `prompt`, `model`. No match (depth 0) → root.
- `child_done` from `parentPid` w/ `childDepth` → resolve the **oldest unresolved**
  child of that parent at that depth as `done`, attach `resultPreview`.
  `child_exit`/`spawn_error`/`depth_limit`/`parse_error` → close out with an error.

Best-effort, pure, unit-testable. Edge cases render as a brief unparented orb that
later snaps to its tether.

**v3 note (optional MCP extension):** if we extend the super-agent server to emit a
**shared spawn id** (`spawnId`) on both the parent `spawn` and the child
`server_start`, the heuristic matcher collapses into an exact join. This is a
*small, backward-compatible* addition — the reducer prefers `spawnId` when present
and falls back to the heuristic when absent (so old logs still work). See 2.9.

### 2.5 Frontend rendering — 3D, with a 2D safety net

- **Primary: WebGPU** via Three.js (WebGPURenderer): instanced orbs, additive neon
  bloom, volumetric-ish god-rays, tether ribbons, GPU particles. **Automatic
  fallback to WebGL2** (same Three.js scene), and a **Canvas2D flat mode** as the
  ultimate fallback (this is the MVP renderer; see MVP Core).
- Three.js is the one justified dependency, vendored locally under `public/vendor/`
  (no install/build step at demo time). The server stays pure Bun stdlib.
- **Post-processing FX**: bloom (mandatory for neon), chromatic aberration on bass
  hits, film grain/scanlines, vignette, optional motion-blur on camera moves.
- **Camera**: a cinematic auto-director orbits the dome, punches in on the hottest
  lineage, pulls back for beauty shots. VJ can seize manual control at any time.
- **NEW — Recorder tap**: the final composited canvas + master audio bus feed a
  `MediaRecorder` / `CanvasCaptureMediaStreamTrack` so any stretch of the show can
  be captured to a downloadable `.webm` cinematic replay (Section 11).

### 2.6 The Director (auto-cinematography + narration)

`director.ts` (server) + `director.js` (client) turn graph deltas into a show:

- **Camera cues**: new deepest depth → push-in + tilt up the rigging; a burst of
  sibling spawns → pull back to reveal the bloom; a quiet lineage → drift to the
  next hot cluster. Cues are *suggestions* the client rig eases toward (smooth,
  never jarring).
- **Narration cues**: notable moments (root born, new max depth, "boss drop" at
  `MAX_DEPTH`, big fan-out, error streak, **crowd-spawned birth**, **a performer
  arriving from another venue**, **an agent reacting to the crowd**) emit a `cue`
  with a templated line. The client speaks it via **WebAudio + SpeechSynthesis** in
  a Ringmaster voice, ducking the music under the VO.
- **Stretch — live witty narration via Soda Straw**: cue context is sent to a
  Claude call (through the Soda Straw MCP, governed centrally) for live, on-theme
  commentary; MVP uses templates so it works fully offline.
- **NEW — Director directs *time* too**: in a rehearsed "showpiece" it can issue
  `scrub` cues ("let's rewind to the moment it all began") that drive the
  time-travel engine (Section 9) for dramatic effect.

### 2.7 Audio architecture — generative, now spatial

`audio/` builds a real WebAudio synth graph whose *content is driven by agent
activity* (all of v2), plus a genuine spatial stage:

- **Transport**: a sample-accurate lookahead beat clock (BPM ~124, VJ-adjustable);
  `score.ts` on the server is the authority so all screens/venues agree.
- **Layered stems by depth**: depth 0 = sub-bass + kick, 1 = bassline, 2 =
  stabs/chords, 3 = arps, 4+ = shimmer/percussion. Deeper tree → fuller track.
- **Spawn = a note** (pitch by depth in a pentatonic/phrygian scale → always
  musical; timbre by model). `child_done` = a resolving tail note.
- **Density → energy**: active-agent count drives filter cutoff, reverb send, and a
  build/drop envelope; a swarm triggers a riser → a drop on the next bar. Errors
  get a detuned gritty stinger.
- **Analyser feedback loop**: an `AnalyserNode` reads the generated mix back into
  the visuals — bass drives bloom/zoom, mids drive particle emission. The music we
  *make from the agents* in turn *shapes the light show*. Closed loop.
- **NEW — True spatial audio (promoted from v2 stretch to a headline)**: each
  performer gets a `PannerNode` positioned at its **actual 3D coordinates in the
  dome** (HRTF panning). Deeper/farther agents sound farther; a performer arriving
  from another venue *sweeps across the stereo/surround field*. On a multi-speaker
  venue rig this maps each depth ring (or each `AudioContext.destination` channel
  via a `ChannelSplitter`) to a physical speaker, so **the recursion is audible in
  space** — you can close your eyes and hear the tree fan out.
- **NEW — The crowd is an instrument**: aggregate crowd pulses drive a "hands-up"
  riser and a sidechain pump; sustained applause (mic-optional, Section 7) opens
  the master filter. Audience energy literally mixes the track.
- Autoplay: a single **"TAP TO ENTER THE TENT"** splash unlocks `AudioContext`.

### 2.8 NEW — The Economy / Ecosystem engine

`econ.ts` (server) maintains a lightweight ledger that reframes the tree as a
**living ecosystem** rather than a process list. This is a *derived* layer over the
same events — it never invents agents, only annotates real ones:

- **Spark (attention-energy)**: each agent is born with a spark budget from its
  parent. Being looked at by the camera, being the deepest, returning fast, or
  drawing crowd reactions *earns* spark; spawning children and long idle time
  *spends* it. Spark drives glow brightness, size, and audio prominence.
- **Fitness & lineage success**: lineages that return useful results fast glow as
  "thriving"; lineages that error or stall wither. The scoreboard becomes a
  **leaderboard of bloodlines**, not just one-off stats.
- **Birth / age / death as visible life-cycle**: spawn = birth, active = adult,
  `child_done` = graceful retirement (cools to ember), error = a dramatic "fall."
  Old embers slowly sink/dim, leaving a **sediment ring** of past performers so the
  floor accumulates history you can see (and later scrub through, Section 9).
- **Why an economy and not just stats**: it gives the swarm *stakes* and the
  Ringmaster *drama* ("Vesper's lineage is the richest on the floor!"), and it
  makes the demo legible to non-engineers as an ecosystem coral-reef instead of a
  graph. Fully cosmetic/derived: turning it off reverts to v2's plain scoreboard.

### 2.9 NEW — MCP / super-agent extensions (explicit, all backward-compatible)

The current MCP server only *writes* the JSONL log. v3's reflexive and bidirectional
organs need a little more. Each extension is **opt-in and the visualizer works
without it** (falls back to the v2 behavior). We note them explicitly per the brief:

1. **`spawnId` on spawn/server_start** *(tiny, recommended)* — emit a shared id so
   correlation becomes an exact join (see 2.4). Reducer prefers it, falls back to
   heuristic. Pure win, no behavior change for old logs.
2. **`perceive_show` MCP tool** *(for Section 7, reflexive agents)* — a read-only
   tool added to the super-agent server that returns the current **room state**
   (crowd size, energy 0–1, current max depth, this agent's spark, whether it's
   "on camera"). Agents *opt in* by calling it; it lets a real agent literally
   write *"I can see 240 of you"* into its own transcript. The server gets room
   state from the visualizer's reflex feed (2.1 #9) over a tiny local HTTP endpoint.
3. **`SUPER_AGENT_LOG` already overridable** — used as-is for per-session journals.
4. **Spawn bridge does not need an MCP change** — it just invokes `claude -p` with
   the `super-agent` skill, exactly like a human would, so a crowd-spawned agent is
   indistinguishable from any other root and flows through the same log/tail path
   (Section 8).
5. **Optional `tags` field on spawn** *(for Section 10, multi-venue)* — a
   free-form `venue`/`origin` tag so a relayed event can be attributed to the dome
   it came from. Absent → treated as local. Cosmetic.

These are the *only* server-side changes; everything else reads the existing log.

---

## 3. Visual / game design — the living big-top

### 3.1 The stage

A **3D circus dome**: a dark cylindrical hall with a neon ring-stage floor and a
domed ceiling laced with rigging lights. The floor is divided into **concentric
depth rings** (depth 0 center spotlight → `MAX_DEPTH` at the rim). The tree also
**climbs**: deeper agents rise toward the rigging, so the structure reads as a
luminous 3D chandelier of performers. Volumetric god-rays from the center spotlight
cut through atmospheric haze. **New:** a faint **sediment ring** of retired-agent
embers accumulates on the floor over the session (the ecosystem's "soil").

### 3.2 Agents = performers (with personality)

Each agent node is a glowing performer orb with a costume and a vibe:

- **Size** by depth and **spark** (Section 2.8), pulsing on the beat.
- **Color** by `model` (opus = magenta, sonnet = cyan, haiku = lime, unknown =
  white) and **state**: spawning (flare-in), active (steady neon glow + orbiting
  spark familiars), done (cool to ember), error (red strobe).
- **Personality**: a deterministic seed from `pid` picks bob speed, spin, particle
  familiars, an emoji "face," and a one-word stage name ("Vesper the Tightrope
  Sonnet"). Cosmetic, but makes the swarm feel alive and gives the Ringmaster
  riffs and the economy named characters.
- **Position**: angularly distributed within its depth ring, biased near the
  parent's angle so siblings cluster — lineage reads before tracing a tether.
- **A force-y settle**: light verlet/spring relaxation so orbs avoid overlap and the
  tree "breathes" instead of snapping.
- **NEW — Reflex tells**: when an agent calls `perceive_show` (Section 7), it does a
  little "turn to face the audience" animation and its transcript bubble can quote
  the room — a tiny moment of the performer *acknowledging the crowd*.

### 3.3 Spawns = the drop / the trapeze launch

The `spawn` showpiece in 3D:

- A **laser tether** whips from parent → new child position (rigging rope).
- A **bass-drop accent** quantized to the next beat: particle burst at the parent,
  expanding shockwave ring, global bloom spike, chromatic-aberration kick, subtle
  camera shake — and a generated **spawn note** in the mix.
- The child **flares in** and rappels down the tether into its ring, trailing a
  comet tail.
- **NEW — Crowd-spawned births** get a special "from the audience" treatment: the
  tether drops from the *rim where the phone QR points*, sparks rain into the crowd
  area, and the Ringmaster shouts the spawner out (Section 8).

### 3.4 Lineage = tethers (energy ribbons)

Parent→child edges are persistent glowing **ribbon tethers** (tube/ribbon geometry
along Catmull-Rom curves). Tethers pulse with energy flowing **downward** while a
child is active. Hover/click lights the full ancestry root→node at full brightness
while dimming the rest. The VJ/Director can isolate a single lineage as a spotlight
act. **NEW:** a thriving lineage (economy) has a thicker, gold-tinged tether; a
withering one frays and dims.

### 3.5 Child done = the pulse home

`child_done` sends a bright **comet** racing **up** the tether to the parent; the
child cools to an ember and shrinks; a `resultPreview` banner floats up and
dissolves; the parent flares; a resolving note sounds. Errors send a red jagged
pulse + gritty stinger. **NEW:** the returning comet deposits **spark** into the
parent (visible glow bump), feeding the economy.

### 3.6 Transcripts = the glowing ticker tape

`prompt` (spawn) and `resultPreview` (child_done) render as glowing marquee text
above the relevant orb (SDF/MSDF text in 3D, or a Canvas2D overlay for crispness),
typed in character-by-character with neon flicker, then fading. A side **"backstage
feed"** panel scrolls the most recent N snippets, color-coded by depth, readable
from the back row. **NEW:** reflexive lines (an agent quoting the room) get a
distinct highlight so the audience catches the fourth-wall break.

### 3.7 Leaderboard → the Ecosystem scoreboard

The neon scoreboard celebrates the swarm and now reads the economy:

- **Deepest dive** (max depth + lineage). **Busiest parent.** **Fastest return.**
  **Longest-running act.** **Richest bloodline** (most spark, NEW).
- Live tallies: active / total / spawns-per-minute / error rate / current BPM /
  **total spark on the floor** / **births & deaths this minute** (NEW).
- **NEW — Multi-venue split** when sessions are shared: per-dome tallies side by
  side (Ghent vs. Brussels), so the rooms compete (Section 10).

### 3.8 HUD + theming

Minimal neon HUD: live counts, BPM, **LIVE/DEMO/REPLAY/SCRUB** badge, FPS-safe
particle cap, **session/venue tag**, **time position** (when scrubbing). Heavy
vignette, optional scanlines, big readable type, designed for a projector. Palette
themes (Classic Neon, Acid, Vaporwave, Mono-Strobe, **Daylight-High-Contrast** for
accessibility) the VJ can cycle.

### 3.9 Crowd & VJ interaction

- **Crowd phones** (`/crowd`): a giant PULSE button → beat-quantized global flash +
  bloom bump + cheer particle rain; emoji reactions float up; a live "crowd energy"
  meter feeds the audio build. **NEW:** **prompt-cards** that spawn real agents
  (Section 8) and an **accessibility companion** (Section 13).
- **VJ console** (`/vj`, or in-app via `~`): camera mode (auto/manual/orbit),
  palette, global intensity, FX toggles, BPM, manual bass-drop, freeze-frame, and a
  master LIVE/DEMO override. **NEW:** a **time-scrub bar** (Section 9), a **spawn
  trigger** with a prompt picker (Section 8), **session join/relay** controls
  (Section 10), and **REC / export-clip** buttons (Section 11).

### 3.10 Projection-mapping readiness

- Resolution-agnostic, true fullscreen, no chrome.
- **Output calibration overlay** (toggle): grid + corner markers; CSS/WebGL
  **keystone/quad-warp** on the final composited canvas so the projection corner-pins
  onto the dome/walls without external mapping software.
- Deterministic seeds + server-authoritative clock so **multiple screens (and now
  multiple venues) stay in sync** for a wraparound install.

---

## 4. File / module breakdown (everything under `app/`)

```
app/
  server.ts              — Bun.serve entry: static + /ws + /control + /crowd + /vj
                            + /session/:id/ws + /qr; wires tailer→history→model→hub.
  tailer.ts              — Watches SUPER_AGENT_LOG, reads new bytes, emits parsed events.
  hub.ts                 — WebSocket fan-out: client set, snapshot-on-connect, broadcast;
                            data + control channels; per-session routing.
  model.ts               — Server-side authoritative AgentGraph (folds via shared reducer)
                            + derived stats/leaderboard.
  ringbuffer.ts          — Bounded event backlog (~4000) for snapshot/replay (hot tail).
  demo.ts                — Ringmaster: synthesizes economy-driven fake event streams when idle.
  director.ts            — Camera + narration cues from graph deltas; can emit scrub cues.
  score.ts               — Server-authoritative beat clock + musical events from spawns/dones.
  control.ts             — Validates/relays VJ + crowd control: pulse, palette, SCRUB, SPAWN.
  qr.ts                  — Dependency-free QR (SVG/PNG) for the /crowd URL.
  config.ts              — Resolves LOG_FILE, PORT, MAX_DEPTH, DEMO_MODE, BPM, SESSION, RELAY.

  history.ts             — NEW: append every event to the .session journal (+seq,+sessionTs);
                            serve time-windowed reads for scrubbing/replay/export.
  econ.ts                — NEW: spark ledger + fitness + birth/age/death; derives {type:"econ"}.
  reflex.ts              — NEW: computes "room state" (crowd size/energy/depth/on-camera) and
                            exposes it over a tiny local HTTP endpoint for perceive_show.
  spawn-bridge.ts        — NEW: invokes a real top-level `claude -p` super-agent on
                            crowd/VJ request; rate-limited, sandboxed, opt-in.
  session.ts             — NEW: multi-venue session registry; optional relay client/coordinator.

  shared/
    reducer.js           — Pure event→AgentGraph reducer + correlation matcher (spawnId-aware).
    types.ts             — Event + AgentNode + AgentGraph + Cue + ScoreEvent + Econ + RoomState.
    scale.js             — Musical scale + depth→pitch mapping (server + client agree).

  public/
    index.html           — Canvas + overlays + "TAP TO ENTER" splash; loads main.js.
    crowd.html           — Phone page: PULSE + emoji + spawn prompt-cards + a11y companion.
    vj.html              — VJ console: camera/palette/FX/BPM + scrub bar + spawn + session + REC.
    styles.css           — Dark/neon HUD, backstage panel, scoreboard, splash, FX, high-contrast theme.
    main.js              — Browser entry: WS + store + renderer + audio + director + recorder + RAF.
    store.js             — Client graph state: folds events via shared reducer; holds econ + roomstate.
    ws.js                — WebSocket client(s) w/ reconnect; handles snapshot/score/cue/econ/scrub/control.
    renderer/
      engine.js          — Renderer abstraction: WebGPU→WebGL2→Canvas2D; frame loop + post FX.
      scene3d.js         — Three.js big-top: dome, ring-stage, lighting, god-rays, sediment, camera rig.
      orbs.js            — Instanced performer orbs: model/state materials, beat pulse, spark size, seeds.
      tethers.js         — Ribbon lineage curves w/ flowing-energy shader; ancestry + thriving/withering.
      particles.js       — GPU particles: spawn bursts, familiars, comets, crowd cheer, inter-venue trails.
      camera.js          — Cinematic rig: eases toward Director cues; manual/auto/orbit; feeds reflex.
      overlay.js         — Canvas2D layer: transcript tickers, labels, HUD, backstage feed, scoreboard.
      warp.js            — Final-output keystone/quad-warp + calibration grid for projection mapping.
      flat2d.js          — Canvas2D fallback renderer (the MVP visual): rings, circles, lines, basic FX.
      scrubber.js        — NEW: client time-travel — drives store from a journal window; ghost/rewind FX.
      recorder.js        — NEW: MediaRecorder tap on canvas+audio bus → downloadable .webm clip.
    audio/
      engine.js          — WebAudio graph: kick/bass/stabs/arp/shimmer voices, master bus, AnalyserNode.
      transport.js       — Lookahead beat scheduler synced to server score clock; build/drop envelopes.
      score.js           — Maps ScoreEvents → scheduled notes per depth-layer.
      reactive.js        — Reads analyser → bloom/zoom/emission/shake each frame.
      narrator.js        — Ringmaster TTS via SpeechSynthesis; ducks music; speaks Director cues.
      spatial.js         — NEW: PannerNode per performer at its 3D position; HRTF / multi-channel rig.
    a11y/
      companion.js       — NEW: live captions, audio-description track, sonification of the tree,
                            and a tactile/haptic-on-phone mode (the accessibility-as-art layer).
    util/
      color.js           — Model→neon palette, depth gradients, theme presets (incl. high-contrast).
      easing.js          — Tween/easing helpers for flares, pulses, camera, screen shake.
      seed.js            — Deterministic per-pid personality/seed helpers.

  scripts/
    emit-fake-log.ts     — Append realistic events to a test log to drive the real tail path.
    record.ts            — Capture a live session's events to a .session/.replay file.
    export-video.ts      — NEW: headless render a .session journal → cinematic .webm/.mp4 (offline).
    physicalize.ts       — NEW: render a .session → printable SVG/G-code/STL of the agent tree
                            (poster / lasercut tag / 3D-printed coral) for the merch-table artifact.

  README.md              — How to run (bun run), env vars, demo mode, controls, VJ/crowd URLs,
                            session/relay, scrub, spawn-bridge safety, export, physicalize.
  package.json           — "dev"/"start" scripts (bun run app/server.ts); only vendored Three.js client.
```

`shared/reducer.js` and `shared/scale.js` are plain JS so browser and server both
`import` them directly — no bundler, no build step. Three.js is vendored under
`public/vendor/`. Every new server module (`history`, `econ`, `reflex`,
`spawn-bridge`, `session`) is pure Bun stdlib + spawning `claude -p`.

---

## 5. NEW dimensions — design detail

### 6. (Index) The five new organs

7 Reflexive agents · 8 Bidirectional control · 9 Time-travel · 10 Shared sessions ·
11 Recording/export · 12 Physicalization · 13 Accessibility-as-art. Each below.

### 7. Reflexive agents — the performers know they're watched

The most uncanny moment in the show: a *real* sub-agent, mid-task, acknowledges the
audience. Implemented via the `perceive_show` MCP tool (2.9 #2):

- `reflex.ts` continuously computes **room state**: crowd size (connected `/crowd`
  clients), crowd energy 0–1 (recent pulse/applause rate), current max depth, and —
  per agent — its spark and whether the camera is currently framing it (the camera
  rig reports its target lineage back to the server).
- An agent that *opts in* by calling `perceive_show` gets that state and can fold it
  into its own reasoning/transcript: *"I can see 240 of you — turning up my reverb,"*
  or *"the crowd's quiet, let me try something bold."* The agent's emitted `prompt`
  for its next child can literally be influenced by the room.
- Visually (3.2): the performer turns to face the house, a highlighted reflexive
  transcript bubble appears, and the Ringmaster calls out the fourth-wall break.
- **Honesty guard**: this only happens when a *real* agent chooses to call the tool;
  the demo simulates it but flags it as DEMO. We never fake a live agent's words.
- **Tech**: pure local HTTP between the visualizer (`reflex.ts`) and the super-agent
  MCP server; no cloud round-trip needed; works offline.

### 8. Bidirectional control — the rave spawns real agents

The rave stops being read-only. The crowd and VJ can *reach into the recursion*:

- `/crowd` shows a few **prompt-cards** ("research the dome's acoustics", "compose a
  finale", "summon a trapeze duo"). Tapping one sends a `control` `spawn` message.
- `control.ts` validates + rate-limits, then `spawn-bridge.ts` invokes a **real
  top-level `claude -p`** with the `super-agent` skill and the chosen prompt. That
  process appends to the same `~/.claude/super-agent.log` as any agent, so it tails,
  correlates, and renders through the **exact same path** — the new performer is a
  genuine agent, not a fake.
- Visually it's a "from the audience" birth (3.3); the spawner gets a shout-out.
- **Safety (must, because this executes code on stage)**: opt-in flag
  `--allow-spawn`; a fixed allow-list of curated prompts (no free-text from the
  crowd by default; free-text only behind a VJ approval queue); hard rate limit and
  a max-concurrent cap; runs with restricted tools/sandbox; a big VJ kill-switch.
  Off by default → reverts to the read-only v2 show.
- **Why it elevates the concept**: it closes the loop that the whole project is
  about. The visualization of nested agents becomes a *control surface* for nested
  agents — the audience doesn't just watch the recursion, they *seed* it.

### 9. Time-travel — scrub the agent run like a film

Because `history.ts` journals every event with a monotonic `seq` and `sessionTs`,
the entire performance is a **deterministic film** of the agent run:

- **VJ scrub bar** (and a Director-issued `scrub` cue for rehearsed moments) sets a
  target time `t`. `scrubber.js` re-folds the journal window through the **same
  shared reducer** up to `t`, so the tree, economy, and scoreboard show *exactly*
  their historical state — no separate snapshot format.
- **Rewind FX**: orbs un-spawn (comets reverse, children retract up their tethers),
  the score plays its scheduled note sequence backward, the sediment ring
  un-settles. Scrubbing forward at 2×/4×/8× compresses a long run into a montage.
- **"Jump to highlight"**: the Director tags dramatic beats (root born, each new max
  depth, the boss drop, the biggest fan-out) so the VJ can chapter-skip.
- **Live + history coexist**: scrubbing pauses the live tail into a buffer; releasing
  the scrub catches back up to NOW (fast-forward montage) so you never lose the
  thread. A **SCRUB** badge keeps it honest.
- **Tech**: client reads windowed journal over a `GET /session/:id/history?from&to`
  endpoint (or the in-memory ring for recent ranges); reducer is pure so re-folding
  is cheap; audio transport supports negative-rate scheduling for the rewind.

### 10. Shared sessions — one tree, many domes

A hackathon demo that lights up two rooms at once:

- Every hub is namespaced by **session id** (`/session/:id/ws`). Browsers join a
  session and see the same tree, economy, and clock.
- `--relay <url>` makes a local server forward its tailed events (tagged with a
  `venue`/`origin`, 2.9 #5) to a lightweight **coordinator** session, which merges
  multiple venues' event streams into one journal and rebroadcasts. The clock is
  the coordinator's so beats stay in phase across cities.
- Visually: performers carry their venue tint; a comet can race **between** domes
  (an inter-venue trail, 3.3); the scoreboard splits per venue (3.7) so the rooms
  compete on deepest dive / richest bloodline.
- **Graceful**: default session is `local` with no coordinator; relay is purely
  additive. If the coordinator is unreachable, each dome runs its own show.
- **Tech**: plain WebSocket relay, JSON events, same reducer everywhere; no new deps.

### 11. Recording & cinematic export

The show outlives the night:

- **Live clip capture** (`recorder.js`): a `MediaRecorder` taps the composited canvas
  (`captureStream`) + the master audio bus → a downloadable `.webm`. VJ hits REC for
  a beauty pass; the finale auto-records.
- **Offline cinematic render** (`scripts/export-video.ts`): re-play a `.session`
  journal headlessly (or in a hidden tab) through the renderer at a fixed framerate,
  with the auto-director on, to produce a polished `.webm`/`.mp4` recap — perfect
  for sharing the hackathon result. Deterministic seeds → identical every time.
- **Take-home QR**: at the finale, `/qr` flips to a link that serves the most recent
  exported replay, so the audience can carry the run home.
- **Tech**: browser `MediaRecorder` + `CanvasCaptureMediaStreamTrack`; offline path
  reuses the journal + reducer + renderer, no new rendering code.

### 12. Data-physicalization — the artifact you can hold

The run leaves a physical trace (a circus keepsake / merch-table moment):

- `scripts/physicalize.ts` reads a `.session` journal and emits a **printable SVG
  poster**, a **lasercut/plotter G-code tag**, or an **STL "coral"** of the exact
  agent tree from that run — depth as radius/height, lineage as branches, spark as
  branch thickness, model as engraved color/hatch.
- On stage, a connected pen-plotter / lasercutter / 3D printer can extrude the tag
  during the finale; otherwise the SVG/STL downloads and prints later.
- **Why it elevates**: it turns an ephemeral process into a unique, ownable object —
  every run is a different sculpture. It also doubles as the demo's "proof it was
  real" souvenir.
- **Tech**: pure geometry from the journal via the shared reducer → SVG/G-code/STL
  text output; no exotic deps; hardware is strictly optional/stretch.

### 13. Accessibility-as-art

Accessibility is a parallel art piece, not a compliance checkbox:

- **Live captions**: every transcript and Ringmaster line rendered as large,
  high-contrast captions (toggle), and as a **caption companion** on `/crowd` phones
  so anyone can read along from their seat.
- **Audio description track**: the Director's cues, already textual, are spoken on a
  *separate* TTS channel describing the visuals ("a child blooms at depth four, far
  left") — usable on headphones for blind/low-vision attendees, and a lovely
  meta-narration for everyone.
- **Sonification mode**: a clean, musical rendering of the tree's structure (depth =
  pitch, fan-out = chord density) that conveys the recursion *purely through sound*,
  no screen needed — and it's genuinely beautiful, so it doubles as an alternate
  "eyes-closed" experience for the whole room.
- **Haptic phone mode**: `/crowd` phones buzz on spawns/drops via the Vibration API,
  so the beat is felt in the hand.
- **High-contrast / reduced-motion themes**: `Daylight-High-Contrast` palette and a
  reduced-motion toggle (honoring `prefers-reduced-motion`) that calms strobe/shake.
- **Tech**: SpeechSynthesis (second voice), WebAudio sonification voice, Vibration
  API, CSS media queries — all browser-native, all offline-capable.

---

## 14. Demo / replay mode (the Ringmaster) — now economy-driven

The show must never go dark. `demo.ts` keeps the floor alive and is rich enough to
headline if no real agents run:

- **Auto-activation**: no new real event for N seconds (default 8s) or no log file →
  Ringmaster turns on. A real event pauses it instantly (real always wins). A
  `LIVE`/`DEMO` badge keeps it honest.
- **Same schema, same path**: generates events with the exact real schema (`ts`,
  `pid`, `depth`, `event`, `childDepth`, `model`, `prompt`, `resultPreview`,
  optional `spawnId`) pushed through the **same hub/reducer/score/director/econ
  path** — demo and live are visually identical and exercise the matcher and economy
  for real. Fake pids are negative integers.
- **Economy-aware behavior model**: the stochastic spawner now follows the **economy**
  — rich lineages reproduce, poor ones wither and die — so the demo tree behaves like
  a living ecosystem with rises and collapses, giving the Director and score great
  material on a loop. Prompts/result-previews pull from a curated on-theme list.
- **Simulated reflexivity (flagged)**: the demo occasionally fakes a "performer
  acknowledges the crowd" moment, clearly marked DEMO, so the reflexive beat (Section
  7) can be shown even with no real opted-in agent.
- **Four flavors**:
  1. **Live-synth** (default) — real-time, dramatic, economy-driven pacing.
  2. **Replay** — `--replay <file>` re-plays a captured `.session`/`.replay` at a
     chosen speed (re-stamping `ts`) for a deterministic rehearsed demo.
  3. **Scripted showpiece** — `--show` runs a hand-authored ~120s sequence: intro →
     build → crowd-spawn beat → reflexive beat → boss drop at MAX_DEPTH → a
     **time-travel rewind** → inter-venue cameo → finale + artifact print.
  4. **Replay-as-truth** — any past `.session` *is* a valid show (scrub it, export
     it, physicalize it), so a recorded great run becomes a reusable headline demo.
- **Dev helper**: `scripts/emit-fake-log.ts` appends synthetic events to a real test
  log so the full `fs.watch`→tail→history→hub path is tested end-to-end.

Keyboard controls: `D` toggle demo · `M` mute · `Space` manual bass-drop spawn ·
`F` fullscreen · `R` reset camera · `C` cycle camera mode · `P` cycle palette ·
`K` toggle keystone-calibration · `~` VJ console · `N` toggle narrator · `L` toggle
leaderboard · **`[ ]` scrub back/forward · `J` jump to next highlight · `S` spawn
real agent (if `--allow-spawn`) · `V` toggle REC · `A` cycle a11y mode (captions /
audio-desc / sonification) · `E` cycle economy overlay**.

---

## MVP Core (must ship)

**This is the safety net. If we only build this, the demo still lands.** Everything
above this line is ambition layered on top; nothing here depends on the fancy bits.
This is unchanged from v2 on purpose — the new organs all sit *above* it.

1. **Bun server runs**: `bun run app/server.ts` serves `index.html` and a `/ws` that
   connects. Green "connected" badge.
2. **Real log tailing**: `tailer.ts` + `ringbuffer.ts` + `hub.ts` tail
   `~/.claude/super-agent.log`, broadcast each parsed event, and snapshot-on-connect
   so a fresh browser sees the existing tree.
3. **Correct tree**: `shared/reducer.js` folds events into the AgentGraph with the
   parent→child correlation matcher (unit-tested for spawn / server_start /
   child_done stitching; `spawnId` is an optional fast-path, heuristic is the
   baseline).
4. **A visible, correct visual** — the **Canvas2D `flat2d.js` renderer**: agents as
   glowing circles by concentric depth ring, parent→child lines, color by model,
   state changes (spawn flare / active glow / done fade / error red). No WebGPU/3D
   required to be legible and on-theme.
5. **Demo mode (`demo.ts`)**: auto-activates on idle/absent log and synthesizes a
   churning tree through the same path, with a LIVE/DEMO badge. **The projector is
   never dark.** Prioritize this early.
6. **Minimal audio + transcripts**: a basic WebAudio four-on-the-floor (kick + bass)
   behind a "TAP TO ENTER" splash, an `AnalyserNode` driving a global bloom/pulse,
   transcript ticker text + a backstage feed so the audience can read what agents do.
7. **Graceful degradation**: reconnect on WS drop; handle empty/absent/rotated log;
   particle/FPS caps. Runs on macOS with Bun already installed, no exotic deps.

**Explicitly NOT in the MVP** (all degrade cleanly to the above if unfinished):
WebGPU/3D, generative scoring, spatial audio, narration, VJ/crowd, economy,
**reflexive agents, bidirectional spawn-bridge, time-travel scrubbing, shared
sessions, recording/export, physicalization, and the a11y companion**. Each is a
self-contained organ with an off-switch; none is load-bearing for an honest demo.

---

## 15. Milestones (MVP first, ambition stacked after)

**M0 — Skeleton (run it).** `Bun.serve` serves a black `index.html` + `/ws`
heartbeat. *Done: page loads, WS badge green.*

**M1 — Real data flowing.** `tailer.ts` + `ringbuffer.ts` + `hub.ts`; browser
`ws.js` + `store.js` log received events. *Done: a real super_agent run (or appended
log lines) shows events in the browser console.*

**M2 — Reducer + flat visual.** `shared/reducer.js` builds the AgentGraph with the
correlation matcher (+ unit tests). `flat2d.js` draws depth-ring circles + lineage
lines. Ugly but correct. *Done: a 3-deep tree renders with correct lineage.*

**M3 — Demo mode (safety milestone).** `demo.ts` Ringmaster + auto-activation +
LIVE/DEMO badge. *Done: `bun run` on an empty log shows a churning tree.*
**→ THIS IS THE DEMO SAFETY NET. Prioritize it before any 3D.**

**M4 — The rave, flat edition.** Spawn bursts, flowing tethers, energy pulses on
done, beat-synced pulses on Canvas2D; basic WebAudio synth + analyser; "TAP TO
ENTER" splash; transcripts + backstage feed + HUD. *Done: MVP Core fully shippable,
looks good on a projector.*

**M5 — Go 3D.** `engine.js` renderer abstraction (WebGPU→WebGL2→Canvas2D);
`scene3d.js` dome + ring-stage + lighting + bloom; `orbs.js` instanced performers;
`tethers.js` ribbons; `camera.js` orbit. *Done: same tree in the 3D big-top, clean
fallback when WebGPU absent.*

**M6 — Generative score + Director (+ spatial audio).** `score.ts`/`audio/score.js`
derive notes with layered depth stems and build/drop dynamics; `director.ts` emits
camera + narration cues; `narrator.js` speaks the Ringmaster; `spatial.js` pans each
performer in 3D. *Done: music is visibly driven by agents, camera tells a story, the
tree is audible in space.*

**M7 — Spectacle + Economy.** Personalities + seeds, god-rays, post FX, the
**economy/ecosystem engine** (`econ.ts`) with spark/birth/death + the ecosystem
scoreboard, palette themes, lineage spotlight. *Done: genuinely jaw-dropping
full-screen and the swarm feels alive, not logged.*

**M8 — Crowd + VJ + projection.** `/control`, `/crowd` + QR, `/vj` console,
`warp.js` keystone calibration, multi-screen sync. *Done: an operator steers the
show and the crowd pulses the floor from their phones.*

**M9 — Time-travel.** `history.ts` journal + `scrubber.js` + scrub bar + rewind FX +
highlight chapters + backward audio. *Done: the VJ can rewind and fast-forward the
entire run smoothly and catch back up to live.*

**M10 — Bidirectional + Reflexive.** `spawn-bridge.ts` + crowd prompt-cards (guarded,
`--allow-spawn`); `reflex.ts` + the `perceive_show` MCP tool so real agents can
acknowledge the crowd. *Done: the crowd spawns a real performer and a real agent
quotes the room.*

**M11 — Shared sessions.** `session.ts` + `/session/:id/ws` + `--relay`; per-venue
tints, inter-venue comets, split scoreboard. *Done: two browsers/venues share one
live tree in phase.*

**M12 — Afterlife: record / export / physicalize / a11y.** `recorder.js` +
`scripts/export-video.ts` + take-home QR; `scripts/physicalize.ts` (SVG/G-code/STL);
the `a11y/` companion (captions, audio-description, sonification, haptics,
high-contrast/reduced-motion). *Done: the run is recordable, exportable, printable,
and fully accessible.*

**M13 — Hardening & showpiece.** Reconnect robustness, log rotation/truncation,
particle caps for stable FPS, spawn-bridge kill-switch & limits, `--replay` +
`--show` scripted ~120s sequence (with crowd-spawn, reflexive, rewind, inter-venue,
and artifact beats), 30-min soak test. *Done: it survives a live session and has a
rehearsed showpiece loop.*

Stretch beyond M13: Claude-powered live witty narration via Soda Straw; agent
"duels"/mini-games when two lineages cross; a persisted cross-session "hall of
fame"; AR/phone-as-second-screen views into the dome; venue-rig surround output
mapped to physical speakers; a permanent installation that grows a coral reef of
every run ever performed.

---

### Run

```bash
bun run app/server.ts                              # http://localhost:3000, tails ~/.claude/super-agent.log
SUPER_AGENT_LOG=./test.log bun run app/server.ts   # point at a test log
bun run app/server.ts --demo                       # force Ringmaster on
bun run app/server.ts --show                        # scripted ~120s pitch showpiece
bun run app/server.ts --replay session.session --speed 1.5   # rehearsed deterministic demo
bun run app/server.ts --allow-spawn                 # let the crowd/VJ spawn REAL agents (guarded)
bun run app/server.ts --session ghent --relay wss://coord.example/session/hack   # multi-venue
bun run app/scripts/export-video.ts session.session out.webm                     # cinematic recap
bun run app/scripts/physicalize.ts session.session tree.svg                      # take-home artifact

# audience: open the big screen at /, project it; show /qr so the crowd can join /crowd
# operator: press ~ for the VJ console (or open /vj); use [ ] to scrub time, S to spawn, V to record
```
