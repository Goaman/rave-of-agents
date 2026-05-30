#!/usr/bin/env node
// A stand-in for the real `claude` CLI used by the parallel-spawn test.
// It ignores its args except for `--sleep <ms>` (injected via SUPER_AGENT_FAKE_SLEEP),
// sleeps to simulate work, then prints the same JSON shape `claude -p --output-format json`
// would: { result, is_error }. It also stamps start/end timestamps to a shared log so
// the test can prove two invocations overlapped in time (ran in parallel).

import { appendFileSync } from "node:fs";

const sleepMs = parseInt(process.env.SUPER_AGENT_FAKE_SLEEP || "500", 10);
const timeline = process.env.SUPER_AGENT_FAKE_TIMELINE;

// The prompt is passed positionally after `-p`.
const pIdx = process.argv.indexOf("-p");
const prompt = pIdx !== -1 ? process.argv[pIdx + 1] : "";

function stamp(event) {
  if (!timeline) return;
  try {
    appendFileSync(timeline, JSON.stringify({ t: Date.now(), event, prompt }) + "\n");
  } catch {
    /* best-effort */
  }
}

stamp("start");
setTimeout(() => {
  stamp("end");
  process.stdout.write(
    JSON.stringify({ result: `done: ${prompt}`, is_error: false }) + "\n",
  );
  process.exit(0);
}, sleepMs);
