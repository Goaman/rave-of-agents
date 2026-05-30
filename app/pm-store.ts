// Local, per-worktree project board: projects + tasks with CRUD, persisted to a
// single JSON file at the worktree root (so every worktree gets its own board).
//
// Deliberately dependency-free and synchronous: the board is small and the file
// is rewritten on every mutation. The server exposes these functions over a tiny
// REST API (see server.ts).

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PmState, Project, Task, TaskStatus } from "./types.ts";

// app/ lives one level below the worktree root; store the board there by default.
const WORKTREE_ROOT = join(import.meta.dir, "..");
const DATA_FILE = process.env.PM_DATA_FILE || join(WORKTREE_ROOT, ".pm-data.json");

const STATUSES: TaskStatus[] = ["todo", "in_progress", "blocked", "done"];
const now = () => Date.now();
const id = () => crypto.randomUUID();

function load(): PmState {
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Partial<PmState>;
    return { projects: raw.projects ?? [], tasks: raw.tasks ?? [] };
  } catch {
    return { projects: [], tasks: [] };
  }
}

// In-memory copy kept in sync with disk; the file is the source of truth on boot.
let state: PmState = load();

function persist() {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
  } catch {
    /* best-effort; the in-memory state still serves the session */
  }
}

export function getState(): PmState {
  return state;
}

// ---- Projects ----

export function createProject(input: { name?: string; description?: string }): Project {
  const t = now();
  const project: Project = {
    id: id(),
    name: (input.name ?? "").trim() || "Untitled project",
    description: (input.description ?? "").trim(),
    createdAt: t,
    updatedAt: t,
  };
  state.projects.push(project);
  persist();
  return project;
}

export function updateProject(
  pid: string,
  patch: { name?: string; description?: string },
): Project | null {
  const p = state.projects.find((x) => x.id === pid);
  if (!p) return null;
  if (patch.name !== undefined) p.name = patch.name.trim() || p.name;
  if (patch.description !== undefined) p.description = patch.description;
  p.updatedAt = now();
  persist();
  return p;
}

export function deleteProject(pid: string): boolean {
  const before = state.projects.length;
  state.projects = state.projects.filter((x) => x.id !== pid);
  // Cascade: drop the project's tasks too.
  state.tasks = state.tasks.filter((x) => x.projectId !== pid);
  const removed = state.projects.length < before;
  if (removed) persist();
  return removed;
}

// ---- Tasks ----

function normalizeStatus(s: unknown): TaskStatus {
  return STATUSES.includes(s as TaskStatus) ? (s as TaskStatus) : "todo";
}

export function createTask(input: {
  projectId?: string;
  title?: string;
  notes?: string;
  status?: TaskStatus;
  branch?: string;
  cwd?: string;
}): Task | null {
  const projectId = input.projectId ?? "";
  if (!state.projects.some((p) => p.id === projectId)) return null; // unknown project
  const t = now();
  const task: Task = {
    id: id(),
    projectId,
    title: (input.title ?? "").trim() || "Untitled task",
    notes: (input.notes ?? "").trim(),
    status: normalizeStatus(input.status),
    branch: (input.branch ?? "").trim(),
    cwd: (input.cwd ?? "").trim(),
    createdAt: t,
    updatedAt: t,
  };
  state.tasks.push(task);
  persist();
  return task;
}

export function updateTask(
  tid: string,
  patch: {
    title?: string;
    notes?: string;
    status?: TaskStatus;
    branch?: string;
    cwd?: string;
  },
): Task | null {
  const task = state.tasks.find((x) => x.id === tid);
  if (!task) return null;
  if (patch.title !== undefined) task.title = patch.title.trim() || task.title;
  if (patch.notes !== undefined) task.notes = patch.notes;
  if (patch.status !== undefined) task.status = normalizeStatus(patch.status);
  if (patch.branch !== undefined) task.branch = patch.branch.trim();
  if (patch.cwd !== undefined) task.cwd = patch.cwd.trim();
  task.updatedAt = now();
  persist();
  return task;
}

export function deleteTask(tid: string): boolean {
  const before = state.tasks.length;
  state.tasks = state.tasks.filter((x) => x.id !== tid);
  const removed = state.tasks.length < before;
  if (removed) persist();
  return removed;
}
