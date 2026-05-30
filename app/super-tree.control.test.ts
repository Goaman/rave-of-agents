// Focused tests for the sub-agent control additions to SuperTree: capturing the
// killable childPid + resumable sessionId from the log, and driving follow-up
// (resume) turns directly. Run with: bun run app/super-tree.control.test.ts
import { SuperTree } from "./super-tree.ts";

let failures = 0;
function check(name: string, cond: boolean) {
  if (cond) {
    console.log(`  ok  ${name}`);
  } else {
    failures++;
    console.error(`FAIL  ${name}`);
  }
}

// --- 1. spawn captures childPid; child_done captures sessionId + turn ----------
{
  const t = new SuperTree();
  // depth-0 server spawns an L1 child (childPid = the killable process group).
  t.apply({ pid: 100, depth: 0, event: "spawn", childDepth: 1, prompt: "do X", childPid: 4242 });
  let n = t.list()[0];
  check("spawn creates one node", t.list().length === 1);
  check("spawn records childPid", n.childPid === 4242);
  check("spawn seeds a running turn", n.turns.length === 1 && n.turns[0].status === "running");
  check("spawn turn carries the prompt", n.turns[0].prompt === "do X");

  // The child's own MCP server announces itself (binds the node's pid).
  t.apply({ pid: 555, depth: 1, event: "server_start" });
  n = t.list()[0];
  check("server_start binds pid + running", n.pid === 555 && n.status === "running");

  // The child finishes and reports its session id.
  t.apply({ pid: 100, depth: 0, event: "child_done", childDepth: 1, result: "answer", resultPreview: "answer", sessionId: "sess-abc" });
  n = t.list()[0];
  check("child_done marks done", n.status === "done");
  check("child_done captures sessionId", n.sessionId === "sess-abc");
  check("child_done clears childPid", n.childPid === null);
  check("child_done finishes the turn", n.turns[0].status === "done" && n.turns[0].result === "answer");
}

// --- 2. follow-up (resume) turns via startTurn/finishTurn ----------------------
{
  const t = new SuperTree();
  t.apply({ pid: 100, depth: 0, event: "spawn", childDepth: 1, prompt: "first", childPid: 10 });
  t.apply({ pid: 9, depth: 1, event: "server_start" });
  t.apply({ pid: 100, depth: 0, event: "child_done", childDepth: 1, result: "r1", sessionId: "s1" });
  const key = t.list()[0].key;

  const node = t.startTurn(key, "follow up please");
  check("startTurn returns the node", !!node && node.depth === 1);
  let n = t.byKey(key)!;
  check("startTurn flips node back to running", n.status === "running");
  check("startTurn appends a 2nd turn", n.turns.length === 2 && n.turns[1].status === "running");

  check("setChildPid records the resume pid", t.setChildPid(key, 777) && t.byKey(key)!.childPid === 777);

  t.finishTurn(key, true, "r2", "s2");
  n = t.byKey(key)!;
  check("finishTurn marks done", n.status === "done");
  check("finishTurn updates result", n.result === "r2");
  check("finishTurn refreshes sessionId", n.sessionId === "s2");
  check("finishTurn clears childPid", n.childPid === null);
  check("finishTurn closes the 2nd turn", n.turns[1].status === "done" && n.turns[1].result === "r2");
}

// --- 3. interrupt of the first run: child_exit marks error + finishes turn ------
{
  const t = new SuperTree();
  t.apply({ pid: 100, depth: 0, event: "spawn", childDepth: 1, prompt: "long task", childPid: 33 });
  t.apply({ pid: 8, depth: 1, event: "server_start" });
  // Worker kills the process group -> parent logs child_exit.
  t.apply({ pid: 100, depth: 0, event: "child_exit", childDepth: 1 });
  const n = t.list()[0];
  check("child_exit marks error", n.status === "error");
  check("child_exit clears childPid", n.childPid === null);
  check("child_exit finishes the turn as error", n.turns[0].status === "error");
}

// --- 4. hydrate restores nodes + reseeds key counter and pid map ---------------
{
  const t = new SuperTree();
  t.hydrate([
    {
      key: "n5", pid: 200, depth: 1, parentKey: null, model: null,
      prompt: "p", resultPreview: "r", result: "r", status: "done",
      startedAt: 1, childPid: null, sessionId: "sX",
      turns: [{ prompt: "p", result: "r", status: "done", startedAt: 1 }],
    },
  ]);
  check("hydrate adopts the node", t.byKey("n5")?.sessionId === "sX");
  // A new spawn must get a key beyond the restored max (n5), not collide with it.
  t.apply({ pid: 1, depth: 0, event: "spawn", childDepth: 1, prompt: "new" });
  const fresh = t.list().find((x) => x.prompt === "new")!;
  check("hydrate reseeds the key counter", fresh.key === "n6");
}

// --- 5. legacy node (no turns) is given a synthetic turn on hydrate ------------
{
  const t = new SuperTree();
  t.hydrate([
    {
      key: "n1", pid: null, depth: 1, parentKey: null, model: null,
      prompt: "legacy", resultPreview: "old", result: "old", status: "done",
      startedAt: 1, childPid: null, sessionId: null,
      // no `turns` field (pre-feature snapshot)
    } as any,
  ]);
  const n = t.byKey("n1")!;
  check("legacy node gets a synthetic turn", n.turns.length === 1 && n.turns[0].result === "old");
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILED`);
if (failures) process.exit(1);
