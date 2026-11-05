import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { taskService } from "../src/modules/tasks/task.service.js";
import { createTestMcpClient } from "./mcp-test-client.js";

let ws, t1, t2, t3, mcp;

before(async () => {
  setDB(await setupTestDB());
  ws = createTestCtx("member");
  const prj = await projectService.create({ name: "Deps", key: "DEP" }, ws);
  t1 = await taskService.create(ws, prj.id, { title: "T1" });
  t2 = await taskService.create(ws, prj.id, { title: "T2" });
  t3 = await taskService.create(ws, prj.id, { title: "T3" });
  mcp = await createTestMcpClient(ws);
});
after(async () => { await mcp?.close(); await teardownTestDB(); });

test("task_dependency_add creates dependency and rejects self/duplicate/cycle", async () => {
  const rSelf = await mcp.call("task_dependency_add", { taskId: t1.id, dependsOnTaskId: t1.id });
  assert.equal(rSelf.isError, true);
  assert.ok(rSelf.structuredContent.error.includes("Self-dependency"));

  const r1 = await mcp.call("task_dependency_add", { taskId: t2.id, dependsOnTaskId: t1.id });
  assert.equal(r1.structuredContent.success, true);

  const rDup = await mcp.call("task_dependency_add", { taskId: t2.id, dependsOnTaskId: t1.id });
  assert.equal(rDup.isError, true);
  assert.ok(rDup.structuredContent.error.includes("already exists"));

  await mcp.call("task_dependency_add", { taskId: t3.id, dependsOnTaskId: t2.id });
  const rCycle = await mcp.call("task_dependency_add", { taskId: t1.id, dependsOnTaskId: t3.id });
  assert.equal(rCycle.isError, true);
  assert.ok(rCycle.structuredContent.error.includes("Circular dependency"));

  const sMcp = await createTestMcpClient({ ...ws, scopes: ["tasks:read"] });
  const rScope = await sMcp.call("task_dependency_add", { taskId: t1.id, dependsOnTaskId: t2.id });
  assert.equal(rScope.isError, true);
  assert.ok(rScope.structuredContent.error.includes("dependencies:write"));
  await sMcp.close();
});
