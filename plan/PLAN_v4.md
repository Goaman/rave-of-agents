# PLAN v4 — "RAVE OF AGENTS: THE ORGANISM THAT DREAMS ITSELF" 🎪🧠🔊🤖🪐

A Bun server + browser frontend that turns the live super-agent log
(`~/.claude/super-agent.log`) into a **living, self-narrating, self-mythologizing
organism**: a 3D circus dome where a recursively-nested swarm of Claude agents
performs as neon acrobats — but where the swarm now **understands what it is doing**
(semantic clustering of transcripts), **tells the story of its own night** (an
emergent mythology layer), **learns its own aesthetics over the evening** (the show
tunes its palette, score, and pacing from what got the loudest crowd response),
**can be shaped in real time by a human conductor**, and **is, underneath the
spectacle, a genuine observability tool a real agent developer would actually use to
debug a nested run.**

v4 is the same body as v3 — every organ survives — but v4 gives it a **mind and a
purpose**. Where v3 made the visualization a *closed feedback organism* (agents
perceive the show, the crowd reaches into the tree, time can be rewound, the night
becomes an artifact), v4 makes that organism **meaningful**: it doesn't just react,
it **interprets, remembers, learns, narrates, and stands up to scrutiny as a tool.**

The single new idea threading through all of v4: **the show is dual-use and
self-authoring.** It is simultaneously (a) the most beautiful thing on a projector
at the hackathon, and (b) a real-time semantic observability surface for nested
agents that a developer would open at their desk on Monday. And across the night it
**writes its own myth and learns its own taste**, so by the encore the organism is
visibly *more itself* than it was at the door.

**Everything in v3 survives.** The new ambition lives **above** the MVP line; the
safety net lives **below** it, byte-for-byte unchanged.

---

## 0. North Star (the 90-second jaw-drop, now with a soul)

The hall goes black. A single spotlight finds the **root agent** — a giant
breathing orb at the center of a 3D circus dome. The audience taps the screen,
bass hits, and the root *drops a child*: a laser tether whips outward, a performer
rappels down it, trailing sparks. Then it fans: 2, 4, 8, the tree blooming outward
in time with a kick drum *generated from the spawn events themselves*. The AI
Ringmaster booms: *"Depth three, ladies and gentlemen — our acrobat is now
researching the acoustics of this very dome!"*

Then the v4 beats land, in order — each one escalating from spectacle to *meaning*:

1. **The swarm understands itself.** As agents proliferate, they don't stay an
   anonymous mass — they **self-organize by what they're actually doing.** Three
   constellations bloom in distinct regions of the dome, each glowing a different
   hue, each labeled by the Ringmaster: *"Stage left — the Researchers. Center — the
   Builders. Stage right — the Critics, tearing the Builders' work apart."* The crowd
   is watching *meaning* cluster in real time. (Section 6: Semantic Constellations.)
2. **The night tells its own story.** A thin **mythology ribbon** unspools along the
   dome's rim, a living comic-strip of the evening: *"In the first minute, the Root
   sent forth three scouts. One found nothing and fell. Two returned with treasure,
   and from them a city of Builders rose…"* The agent tree isn't a log; it's a
   **saga being written as it happens.** (Section 7: Emergent Mythology.)
3. **The agents look up.** A real sub-agent, mid-task, calls `perceive_show` and
   *names the audience*: *"I can see 240 of you — turning up my reverb."* (Section 8.)
4. **The crowd spawns a performer.** A tap on a phone births a **real `claude -p`
   process on stage.** The rave drives the recursion. (Section 9.)
5. **A human takes the baton.** The VJ raises a hand to a webcam — or grabs the
   console — and enters **Conductor Mode**: a sweep of the hand *fans the swarm
   wider*, a downbeat *triggers the boss drop*, a pinch *prunes a withering lineage*.
   A person is now **shaping a swarm of autonomous agents in real time, like an
   orchestra.** (Section 10: Conductor Mode.)
6. **The organism reveals it's been learning.** The Ringmaster: *"You've been
   teaching us all night."* The palette, the BPM, the camera rhythm have all
   **drifted** toward whatever drew the biggest crowd response — the show displays a
   tiny "AESTHETIC GENOME" readout showing how its taste evolved from doors-open to
   now. (Section 11: The Self-Tuning Aesthetic.)
7. **Time bends.** *"Let's see how we got here."* The whole tree **rewinds**, the
   music plays backward, then scrubs forward at 4× into the boss drop. (Section 12.)
8. **The afterlife.** As the finale fades, a printer extrudes a **physical
   agent-tree print** of *that exact run*, a QR resolves to a **cinematic replay**,
   AND a one-page **zine of the night** auto-lays-out — myth text, a poster of the
   tree, the soundtrack tracklist the show just generated. (Sections 13–15.)

If only the first paragraph works on stage, it's a great demo. Everything after
amplifies it. **The MVP Core (below the line) is exactly that first paragraph.**

And the quiet kicker for the judges who build agents: **the same screen, with the
rave turned off, is a working debugger.** (Section 16: Dual-Use / Observability.)

---

## 1. Vision

A pitch-black hall under the restored **Winter Circus** dome. We render not a flat
canvas but a **3D big-top**: a domed cylindrical space whose floor is a glowing neon
ring-stage and whose ceiling is a starfield of rigging lights. The recursive agent
tree lives in this volume — depth reads as **radial distance and height**, so the
recursion literally climbs and fans outward like trapeze artists ascending the
rigging.

Each agent is a living **performer** with a tiny personality, a voice in the mix,
and a costume. Spawning is a bass-drop trapeze launch; finishing is a comet home;
the soundtrack is **composed live from the agent activity**; an **AI Ringmaster**
calls the action; a **VJ console** bends reality; the **crowd** pulses the floor
from their phones. (All of v3.)

v4 adds a **mind** to that body — six faculties that turn a reactive organism into a
*comprehending, self-authoring* one:

- **It understands** — `semantic.ts` clusters agents by *what they are actually
  doing* (embedding/keyword analysis of their prompts and result previews), so the
  swarm self-organizes into legible **constellations** (Researchers, Builders,
  Critics, Explorers…) instead of an undifferentiated mass.
- **It remembers and narrates** — `myth.ts` weaves graph events + semantic roles
  into a continuous **emergent narrative**: a saga of the night, spoken by the
  Ringmaster and unspooled as a mythology ribbon, with named heroes, dynasties,
  betrayals (errors), and triumphs (deep successful dives).
- **It learns its own taste** — `aesthetic.ts` keeps an **aesthetic genome** that
  drifts over the night: palette, BPM, camera cadence, and FX intensity slowly
  evolve toward whatever earned the most crowd energy / applause, so the organism is
  visibly *more itself* by the encore than at the door.
- **It can be conducted** — `conductor.ts` lets a human shape the swarm in real time
  (webcam hand-tracking *or* the VJ console *or* a phone), turning the operator into
  an orchestra conductor of autonomous agents: fan, prune, focus, drop, summon.
- **It is honest and useful** — a flip of a switch turns the whole thing into a
  **real observability/debugging tool** for nested-agent developers: latency
  flame-graph, stuck-lineage detection, error blast-radius, semantic role timeline,
  token/cost heat. Dual-use: art *and* utility, from the same data, same reducer.
- **It composes across modalities** — the night's events generate not just a video
  replay and a printed tree, but a **soundtrack album** (the actual generated stems
  bounced to named tracks), **poster art**, and a printed **zine** of the evening.

And it all degrades gracefully: with no real agents, the **Ringmaster Demo**
synthesizes a packed, believable, *role-differentiated, myth-generating* show so the
projector is never dark; every faculty has a clean off-switch back to the v3 / MVP
show; and the semantic/myth/aesthetic layers all run **offline by default** (local
heuristics), with Claude-powered upgrades as clearly-flagged stretch.

---

## 2. Architecture

### 2.1 Server (Bun, stdlib-first)

`Bun.serve({ fetch, websocket })` is the spine. Jobs (v3 jobs unchanged; v4
additions flagged):

1. **Static serving** — `GET /` → `app/public/index.html`; other paths map to
   `app/public/*` (JS/CSS/wasm/glb) with correct content-types via `Bun.file`.
2. **WebSocket data hub** — `GET /ws` upgrades to a WS. Server keeps a `Set` of
   sockets and broadcasts every parsed log event as JSON. On connect it replays the
   bounded ring buffer (~4000 events) so a fresh browser instantly shows the tree.
