// Tiny REST API for the per-worktree project board. Returns a Response for any
// /api/pm* route, or null so the caller can fall through to static serving.
//
// Every mutating endpoint returns the full new {projects, tasks} state, so the
// client can simply replace its store — no incremental sync to get wrong.

import {
  createProject,
  createTask,
  deleteProject,
  deleteTask,
  getState,
  updateProject,
  updateTask,
} from "./pm-store.ts";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

async function body(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

export async function handlePmRequest(req: Request, url: URL): Promise<Response | null> {
  const path = url.pathname;
  if (!path.startsWith("/api/pm")) return null;

  const method = req.method.toUpperCase();
  // Segments after /api/pm: e.g. ["projects", "<id>"] or ["tasks", "<id>"].
  const seg = path.slice("/api/pm".length).split("/").filter(Boolean);

  // GET /api/pm — full board
  if (seg.length === 0) {
    if (method === "GET") return json(getState());
    return json({ error: "method not allowed" }, 405);
  }

  const [collection, resourceId] = seg;

  if (collection === "projects") {
    if (!resourceId) {
      if (method === "POST") {
        createProject(await body(req));
        return json(getState(), 201);
      }
      return json({ error: "method not allowed" }, 405);
    }
    if (method === "PATCH") {
      const updated = updateProject(resourceId, await body(req));
      if (!updated) return json({ error: "project not found" }, 404);
      return json(getState());
    }
    if (method === "DELETE") {
      if (!deleteProject(resourceId)) return json({ error: "project not found" }, 404);
      return json(getState());
    }
    return json({ error: "method not allowed" }, 405);
  }

  if (collection === "tasks") {
    if (!resourceId) {
      if (method === "POST") {
        const created = createTask(await body(req));
        if (!created) return json({ error: "unknown or missing projectId" }, 400);
        return json(getState(), 201);
      }
      return json({ error: "method not allowed" }, 405);
    }
    if (method === "PATCH") {
      const updated = updateTask(resourceId, await body(req));
      if (!updated) return json({ error: "task not found" }, 404);
      return json(getState());
    }
    if (method === "DELETE") {
      if (!deleteTask(resourceId)) return json({ error: "task not found" }, 404);
      return json(getState());
    }
    return json({ error: "method not allowed" }, 405);
  }

  return json({ error: "not found" }, 404);
}
