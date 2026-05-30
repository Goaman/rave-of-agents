// Proves SuperTree attributes PARALLEL sibling spawns correctly even when they
// start and finish out of spawn order — the case that FIFO stitching got wrong.
//
// Run:  bun run app/super-tree.test.ts   (exit 0 = pass, 1 = fail)

import { SuperTree, type RawEvent } from "./super-tree.ts";

let failures = 0;
function check(cond: boolean, msg: string) {
  if (cond) {
    console.log(`\x1b[32m✓\x1b[0m ${msg}`);
  } else {
    console.error(`\x1b[31m✗ FAIL:\x1b[0m ${msg}`);
    failures++;
  }
}

// Scenario: the depth-0 console agent (pid 100) spawns THREE children in one
// parallel turn (cids a/b/c). They start and finish in a different order than
// they were spawned — exactly what parallelism produces. With cid correlation,
// each result must land on its own node.
const t = new SuperTree();
const ev = (e: RawEvent) => t.apply(e);

// Parent fires three spawns back-to-back.
ev({ pid: 100, depth: 0, event: "spawn", cid: "100.1", childDepth: 1, prompt: "alpha" });
ev({ pid: 100, depth: 0, event: "spawn", cid: "100.2", childDepth: 1, prompt: "beta" });
ev({ pid: 100, depth: 0, event: "spawn", cid: "100.3", childDepth: 1, prompt: "gamma" });

// Children come online out of order (beta first, then gamma, then alpha).
ev({ pid: 202, depth: 1, event: "server_start", cid: "100.2" });
ev({ pid: 203, depth: 1, event: "server_start", cid: "100.3" });
ev({ pid: 201, depth: 1, event: "server_start", cid: "100.1" });

// gamma spawns a grandchild of its own — must attach under gamma, not whoever
// FIFO would pick. (gamma is pid 203.)
ev({ pid: 203, depth: 1, event: "spawn", cid: "203.1", childDepth: 2, prompt: "gamma-child" });
ev({ pid: 230, depth: 2, event: "server_start", cid: "203.1" });

// Completions arrive in yet another order: gamma-child, alpha, gamma, beta.
ev({ pid: 203, depth: 1, event: "child_done", cid: "203.1", result: "R-gamma-child" });
ev({ pid: 100, depth: 0, event: "child_done", cid: "100.1", result: "R-alpha" });
ev({ pid: 100, depth: 0, event: "child_done", cid: "100.3", result: "R-gamma" });
ev({ pid: 100, depth: 0, event: "child_done", cid: "100.2", result: "R-beta" });

const nodes = t.list();
const byPrompt = (p: string) => nodes.find((n) => n.prompt === p)!;

const alpha = byPrompt("alpha");
const beta = byPrompt("beta");
const gamma = byPrompt("gamma");
const gammaChild = byPrompt("gamma-child");

check(nodes.length === 4, `4 nodes tracked (got ${nodes.length})`);
check(alpha?.result === "R-alpha", "alpha got its own result despite finishing 2nd");
check(beta?.result === "R-beta", "beta got its own result despite finishing last");
check(gamma?.result === "R-gamma", "gamma got its own result");
check(gammaChild?.result === "R-gamma-child", "grandchild got its own result");

// The grandchild must hang off gamma — proving server_start bound the right pid.
check(gammaChild?.parentKey === gamma?.key, "grandchild is parented to gamma (correct subtree)");
check(alpha?.status === "done" && beta?.status === "done" && gamma?.status === "done", "all siblings done");

// Sanity: legacy logs without cid still resolve via FIFO fallback.
const t2 = new SuperTree();
t2.apply({ pid: 1, depth: 0, event: "spawn", childDepth: 1, prompt: "legacy" });
t2.apply({ pid: 9, depth: 1, event: "server_start" });
t2.apply({ pid: 1, depth: 0, event: "child_done", childDepth: 1, result: "L" });
check(t2.list()[0]?.result === "L", "legacy (no-cid) FIFO fallback still works");

if (failures) {
  console.error(`\n\x1b[31m${failures} check(s) failed\x1b[0m`);
  process.exit(1);
}
console.log("\n\x1b[32mPASS\x1b[0m — parallel sibling attribution is correct.");