3. **Log tailer** — watches `SUPER_AGENT_LOG` (default `~/.claude/super-agent.log`),
   streams new JSONL lines (see 2.2).
4. **Control channel** — `GET /control` upgrades a *separate* WS namespace for the
   **VJ console**, **crowd**, and **conductor** clients. Control messages (palette,
   camera, FX, pulse, scrub, spawn, **conductor gestures**) are validated, then
   broadcast / acted upon. Keeps spectacle inputs off the data path.
5. **Mobile crowd page** — `GET /crowd`: a giant "PULSE" button, emoji reactions,
   prompt-cards that spawn real agents, an accessibility companion stream, **and a
   "phone-as-baton" conductor mode** (tilt/swipe gestures, Section 10). `GET /qr`
   renders a QR to it.
6. **Session router** — `GET /session/:id/ws` namespaces hubs by session id so
   multiple venues/laptops join the same show. `--relay <url>` forwards events to a
   public coordinator so two domes share one tree.
7. **History store** — every event (real + demo + crowd-spawned) is appended to a
   per-session **`.session` journal** (JSONL, same schema + monotonic `seq`,
   `sessionTs`). Substrate for time-travel, recording/export, physicalization, **the
   zine, the album, and the offline observability report.** The journal *is* the
   canonical recording.
8. **Spawn bridge** — `app/spawn-bridge.ts` invokes a **real top-level super-agent**
   on demand (crowd/VJ/conductor-requested). Strictly opt-in, rate-limited, sandboxed.
9. **Reflex feed** — exposes read-only "what the room sees" (crowd size, energy,
   depth, hottest lineage, **and now the agent's semantic role**) so running agents
   can perceive the show via the `perceive_show` MCP tool.
10. **NEW — Semantic engine** (`semantic.ts`) — on each `spawn`/`child_done`,
    classifies the agent's `prompt`/`resultPreview` into a **role** (researcher /
    builder / critic / planner / explorer / fixer / unknown) and a **topic cluster**.
    Offline by default (keyword + cheap local embedding / TF-IDF over a rolling
    vocabulary); optional Claude-powered upgrade via Soda Straw (flagged). Emits
    `{type:"semantic", pid, role, cluster, confidence}`. Purely **additive
    annotation** — never invents or drops agents.
11. **NEW — Mythographer** (`myth.ts`) — folds graph deltas + semantic roles + the
    economy into a running **narrative state machine**: named heroes, dynasties,
    quests, falls, reunions. Emits `{type:"myth", beat, text, refs:[pid]}` that the
    Ringmaster speaks and the mythology ribbon renders. Template-driven offline;
    Claude-authored prose as flagged stretch.
12. **NEW — Aesthetic genome** (`aesthetic.ts`) — keeps a small vector of tunable
    show parameters (palette weights, base BPM, camera cadence, FX intensity,
    spawn-quantize feel). A lightweight hill-climb / EMA nudges the genome toward
    parameter settings correlated with **rising crowd energy** (pulses, applause,
    reactions). Emits `{type:"genome", params, generation}`. Bounded, smoothed,
    reversible; a "freeze genome" switch pins it for a rehearsed show.
13. **NEW — Observability projector** (`observe.ts`) — derives developer-grade
    metrics from the *same* graph + journal: per-lineage latency, stuck/idle
    detection, error blast-radius, depth/fan-out distribution, token/cost estimates
    (if present in logs), semantic-role timeline. Powers **Debug Mode** (Section 16)
    and an offline `observability-report` export. No new data source — just a
    different lens on the canonical model.

### 2.2 Log tailing strategy (unchanged core, hardened — identical to v3)

The log is append-only JSONL. The tailer:

- On startup, `stat`s the file; reads it once to seed the backlog (each line →
  parsed → backlog + tree state), then remembers the byte offset (`lastSize`).
- Uses `fs.watch(logFile)` change notifications, **debounced ~50ms**. On each event
  `stat`s again; if `size > lastSize`, reads only the new byte range via
  `Bun.file(path).slice(lastSize, size).text()`, splits on `\n`, parses complete
  lines, advances `lastSize`. A partial trailing line is buffered to the next read.
- Handles **truncation/rotation**: `size < lastSize` → reset `lastSize = 0`, re-read.
- If the file doesn't exist yet, poll for creation every 1s.
- A fallback 1s `setInterval` poll runs alongside `fs.watch` (FSEvents coalescing on
  macOS makes `fs.watch` unreliable for append-only writes).

