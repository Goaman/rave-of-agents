// On-disk persistence so sessions survive a server restart. Each session is one
// JSON file (meta + transcript + sub-agent tree); per-session super-agent logs
// live alongside so the lineage tree can be re-derived on resume.

import { mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { SessionSnapshot } from "./types.ts";

export const DATA_DIR = process.env.AGENT_CONSOLE_DIR || join(homedir(), ".agent-console");
const SESS_DIR = join(DATA_DIR, "sessions");
export const LOG_DIR = join(DATA_DIR, "logs");
mkdirSync(SESS_DIR, { recursive: true });
mkdirSync(LOG_DIR, { recursive: true });

export function logPathFor(id: string): string {
  return join(LOG_DIR, `${id}.log`);
}

export function loadAll(): SessionSnapshot[] {
  try {
    return readdirSync(SESS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        try {
          return JSON.parse(readFileSync(join(SESS_DIR, f), "utf8")) as SessionSnapshot;
        } catch {
          return null;
        }
      })
      .filter((s): s is SessionSnapshot => !!s)
      .sort((a, b) => a.createdAt - b.createdAt);
  } catch {
    return [];
  }
}

export function save(s: SessionSnapshot) {
  try {
    writeFileSync(join(SESS_DIR, `${s.id}.json`), JSON.stringify(s));
  } catch {
    /* best-effort */
  }
}

export function remove(id: string) {
  try {
    rmSync(join(SESS_DIR, `${id}.json`));
  } catch {
    /* ignore */
  }
}