Every tailed event flows into the **history journal** (2.1 #7) before broadcast, so
live == recording with zero divergence. The semantic, myth, aesthetic, and observe
engines are all **derived consumers** of the same parsed event — never producers of
new agent state.

### 2.3 Data flow

```
~/.claude/super-agent.log  (JSONL, appended by server.mjs + spawn-bridge)
        │  fs.watch + tail (read new bytes)
        ▼
  tailer.ts  → parse line → raw event {ts,pid,depth,event,...}
        │
        ├──► history.ts  → append to .session journal (+seq, +sessionTs) ───────┐
        ▼                                                                         │
  model.ts   → fold event into authoritative AgentGraph (nodes+edges+stats)      │
        │      + ECONOMY ledger (spark earn/spend, age, fitness)                 │
        │                                                                         │
        ├──► semantic.ts  → role + cluster per agent      → {type:"semantic"}    │
        ├──► econ.ts       → spark/fitness/birth/death     → {type:"econ"}        │
        ├──► myth.ts       → narrative beats (uses roles)  → {type:"myth"}        │
        ├──► director.ts   → camera/narration cues (+scrub)                       │
        ├──► score.ts      → musical events (server clock)                        │
        ├──► aesthetic.ts  → evolving show params          → {type:"genome"}      │
        ├──► reflex.ts     → "room state" (+role) for agents (perceive_show)      │
        ├──► observe.ts    → dev metrics (Debug Mode lens) → {type:"metrics"}     │
        ▼                                                                          │
  hub (Bun.serve websocket) → broadcast {type:"event"|"score"|"cue"|"econ"|       │
        │     "semantic"|"myth"|"genome"|"metrics"|"roomstate"|"scrub"} to clients│
        │     + on connect: {type:"snapshot", ...}                                 │
        ▼  WebSocket (JSON)        ▲                                              │
   browser: store.js folds events │  control WS: VJ + crowd + CONDUCTOR + SCRUB   │
        ▼                          │              + SPAWN                          │
   render loop (WebGPU/WebGL2)     │  ◄── time-travel reads from journal ─────────┘
   + WebAudio (spatial) + speech   │  ◄── session relay (other venues) ──────────►
   + recorder (canvas+audio capture for cinematic export)
   + conductor input (webcam hand-track / phone tilt) ──► control WS ────────────►
```

The **server owns the canonical graph + economy ledger + history journal.** Every
v4 faculty (semantic, myth, aesthetic, observe) is a **pure derived annotation** over
that same event stream. The **client re-folds the same event stream** for rendering
via the shared reducer. Time-travel, recording, the zine, the album, the poster, and
the observability report are all **re-reads of the journal through the same reducer
+ the same derived engines** — no second code path, no divergent state.

### 2.4 The correlation problem (critical — carried from v1/v2/v3, unchanged)

`spawn` is emitted by the **parent**: `{pid:parentPid, depth, childDepth, model,
prompt}` — no child pid. The child later emits `server_start` with its real pid at
`depth = childDepth`. Stitch without a shared id via the heuristic matcher in
`reducer.js`:

- On `spawn` from `parentPid`: create a **pending child** `{parentPid,
  expectedDepth: childDepth, prompt, model, spawnTs}` on a per-parent FIFO queue.
- On `server_start` with `pid=X, depth=D`: bind to the most recent unmatched pending
  child where `expectedDepth===D` (parents at `depth===D-1`, newest spawn first).
  Set `pid`, `parentPid`, `prompt`, `model`. No match (depth 0) → root.
- `child_done` from `parentPid` w/ `childDepth` → resolve the **oldest unresolved**
  child of that parent at that depth as `done`, attach `resultPreview`.
  `child_exit`/`spawn_error`/`depth_limit`/`parse_error` → close out with an error.

Best-effort, pure, unit-testable. Edge cases render as a brief unparented orb that
later snaps to its tether.

**Optional MCP extension:** if the super-agent server emits a **shared `spawnId`** on
both the parent `spawn` and child `server_start`, the matcher collapses into an exact
join. Small, backward-compatible — reducer prefers `spawnId`, falls back to heuristic
(old logs still work). See 2.9.

### 2.5 Frontend rendering — 3D, with a 2D safety net (v3, extended)

- **Primary: WebGPU** via Three.js (WebGPURenderer): instanced orbs, additive neon
  bloom, volumetric god-rays, tether ribbons, GPU particles. **Automatic fallback to
  WebGL2** (same scene), and a **Canvas2D flat mode** as the ultimate fallback (this
  is the MVP renderer; see MVP Core).
- Three.js is the one justified dependency, vendored under `public/vendor/` (no
  install/build step at demo time). The server stays pure Bun stdlib.
- **Post-processing FX**: bloom (mandatory for neon), chromatic aberration on bass
  hits, film grain/scanlines, vignette, optional motion-blur on camera moves.
- **Camera**: cinematic auto-director orbits the dome, punches in on the hottest
  lineage, pulls back for beauty shots. VJ/Conductor can seize manual control.
- **Recorder tap**: composited canvas + master audio bus → `MediaRecorder` /
  `CanvasCaptureMediaStreamTrack` → downloadable `.webm` cinematic replay.
- **NEW — Semantic spatial layout**: orbs are positioned not only by depth ring but
  nudged into **role/topic clusters** (a soft force-field per cluster centroid), so
  the dome floor visibly partitions into constellations (Section 6). A toggle blends
  smoothly between "pure lineage layout" and "semantic layout."
- **NEW — Mythology ribbon**: an SDF-text marquee along the dome rim renders the live
  saga (Section 7); in flat2d it's a bottom-screen scroll.
- **NEW — Debug Mode overlay**: a clean, non-rave HUD (flame-graph, role timeline,
  blast-radius) that *replaces* the spectacle FX when toggled (Section 16).

### 2.6 The Director (auto-cinematography + narration) — now myth-aware

`director.ts` (server) + `director.js` (client) turn graph deltas into a show:

- **Camera cues**: new deepest depth → push-in + tilt up the rigging; sibling-spawn
  burst → pull back to reveal the bloom; quiet lineage → drift to the next hot
  cluster. **NEW:** when a new **constellation** forms (Section 6), the camera does a
  reveal sweep across the role clusters. Cues are *suggestions* the client rig eases
  toward (smooth, never jarring).
- **Narration cues**: notable moments emit a `cue` with a templated line, now
  **fed by the Mythographer** so the Ringmaster narrates *story*, not just stats
  ("The Critics have turned on the Builders!" rather than "fan-out at depth 3"). The
  client speaks it via WebAudio + SpeechSynthesis, ducking the music under the VO.
- **Stretch — live witty narration via Soda Straw**: cue + myth context sent to a
  Claude call (through the Soda Straw MCP, governed centrally) for live, on-theme
  commentary; MVP uses templates so it works fully offline.
- **Director directs *time* too**: in a rehearsed "showpiece" it can issue `scrub`
  cues that drive the time-travel engine (Section 12).
- **NEW — Director answers to the genome**: camera cadence and beauty-shot frequency
  are parameters the aesthetic genome (Section 11) can tune over the night.

### 2.7 Audio architecture — generative, spatial, and now an album (v3 + new)

`audio/` builds a real WebAudio synth graph whose *content is driven by agent
activity* (all of v3), plus:

- **Transport**: sample-accurate lookahead beat clock (BPM ~124, VJ/genome-adjustable);
  `score.ts` on the server is authority so all screens/venues agree.
- **Layered stems by depth**: 0 = sub-bass + kick, 1 = bassline, 2 = stabs/chords,
  3 = arps, 4+ = shimmer/percussion. Deeper tree → fuller track.
- **Spawn = a note** (pitch by depth in pentatonic/phrygian → always musical; timbre
  by model). `child_done` = a resolving tail note.
- **NEW — Timbre by semantic role**: a Researcher's notes lean airy/bell-like, a
  Builder's punchy/percussive, a Critic's dissonant/biting — so you can *hear* what
  kind of work is happening, reinforcing the constellations sonically.
- **Density → energy**: active-agent count drives filter cutoff, reverb send, and a
  build/drop envelope; a swarm triggers a riser → drop on the next bar. Errors get a
  detuned gritty stinger.
- **Analyser feedback loop**: an `AnalyserNode` reads the generated mix back into the
  visuals — bass drives bloom/zoom, mids drive particle emission. Closed loop.
- **True spatial audio**: each performer gets a `PannerNode` at its **actual 3D
  coordinates** (HRTF). On a multi-speaker venue rig, map each depth ring (or each
  destination channel via a `ChannelSplitter`) to a physical speaker — **the
  recursion is audible in space.**
- **The crowd is an instrument**: aggregate pulses drive a "hands-up" riser and a
  sidechain pump; sustained applause (mic-optional) opens the master filter.
- **NEW — The album bounce** (`scripts/export-album.ts`): the score engine is fully
  deterministic from the journal, so an offline pass re-renders the night's music as
  **named, exportable stems / tracks** — "Track 1: Doors Open (124 BPM)", "Track 4:
  The Boss Drop", titled from the mythology beats. The night literally produces a
  shareable soundtrack. (Section 14.)
- Autoplay: a single **"TAP TO ENTER THE TENT"** splash unlocks `AudioContext`.

### 2.8 The Economy / Ecosystem engine (v3, unchanged, now feeds myth + aesthetic)

`econ.ts` maintains a lightweight ledger reframing the tree as a **living
ecosystem**: spark (attention-energy) earned by being watched/deep/fast/cheered and
spent by spawning/idling; fitness & lineage success ("thriving" vs "withering");
birth/age/death as a visible life-cycle leaving a **sediment ring** of past
performers. Fully derived/cosmetic — off-switch reverts to v3's plain scoreboard.

**NEW in v4:** the economy is a primary input to the **Mythographer** (rich lineages
become "dynasties," falls become "tragedies") and to the **aesthetic genome** (which
correlates economic drama with crowd response).

### 2.9 MCP / super-agent extensions (explicit, all backward-compatible)

The current MCP server only *writes* the JSONL log. v4's faculties need a little
more. Each extension is **opt-in and the visualizer works without it** (falls back to
prior behavior). Noted explicitly per the brief:

1. **`spawnId` on spawn/server_start** *(tiny, recommended)* — shared id → exact
   correlation join (2.4). Reducer prefers it, falls back to heuristic. No behavior
   change for old logs.
2. **`perceive_show` MCP tool** *(reflexive agents, Section 8)* — read-only tool on
   the super-agent server returning current **room state** (crowd size, energy 0–1,
   max depth, this agent's spark, on-camera flag, **and now its semantic role**).
   Agents opt in by calling it; lets a real agent write *"I can see 240 of you"* —
   or *"I've been cast as a Critic; let me earn it"* — into its own transcript.
   Reflex feed (2.1 #9) over a tiny local HTTP endpoint. Offline.
3. **`SUPER_AGENT_LOG` already overridable** — used as-is for per-session journals.
4. **Spawn bridge needs no MCP change** — invokes `claude -p` with the `super-agent`
   skill exactly as a human would, so a spawned agent is indistinguishable from any
   other root and flows through the same log/tail path (Section 9).
5. **Optional `tags` field on spawn** *(multi-venue, Section 17)* — free-form
   `venue`/`origin` tag for relayed-event attribution. Absent → local. Cosmetic.
6. **NEW — optional richer log fields** *(all additive, all ignored if absent)*:
   - `tokensIn` / `tokensOut` / `costUsd` on `child_done` — powers the Debug-Mode
     cost heat (Section 16). If absent, the observability layer estimates from
     transcript length or simply hides the cost lens.
   - `tool` / `toolCount` on intermediate events — lets `semantic.ts` and Debug Mode
     show *what tools* a lineage used. Absent → role inferred from prompt text only.
   - `label` free-text tag on `spawn` — a developer-supplied role hint that, if
     present, overrides the inferred semantic role (so real devs using this as a
     tool get authoritative labels). Absent → inference as usual.

   These are **purely optional**. The headline demo and the MVP run on **today's log
   schema** with zero MCP changes; the new fields only sharpen the semantic and
   observability layers when a future super-agent chooses to emit them.

These are the *only* server-side changes contemplated; everything else reads the
existing log.

---

## 3. Visual / game design — the living, comprehending big-top

### 3.1 The stage

A **3D circus dome**: a dark cylindrical hall, neon ring-stage floor, domed ceiling
laced with rigging lights. Floor divided into **concentric depth rings** (depth 0
center spotlight → `MAX_DEPTH` at the rim). The tree also **climbs** — deeper agents
rise toward the rigging, a luminous 3D chandelier of performers. Volumetric god-rays
from the center spotlight cut through haze. A faint **sediment ring** of
retired-agent embers accumulates over the session.

**NEW — constellation regions**: the floor's angular space is softly partitioned into
**semantic regions** (Researchers' quarter, Builders' quarter, Critics' quarter…),
each tinted, each labeled by a floating neon sign that brightens as the cluster
grows. The whole dome reads as a *living organizational chart that the audience can
feel.*

**NEW — the mythology ribbon**: a glowing text band rings the dome's upper rim,
slowly scrolling the saga of the night (Section 7).

### 3.2 Agents = performers (with personality and a *role*)

Each agent node is a glowing performer orb with a costume and a vibe:

- **Size** by depth and **spark**, pulsing on the beat.
- **Color** by `model` (opus = magenta, sonnet = cyan, haiku = lime, unknown =
  white). **NEW:** a secondary **role accent** (a halo / costume motif) by semantic
  role — a Researcher wears a lantern, a Critic a mask, a Builder a hard-hat glow.
- **State**: spawning (flare-in), active (steady neon glow + orbiting spark
  familiars), done (cool to ember), error (red strobe).
- **Personality**: a deterministic seed from `pid` picks bob speed, spin, familiars,
  an emoji "face," and a one-word stage name ("Vesper the Tightrope Sonnet").
  **NEW:** the Mythographer can *promote* a notable performer to a **named hero** with
  a title earned from its deeds ("Vesper, Finder of the Deep").
- **Position**: angularly within its depth ring, biased near the parent's angle so
  siblings cluster — **and now also pulled toward its role constellation** (a gentle
  blend so lineage tethers still read).
- **Reflex tells**: calling `perceive_show` triggers a "turn to face the audience"
  animation; its transcript bubble can quote the room.

### 3.3 Spawns = the drop / the trapeze launch (v3, unchanged)

Laser tether whips parent → child position; a **bass-drop accent** quantized to the
next beat (particle burst, expanding shockwave, bloom spike, chromatic-aberration
kick, subtle camera shake) + a generated **spawn note**; the child **flares in** and
rappels down the tether trailing a comet tail. **Crowd-spawned births** get a "from
the audience" treatment (tether drops from the rim where the QR points, sparks rain
into the crowd, Ringmaster shouts out the spawner).

### 3.4 Lineage = tethers (energy ribbons) (v3, unchanged)

Persistent glowing **ribbon tethers** along Catmull-Rom curves, pulsing energy
downward while a child is active. Hover/click lights the full ancestry root→node and
dims the rest. A thriving lineage has a thicker, gold-tinged tether; a withering one
frays and dims.

### 3.5 Child done = the pulse home (v3, unchanged)

A bright **comet** races **up** the tether to the parent; the child cools to an
ember; a `resultPreview` banner floats up and dissolves; the parent flares; a
resolving note sounds; the comet deposits **spark** into the parent. Errors send a
red jagged pulse + gritty stinger.

### 3.6 Transcripts = the glowing ticker tape (v3, extended)

`prompt` and `resultPreview` render as glowing marquee text above the relevant orb
(SDF/MSDF in 3D, Canvas2D overlay for crispness), typed character-by-character with
neon flicker, then fading. A side **"backstage feed"** scrolls recent snippets,
color-coded by depth. Reflexive lines get a distinct highlight. **NEW:** each snippet
also carries a tiny **role chip** (🔬/🔨/🗡️…) from the semantic engine so the
audience can scan *what kind of work* is streaming.

### 3.7 The Ecosystem scoreboard → now also a Story panel

The neon scoreboard reads the economy: **Deepest dive · Busiest parent · Fastest
return · Longest-running act · Richest bloodline** + live tallies (active/total/
spawns-per-min/error rate/BPM/total spark/births&deaths). Multi-venue split when
shared. **NEW — a "Story so far" panel** shows the last few mythology beats as a
comic-strip strip; **NEW — a "Roles" mini-chart** shows the live population by
semantic role (a tiny live stacked bar).

### 3.8 HUD + theming (v3, extended)

Minimal neon HUD: counts, BPM, **LIVE/DEMO/REPLAY/SCRUB/DEBUG/CONDUCT** badge, FPS
particle cap, session/venue tag, time position when scrubbing. Heavy vignette,
optional scanlines, big readable type, projector-tuned. Palette themes (Classic Neon,
Acid, Vaporwave, Mono-Strobe, Daylight-High-Contrast) the VJ can cycle — **and which
the aesthetic genome can blend between automatically** (Section 11). **NEW — an
"AESTHETIC GENOME" readout** (toggle) visualizes the current evolving parameter
vector and how far it has drifted from doors-open.

### 3.9 Crowd, VJ & Conductor interaction (v3 + Conductor)

- **Crowd phones** (`/crowd`): a giant PULSE button → beat-quantized flash + bloom +
  cheer particle rain; emoji reactions; a live "crowd energy" meter feeding the
  audio build and **the aesthetic genome's fitness signal**; prompt-cards that spawn
  real agents; an accessibility companion; **and a phone-as-baton conductor mode.**
- **VJ console** (`/vj`, or in-app via `~`): camera mode, palette, intensity, FX,
  BPM, manual bass-drop, freeze-frame, LIVE/DEMO override, time-scrub bar, spawn
  trigger, session/relay controls, REC/export, **a Debug-Mode toggle**, **a "freeze
  genome" toggle**, and **Conductor-Mode arm/disarm.**
- **NEW — Conductor** (`/conduct` or webcam in-app): a human shapes the swarm in real
  time (Section 10).

### 3.10 Projection-mapping readiness (v3, unchanged)

Resolution-agnostic, true fullscreen, no chrome. **Output calibration overlay**
(toggle): grid + corner markers; CSS/WebGL **keystone/quad-warp** on the final
composited canvas so the projection corner-pins onto the dome/walls without external
software. Deterministic seeds + server-authoritative clock so **multiple screens and
venues stay in sync.**

---

## 4. File / module breakdown (everything under `app/`)

```
app/
  server.ts              — Bun.serve entry: static + /ws + /control + /crowd + /vj
                            + /conduct + /session/:id/ws + /qr; wires
                            tailer→history→model→{semantic,econ,myth,director,score,
                            aesthetic,reflex,observe}→hub.
  tailer.ts              — Watches SUPER_AGENT_LOG, reads new bytes, emits parsed events.
  hub.ts                 — WebSocket fan-out: client set, snapshot-on-connect, broadcast;
                            data + control channels; per-session routing.
  model.ts               — Server-side authoritative AgentGraph (folds via shared reducer)
                            + derived stats/leaderboard.
  ringbuffer.ts          — Bounded event backlog (~4000) for snapshot/replay (hot tail).
  demo.ts                — Ringmaster: synthesizes role-differentiated, myth-generating,
                            economy-driven fake event streams when idle.
  director.ts            — Camera + narration cues from graph deltas + myth beats; scrub cues.
  score.ts               — Server-authoritative beat clock + musical events from spawns/dones.
  control.ts             — Validates/relays VJ + crowd + CONDUCTOR control: pulse, palette,
                            SCRUB, SPAWN, gestures.
  qr.ts                  — Dependency-free QR (SVG/PNG) for /crowd and /conduct URLs.
  config.ts              — Resolves LOG_FILE, PORT, MAX_DEPTH, DEMO_MODE, BPM, SESSION, RELAY,
                            ALLOW_SPAWN, SEMANTIC_MODE (offline|claude), GENOME (on|freeze).

  history.ts             — Append every event to .session journal (+seq,+sessionTs);
                            serve time-windowed reads for scrubbing/replay/export/zine.
  econ.ts                — Spark ledger + fitness + birth/age/death; derives {type:"econ"};
                            feeds myth + aesthetic.
  reflex.ts              — Computes "room state" (crowd size/energy/depth/on-camera/ROLE);
                            local HTTP endpoint for perceive_show.
  spawn-bridge.ts        — Invokes a real top-level `claude -p` super-agent on
                            crowd/VJ/conductor request; rate-limited, sandboxed, opt-in.
  session.ts             — Multi-venue session registry; optional relay client/coordinator.

  semantic.ts            — NEW: classify each agent's prompt/result into role + topic cluster
                            (offline keyword/TF-IDF/local-embedding; optional Claude upgrade).
                            Emits {type:"semantic"}. Pure annotation over real agents.
  myth.ts                — NEW: narrative state machine (heroes/dynasties/quests/falls) over
                            graph+roles+economy. Emits {type:"myth", beat, text, refs}.
  aesthetic.ts           — NEW: aesthetic-genome (palette/BPM/camera/FX vector); hill-climb/EMA
                            toward crowd-energy fitness. Emits {type:"genome"}. Freezable.
  observe.ts             — NEW: developer metrics (latency/stuck/blast-radius/role-timeline/
                            cost heat) from the same model+journal. Powers Debug Mode + report.

  shared/
    reducer.js           — Pure event→AgentGraph reducer + correlation matcher (spawnId-aware).
    types.ts             — Event + AgentNode + AgentGraph + Cue + ScoreEvent + Econ + RoomState
                            + Role + Cluster + MythBeat + Genome + Metrics.
    scale.js             — Musical scale + depth→pitch mapping (server + client agree).
    roles.js             — NEW: shared role taxonomy + keyword lexicon + role→color/timbre map
                            (so server semantic engine and client rendering agree exactly).

  public/
    index.html           — Canvas + overlays + "TAP TO ENTER" splash; loads main.js.
    crowd.html           — Phone: PULSE + emoji + spawn prompt-cards + a11y companion + baton.
    vj.html              — VJ console: camera/palette/FX/BPM + scrub + spawn + session + REC
                            + Debug toggle + freeze-genome + Conductor arm.
    conduct.html         — NEW: dedicated conductor surface (webcam hand-track OR touch pads).
    styles.css           — Dark/neon HUD, backstage panel, scoreboard, story panel, ribbon,
                            splash, FX, high-contrast theme, Debug-Mode clean layout.
    main.js              — Browser entry: WS + store + renderer + audio + director + recorder
                            + conductor input + RAF.
    store.js             — Client graph state: folds events via shared reducer; holds econ +
                            roomstate + roles + myth + genome + metrics.
    ws.js                — WebSocket client(s) w/ reconnect; handles snapshot/score/cue/econ/
                            semantic/myth/genome/metrics/scrub/control.
    renderer/
      engine.js          — Renderer abstraction: WebGPU→WebGL2→Canvas2D; frame loop + post FX.
      scene3d.js         — Three.js big-top: dome, ring-stage, lighting, god-rays, sediment,
                            constellation regions + signs, mythology ribbon, camera rig.
      orbs.js            — Instanced performer orbs: model/state/ROLE materials, beat pulse,
                            spark size, seeds, hero promotion.
      tethers.js         — Ribbon lineage curves; ancestry highlight; thriving/withering.
      particles.js       — GPU particles: spawn bursts, familiars, comets, crowd cheer,
                            inter-venue trails, role-tinted emission.
      camera.js          — Cinematic rig: eases toward Director cues; constellation reveals;
                            manual/auto/orbit; obeys Conductor; feeds reflex.
      layout.js          — NEW: blends lineage layout ↔ semantic-cluster force-field.
      overlay.js         — Canvas2D layer: transcript tickers (+role chips), labels, HUD,
                            backstage feed, scoreboard, STORY panel, roles mini-chart, genome
                            readout, mythology ribbon (flat fallback).
      warp.js            — Final-output keystone/quad-warp + calibration grid.
      flat2d.js          — Canvas2D fallback renderer (the MVP visual): rings, circles, lines,
                            basic FX; role tint optional.
      scrubber.js        — Client time-travel: drives store from a journal window; rewind FX.
      recorder.js        — MediaRecorder tap on canvas+audio bus → downloadable .webm clip.
      debug.js           — NEW: Debug-Mode HUD (flame-graph, role timeline, blast-radius, cost
                            heat) — replaces rave FX; the dual-use observability lens.
    audio/
      engine.js          — WebAudio graph: kick/bass/stabs/arp/shimmer voices, master, Analyser.
      transport.js       — Lookahead beat scheduler synced to server score clock; build/drop.
      score.js           — Maps ScoreEvents → scheduled notes per depth-layer + ROLE timbre.
      reactive.js        — Reads analyser → bloom/zoom/emission/shake each frame.
      narrator.js        — Ringmaster TTS via SpeechSynthesis; ducks music; speaks myth beats.
      spatial.js         — PannerNode per performer at its 3D position; HRTF / multi-channel.
    a11y/
      companion.js       — Live captions, audio-description, sonification of the tree (now
                            role-aware), tactile/haptic phone mode.
    conductor/
      gestures.js        — NEW: webcam hand-tracking (MediaPipe Hands, vendored) → gesture
                            events; touch/tilt fallback; maps gestures → control messages.
    util/
      color.js           — Model→neon palette, depth gradients, role tints, theme presets.
      easing.js          — Tween/easing helpers for flares, pulses, camera, screen shake.
      seed.js            — Deterministic per-pid personality/seed helpers.

  scripts/
    emit-fake-log.ts     — Append realistic events to a test log to drive the real tail path.
    record.ts            — Capture a live session's events to a .session/.replay file.
    export-video.ts      — Headless render a .session journal → cinematic .webm/.mp4 (offline).
    export-album.ts      — NEW: deterministic offline re-render of the score → named track stems
                            (the night's soundtrack), titled from myth beats.
    physicalize.ts       — Render a .session → printable SVG/G-code/STL of the agent tree.
    make-zine.ts         — NEW: lay out a one-page (or fold-out) ZINE PDF/SVG of the night:
                            myth text + tree poster + role census + soundtrack tracklist.
    observability-report.ts — NEW: from a .session, emit a developer report (HTML/JSON):
                            latency flame-graph, stuck lineages, error blast-radius, role
                            timeline, cost summary — the dual-use proof.

  README.md              — How to run (bun run), env vars, demo mode, controls, VJ/crowd/
                            conductor URLs, session/relay, scrub, spawn-bridge safety, export,
                            album, zine, physicalize, Debug Mode / observability report.
  package.json           — "dev"/"start" scripts (bun run app/server.ts); only vendored
                            Three.js + MediaPipe Hands on the client; server pure Bun stdlib.
```

`shared/reducer.js`, `shared/scale.js`, and `shared/roles.js` are plain JS so browser
and server both `import` them directly — no bundler, no build step. Three.js and
MediaPipe Hands are vendored under `public/vendor/`. Every server module (`history`,
`econ`, `reflex`, `spawn-bridge`, `session`, `semantic`, `myth`, `aesthetic`,
`observe`) is pure Bun stdlib + (for the optional Claude upgrades) Soda Straw MCP +
(for spawn-bridge) spawning `claude -p`.

---

## 5. The faculties — design detail (index)

6 Semantic Constellations · 7 Emergent Mythology · 8 Reflexive agents · 9
Bidirectional control · 10 Conductor Mode · 11 The Self-Tuning Aesthetic · 12
Time-travel · 13 Recording/export · 14 Cross-modal outputs (album/poster/zine) · 15
Physicalization · 16 Dual-Use / Observability · 17 Shared sessions · 18
Accessibility-as-art.

### 6. Semantic Constellations — the swarm understands what it's doing

The leap from "pretty graph" to "comprehending organism." `semantic.ts` reads each
agent's `prompt` (on spawn) and `resultPreview` (on done) and assigns:

- a **role** from a shared taxonomy in `shared/roles.js` (researcher, builder,
  critic, planner, explorer, fixer, summarizer, unknown), and
- a **topic cluster** (a rolling TF-IDF / cheap local embedding groups agents working
  on the *same thing* — "the acoustics quest," "the finale composer," "the bug hunt").

**Offline by default**: a curated keyword lexicon + TF-IDF over a rolling vocabulary,
running in pure Bun in microseconds — no network, no key, works in the basement of
the Winter Circus with no wifi. **Optional Claude upgrade** (`SEMANTIC_MODE=claude`,
via Soda Straw MCP, flagged): batched, cached classification for sharper roles and
prettier cluster names. The dev `label` field (2.9 #6) overrides inference when
present.

- **Visually** (3.1/3.2): the dome floor partitions into tinted **constellation
  regions** with floating neon signs; each orb gets a role halo; `layout.js` softly
  pulls orbs toward their cluster centroid while lineage tethers still connect them.
- **Sonically** (2.7): role drives timbre — you can *hear* a Critic arrive.
- **Why it elevates**: the audience watches *meaning* self-organize. It's the moment
  the show stops being eye-candy and becomes legible — "oh, that whole glowing region
  is the part of the swarm arguing about the music." It also directly powers the
  myth, the dual-use debugger, and the zine's role census.
- **Honesty**: it's annotation, not fabrication — confidence is shown (low-confidence
  → "unknown," no overclaiming), and a toggle reverts to v3's role-blind layout.

### 7. Emergent Mythology — the tree tells a story

The organism **narrates its own night as a saga.** `myth.ts` is a small narrative
state machine that consumes graph deltas + semantic roles + economy and emits
**mythology beats**:

- **Casting**: a deep or rich lineage's ancestor becomes a **named hero**; a cluster
  becomes a **faction/dynasty** ("the House of Builders"); a topic becomes a **quest**
  ("the Quest for the Dome's True Reverb").
- **Plot beats**: birth of a hero, a quest begun, a scout lost (error), a treasure
  returned (fast successful deep `child_done`), a rivalry (two clusters touching), a
  reunion (a comet home), a fall (a dynasty withering), a triumph (boss drop at
  MAX_DEPTH).
- **Output**: each beat is `{type:"myth", beat, text, refs:[pid]}`. The Ringmaster
  *speaks* the text (2.6) and the **mythology ribbon** (3.1) scrolls it; the Story
  panel (3.7) keeps the last few as a comic strip; the zine (Section 14) prints the
  whole saga.

**Offline by default**: rich templated grammar (Tracery-style, hand-authored, fully
on-theme) so it works with no network. **Stretch**: Claude (via Soda Straw) ghost-
writes the prose live from the structured beats for genuinely surprising lines — but
the structure (who/what/when) is always real, derived from the actual run.

**Why it elevates**: it turns an ephemeral process into a *story the audience
remembers and retells.* "Remember when the Critics turned on the Builders and Vesper
dove to depth five to settle it?" is a thing a human says about a hackathon demo. That
is the most memorable possible outcome.

### 8. Reflexive agents — the performers know they're watched (v3, role-aware)

A *real* sub-agent, mid-task, acknowledges the audience via `perceive_show` (2.9 #2).
`reflex.ts` computes room state (crowd size, energy, max depth, the agent's spark and
on-camera flag, **and now its semantic role**). An opted-in agent folds it into its
transcript: *"I can see 240 of you — turning up my reverb,"* or *"cast as a Critic, I'll
earn the part."* Visually the performer turns to the house; the Ringmaster calls the
fourth-wall break. **Honesty guard**: only real opted-in agents do this; the demo
simulates it but flags DEMO. Pure local HTTP; offline.

### 9. Bidirectional control — the rave spawns real agents (v3, unchanged)

`/crowd` prompt-cards send a `control` `spawn`; `control.ts` validates + rate-limits;
`spawn-bridge.ts` invokes a **real top-level `claude -p`** with the `super-agent`
skill, appending to the same log → tailed/correlated/rendered through the **exact
same path.** Visually a "from the audience" birth with a spawner shout-out. **Safety
(must)**: opt-in `--allow-spawn`; curated allow-list of prompts (free-text only behind
a VJ approval queue); hard rate limit + max-concurrent cap; restricted tools/sandbox;
big VJ kill-switch. Off by default → read-only show.

### 10. Conductor Mode — a human shapes the swarm in real time

A person stands before the dome and **conducts the swarm like an orchestra.**
`conductor/gestures.js` reads input from any of three sources (auto-detected,
graceful fallback): **(a) webcam hand-tracking** (MediaPipe Hands, vendored), **(b)
the `/conduct` touch surface** (gesture pads), or **(c) phone-as-baton** on `/crowd`
(tilt/swipe). Gestures map to **control messages**, validated by `control.ts`:

- **Open palm sweep wide** → bias the layout/camera to *fan the swarm wider*, pull
  back for a bloom reveal, nudge the genome toward energy.
- **Downbeat (sharp drop of the hand)** → trigger a quantized **bass-drop / boss
  moment** (FX, score riser→drop) on the next bar.
- **Point + hold** → spotlight that lineage/constellation (camera + audio focus).
- **Pinch / cut** → *prune* — visually retire a withering lineage (cosmetic, or, with
  `--allow-spawn` + confirm, actually signal a stuck branch). Defaults to cosmetic.
- **Raise both hands** → "hands up" — open the master filter, maximize crowd-energy
  coupling.
- **Beckon** → if `--allow-spawn`, queue a curated **spawn** (a real agent), so the
  conductor can *summon* a performer.

**Two honesty tiers**: *expressive* (default — gestures shape the **show**: camera,
FX, layout, genome, audio) needs no agent control and is always safe; *generative*
(behind `--allow-spawn` + VJ confirm) lets gestures actually spawn/signal agents.

**Tech**: MediaPipe Hands runs client-side on the conductor's machine; only distilled
gesture *events* (not video) go over the control WS; everything is debounced and
quantized to the beat so it always looks intentional. No webcam? The `/conduct` touch
pads and phone-baton give the identical control set.

**Why it elevates**: it's the single most cinematic *live* moment possible — a human
visibly **commanding a swarm of recursive autonomous agents** with their hands, and
the swarm answering on the beat. It reframes the whole project: agents aren't just
watched or seeded, they're *conducted.*

### 11. The Self-Tuning Aesthetic — the show learns its own taste

The organism **develops a personality over the night.** `aesthetic.ts` holds an
**aesthetic genome**: a small bounded vector of show parameters (palette blend
weights, base BPM, camera cadence / beauty-shot frequency, FX intensity, spawn
quantize "feel," bloom amount). A lightweight **hill-climb / EMA** periodically nudges
the genome and measures the **fitness signal = crowd energy** (pulses, emoji
reactions, mic applause, conductor "hands up") over the following window; changes that
correlate with more energy stick, others decay. Bounded ranges + heavy smoothing keep
it always-tasteful and never seizure-y; honoring `prefers-reduced-motion` clamps it
further.

- **Visibly evolving**: the **AESTHETIC GENOME readout** (3.8) shows the current
  vector and its drift from doors-open. At the finale the Ringmaster reveals: *"You've
  been teaching us all night — and look how far our taste has travelled."*
- **Reproducible / safe**: the genome trajectory is journaled, so a replay reproduces
  the exact evolution; `--genome freeze` pins it for a rehearsed showpiece; it's a
  derived layer with a clean off-switch to v3's static look.
- **Why it elevates**: the show isn't just *reactive*, it **learns** — by the encore
  the organism is demonstrably *more itself*, shaped by this specific crowd on this
  specific night. No two performances converge to the same taste. It makes the night
  feel singular and alive.

### 12. Time-travel — scrub the agent run like a film (v3, unchanged)

`history.ts` journals every event with `seq` + `sessionTs`, so the performance is a
**deterministic film.** A **VJ scrub bar** (and Director-issued `scrub` cues) set a
target time `t`; `scrubber.js` re-folds the journal window through the **same shared
reducer** (and the same semantic/myth/econ engines) so the tree, constellations,
saga, economy, and scoreboard show their exact historical state — no separate
snapshot format. **Rewind FX**: orbs un-spawn, comets reverse, score plays backward,
sediment un-settles; 2×/4×/8× compresses long runs into a montage. **Jump to
highlight**: the Director + Mythographer tag dramatic beats for chapter-skipping.
**Live + history coexist**: scrubbing buffers the live tail; releasing catches back up
to NOW. A **SCRUB** badge keeps it honest. Client reads windowed journal over `GET
/session/:id/history?from&to`; audio transport supports negative-rate scheduling.

### 13. Recording & cinematic export (v3, unchanged)

**Live clip capture** (`recorder.js`): `MediaRecorder` taps the composited canvas
(`captureStream`) + master audio bus → downloadable `.webm`; VJ hits REC, finale
auto-records. **Offline cinematic render** (`scripts/export-video.ts`): re-play a
`.session` journal headlessly through the renderer at fixed framerate with the
auto-director on → polished `.webm`/`.mp4` recap; deterministic seeds → identical
every time. **Take-home QR**: at the finale `/qr` flips to the most recent exported
replay.

### 14. Cross-modal outputs — the night becomes an album, a poster, and a zine

The run **composes itself across media**, all offline, all deterministic re-reads of
the journal:

- **The soundtrack album** (`scripts/export-album.ts`): the score engine is fully
  deterministic from the journal, so an offline pass re-renders the night's music to
  **named track stems** — titled from mythology beats ("Doors Open," "The House of
  Builders Rises," "The Boss Drop," "Last Embers"). The night yields a shareable
  soundtrack the audience can keep.
- **Poster art** (part of `physicalize.ts` / `make-zine.ts`): a high-res print of the
  agent tree as a constellation map — depth as radius/height, lineage as branches,
  role as hue, spark as thickness — a genuinely frame-able artifact.
- **The zine** (`scripts/make-zine.ts`): a one-page (or fold-out) **PDF/SVG zine of
  the night**: the full mythology saga as prose, the tree poster, the role census, the
  soundtrack tracklist, deepest-dive stats, and a QR to the cinematic replay. It lays
  out automatically from the journal so every run produces a unique printed keepsake.

**Why it elevates**: the show is no longer one output on a screen — it's a **little
multimedia release** (film + album + poster + zine) generated from a night of agent
activity. That breadth is what makes it unforgettable and shareable far beyond the
room. **Tech**: all reuse the journal + reducer + score/myth engines; the album uses
`OfflineAudioContext`-style deterministic rendering; the zine/poster are pure
SVG→PDF; no exotic deps.

### 15. Data-physicalization — the artifact you can hold (v3, unchanged)

`scripts/physicalize.ts` reads a `.session` journal and emits a **printable SVG
poster**, a **lasercut/plotter G-code tag**, or an **STL "coral"** of the exact agent
tree — depth as radius/height, lineage as branches, spark as thickness, model/role as
engraved color/hatch. On stage, a pen-plotter / lasercutter / 3D printer can extrude
the tag during the finale; otherwise the file downloads and prints later. Pure
geometry from the journal → SVG/G-code/STL; hardware strictly optional/stretch.

### 16. Dual-Use — the same screen is a real observability tool

The quiet superpower that wins over the engineers in the room. With one toggle
(**Debug Mode**, `debug.js` + `observe.ts`), the rave's FX recede and the *same live
data* becomes a **genuine nested-agent observability surface** a developer would
actually keep open:

- **Latency flame-graph**: each lineage as a horizontal span (spawn→done), nested by
  depth — instantly see which branch is slow and which deep dive blew the budget.
- **Stuck-lineage detection**: agents active past a threshold with no `child_done`
  glow red and float to a "STALLED" rail — the thing you most want when a nested run
  hangs.
- **Error blast-radius**: an error highlights its ancestors and orphaned descendants,
  so you see *what a failure cost upstream and down.*
- **Semantic role timeline**: a swimlane of role population over time (from Section
  6) — "we spent 4 minutes with everyone Critiquing and nobody Building."
- **Cost/token heat** (uses optional `tokensIn/Out`/`costUsd` fields, 2.9 #6;
  estimates or hides them if absent): heat-map spend across the tree.
- **Offline report** (`scripts/observability-report.ts`): the same metrics as a
  shareable HTML/JSON post-mortem of any `.session`.

It's the *same model, same reducer, same journal* as the rave — just a different lens.
**Why it elevates**: it makes the project **dual-use** — art *and* a tool a real agent
developer would download. That's the difference between "cool hackathon toy" and
"thing people actually use," and it's the most credible possible answer to "what is
this good for?"

### 17. Shared sessions — one tree, many domes (v3, unchanged)

Hubs namespaced by **session id** (`/session/:id/ws`); browsers join and see the same
tree, economy, clock, **and now the same constellations + saga.** `--relay <url>`
forwards locally-tailed events (tagged `venue`/`origin`, 2.9 #5) to a lightweight
**coordinator** that merges venues' streams into one journal and rebroadcasts on the
coordinator's clock so beats stay in phase across cities. Performers carry venue
tints; a comet races **between** domes; the scoreboard splits per venue. Default
session = `local`, no coordinator; relay is purely additive; coordinator unreachable →
each dome runs its own show. Plain WebSocket relay, JSON events, same reducer, no new
deps.

### 18. Accessibility-as-art (v3, extended)

Accessibility is a parallel art piece, not a checkbox. **Live captions** (every
transcript + Ringmaster/myth line, large/high-contrast, plus a caption companion on
`/crowd`). **Audio-description track**: the Director's + Mythographer's textual cues
spoken on a *separate* TTS channel ("a child blooms at depth four, far left, among the
Critics") — usable on headphones and a lovely meta-narration for everyone.
**Sonification mode**: a clean musical rendering of the tree's structure (depth =
pitch, fan-out = chord density, **role = timbre**) conveying the recursion purely
through sound. **Haptic phone mode**: `/crowd` buzzes on spawns/drops via the
Vibration API. **High-contrast / reduced-motion themes** (honoring
`prefers-reduced-motion`, which also clamps the aesthetic genome). All browser-native,
all offline-capable.

---

## 19. Demo / replay mode (the Ringmaster) — role-differentiated & myth-generating

The show must never go dark. `demo.ts` keeps the floor alive and is rich enough to
headline if no real agents run:

- **Auto-activation**: no new real event for N seconds (default 8s) or no log file →
  Ringmaster turns on. A real event pauses it instantly (real always wins). A
  LIVE/DEMO badge keeps it honest.
- **Same schema, same path**: generates events with the exact real schema (`ts`,
  `pid`, `depth`, `event`, `childDepth`, `model`, `prompt`, `resultPreview`, optional
  `spawnId`/`label`/`tokens`) pushed through the **same hub/reducer/semantic/econ/
  myth/score/director/aesthetic path** — demo and live are visually identical and
  exercise every engine for real. Fake pids are negative integers.
- **Role-aware behavior model**: the demo's curated prompt pool is *tagged by role*,
  so the synthesized swarm forms believable **constellations** (a research cluster, a
  build cluster, a critique cluster) and the Mythographer gets real material — the
  fake night tells a real-feeling story with heroes and falls.
- **Economy + aesthetic loop**: rich lineages reproduce, poor ones wither and die; a
  scripted "crowd energy" curve feeds the aesthetic genome so the demo *visibly learns
  its taste on a loop.*
- **Simulated reflexivity & conducting (flagged)**: the demo occasionally fakes a
  "performer acknowledges the crowd" beat and a "conductor gesture," clearly marked
  DEMO, so those moments can be shown with no real agent / no human present.
- **Four flavors**:
  1. **Live-synth** (default) — real-time, dramatic, role- & economy-driven pacing.
  2. **Replay** — `--replay <file>` re-plays a captured `.session`/`.replay` at a
     chosen speed (re-stamping `ts`) for a deterministic rehearsed demo.
  3. **Scripted showpiece** — `--show` runs a hand-authored ~120s sequence: intro →
     **constellations form** → **saga begins** → crowd-spawn beat → reflexive beat →
     **conductor takes the baton** → boss drop at MAX_DEPTH → **aesthetic-genome
     reveal** → time-travel rewind → inter-venue cameo → finale + artifact print +
     zine layout.
  4. **Replay-as-truth** — any past `.session` *is* a valid show (scrub it, export it,
     album it, zine it, physicalize it, observability-report it), so a recorded great
     run becomes a reusable headline demo.
- **Dev helper**: `scripts/emit-fake-log.ts` appends synthetic events to a real test
  log so the full `fs.watch`→tail→history→hub path is tested end-to-end.

Keyboard controls: `D` toggle demo · `M` mute · `Space` manual bass-drop spawn · `F`
fullscreen · `R` reset camera · `C` cycle camera mode · `P` cycle palette · `K`
keystone-calibration · `~` VJ console · `N` toggle narrator · `L` leaderboard · `[ ]`
scrub back/forward · `J` jump to next highlight · `S` spawn real agent (if
`--allow-spawn`) · `V` toggle REC · `A` cycle a11y mode · `E` cycle economy overlay ·
**`G` toggle semantic constellations · `Y` toggle mythology ribbon · `X` toggle Debug
Mode · `B` toggle Conductor Mode · `0` toggle aesthetic-genome readout / freeze.**

---

## MVP Core (must ship)

**This is the safety net. If we only build this, the demo still lands.** Everything
above this line is ambition layered on top; nothing here depends on the fancy bits.
**This is unchanged from v2/v3 on purpose** — every new faculty sits *above* it.

1. **Bun server runs**: `bun run app/server.ts` serves `index.html` and a `/ws` that
   connects. Green "connected" badge.
2. **Real log tailing**: `tailer.ts` + `ringbuffer.ts` + `hub.ts` tail
   `~/.claude/super-agent.log`, broadcast each parsed event, and snapshot-on-connect
   so a fresh browser sees the existing tree.
3. **Correct tree**: `shared/reducer.js` folds events into the AgentGraph with the
   parent→child correlation matcher (unit-tested for spawn / server_start /
   child_done stitching; `spawnId` is an optional fast-path, heuristic is baseline).
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
WebGPU/3D, generative scoring, spatial audio, narration, VJ/crowd, economy, reflexive
agents, bidirectional spawn-bridge, time-travel scrubbing, shared sessions,
recording/export, physicalization, the a11y companion, **and all v4 faculties:
semantic constellations, emergent mythology, conductor mode, the self-tuning
aesthetic genome, the album/poster/zine cross-modal outputs, and Debug-Mode/
observability.** Each is a self-contained organ with an off-switch; none is
load-bearing for an honest demo. (Note: `semantic.ts` is offline and cheap enough that
even a *partial* role-tint in `flat2d.js` is a low-cost, high-impact early win — but it
is still strictly optional.)

---

## 20. Milestones (MVP first, ambition stacked after)

**M0 — Skeleton (run it).** `Bun.serve` serves a black `index.html` + `/ws`
heartbeat. *Done: page loads, WS badge green.*

**M1 — Real data flowing.** `tailer.ts` + `ringbuffer.ts` + `hub.ts`; browser `ws.js`
+ `store.js` log received events. *Done: a real super_agent run (or appended lines)
shows events in the browser console.*

**M2 — Reducer + flat visual.** `shared/reducer.js` builds the AgentGraph with the
correlation matcher (+ unit tests). `flat2d.js` draws depth-ring circles + lineage
lines. Ugly but correct. *Done: a 3-deep tree renders with correct lineage.*

**M3 — Demo mode (safety milestone).** `demo.ts` Ringmaster + auto-activation +
LIVE/DEMO badge. *Done: `bun run` on an empty log shows a churning tree.* **→ THE DEMO
SAFETY NET. Prioritize before any 3D.**

**M4 — The rave, flat edition.** Spawn bursts, flowing tethers, energy pulses on done,
beat-synced pulses on Canvas2D; basic WebAudio synth + analyser; "TAP TO ENTER"
splash; transcripts + backstage feed + HUD. *Done: MVP Core fully shippable, looks
good on a projector.*

**M5 — Go 3D.** `engine.js` renderer abstraction (WebGPU→WebGL2→Canvas2D);
`scene3d.js` dome + ring-stage + lighting + bloom; `orbs.js` instanced performers;
`tethers.js` ribbons; `camera.js` orbit. *Done: same tree in the 3D big-top, clean
fallback when WebGPU absent.*

**M6 — Semantics + Generative score + Director (+ spatial).** `semantic.ts` (offline)
roles + clusters → role tints + the first constellation regions; `score.ts`/
`audio/score.js` layered depth stems + role timbre + build/drop; `director.ts` camera
+ narration cues; `narrator.js` Ringmaster; `spatial.js` 3D panning. *Done: the swarm
self-organizes by meaning, music is visibly agent-driven, the tree is audible in
space.*

**M7 — Spectacle + Economy + Mythology.** Personalities/seeds, god-rays, post FX,
`econ.ts` (spark/birth/death + ecosystem scoreboard), `myth.ts` + the mythology ribbon
+ Story panel, palette themes, lineage spotlight. *Done: jaw-dropping full-screen, the
swarm feels alive, and it's telling the story of its own night.*

**M8 — Crowd + VJ + Conductor + projection.** `/control`, `/crowd` + QR, `/vj`
console, **`/conduct` + `conductor/gestures.js` (webcam hand-track + touch/tilt
fallback)**, `warp.js` keystone calibration, multi-screen sync. *Done: an operator
steers the show, the crowd pulses from phones, and a human can conduct the swarm with
their hands.*

**M9 — The Self-Tuning Aesthetic.** `aesthetic.ts` genome + hill-climb on crowd-energy
fitness + the genome readout + `--genome freeze`. *Done: the show visibly evolves its
taste over a session and reveals the drift at the finale.*

**M10 — Time-travel.** `history.ts` journal + `scrubber.js` + scrub bar + rewind FX +
highlight chapters + backward audio (re-folds semantics/myth/econ too). *Done: the VJ
rewinds and fast-forwards the entire run and catches back up to live.*

**M11 — Bidirectional + Reflexive.** `spawn-bridge.ts` + crowd prompt-cards (guarded,
`--allow-spawn`); `reflex.ts` + `perceive_show` (role-aware). *Done: the crowd spawns
a real performer and a real agent quotes the room — and its cast role.*

**M12 — Dual-Use / Observability.** `observe.ts` + `debug.js` Debug Mode (flame-graph,
stuck-lineage, blast-radius, role timeline, cost heat) + `scripts/observability-
report.ts`. *Done: one toggle turns the rave into a real nested-agent debugger; the
offline report stands on its own.*

**M13 — Shared sessions.** `session.ts` + `/session/:id/ws` + `--relay`; per-venue
tints, inter-venue comets, split scoreboard, shared constellations + saga. *Done: two
browsers/venues share one live tree in phase.*

**M14 — Afterlife & cross-modal.** `recorder.js` + `scripts/export-video.ts` +
take-home QR; **`scripts/export-album.ts` (soundtrack), `scripts/make-zine.ts` (zine +
poster)**, `scripts/physicalize.ts` (SVG/G-code/STL); the `a11y/` companion (captions,
audio-description, role-aware sonification, haptics, high-contrast/reduced-motion).
*Done: the run becomes a film, an album, a poster, a printed zine, a physical tree,
and is fully accessible.*

**M15 — Hardening & showpiece.** Reconnect robustness, log rotation/truncation,
particle caps for stable FPS, spawn-bridge kill-switch & limits, conductor debounce/
quantize, genome bounds + reduced-motion clamps, `--replay` + `--show` scripted ~120s
sequence (constellations → saga → crowd-spawn → reflexive → conductor → boss drop →
genome reveal → rewind → inter-venue → finale + artifact + zine), 30-min soak test.
*Done: it survives a live session and has a rehearsed showpiece loop.*

Stretch beyond M15: Claude-powered live myth prose + witty narration via Soda Straw;
Claude-powered semantic role/cluster naming (`SEMANTIC_MODE=claude`); agent
"duels"/mini-games when two constellations cross; a persisted cross-session "hall of
fame" + a permanent installation that grows a coral reef of every run ever performed;
the aesthetic genome persisted across nights so the venue's organism develops a
*house style*; AR/phone-as-second-screen views into the dome; venue-rig surround
output mapped to physical speakers.

---

### Run

```bash
bun run app/server.ts                              # http://localhost:3000, tails ~/.claude/super-agent.log
SUPER_AGENT_LOG=./test.log bun run app/server.ts   # point at a test log
bun run app/server.ts --demo                       # force Ringmaster on
bun run app/server.ts --show                        # scripted ~120s pitch showpiece
bun run app/server.ts --replay session.session --speed 1.5   # rehearsed deterministic demo
bun run app/server.ts --allow-spawn                 # let the crowd/VJ/conductor spawn REAL agents (guarded)
bun run app/server.ts --semantic claude             # sharper roles/clusters via Soda Straw (optional)
bun run app/server.ts --genome freeze               # pin the aesthetic genome for a rehearsed show
bun run app/server.ts --session ghent --relay wss://coord.example/session/hack   # multi-venue

bun run app/scripts/export-video.ts session.session out.webm            # cinematic recap
bun run app/scripts/export-album.ts session.session album/              # the night's soundtrack stems
bun run app/scripts/make-zine.ts session.session zine.pdf               # printed zine of the night
bun run app/scripts/physicalize.ts session.session tree.svg             # take-home artifact
bun run app/scripts/observability-report.ts session.session report.html # the dual-use post-mortem

# audience: open the big screen at /, project it; show /qr so the crowd can join /crowd
# operator: press ~ for the VJ console (or /vj); [ ] to scrub, S to spawn, V to record,
#           B to arm Conductor Mode, X for Debug Mode, G for constellations, Y for the saga
# conductor: open /conduct (or stand before the webcam) and shape the swarm with your hands
```
