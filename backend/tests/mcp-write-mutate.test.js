import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB, getDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { taskService } from "../src/modules/tasks/task.service.js";
import { createTestMcpClient } from "./mcp-test-client.js";
import { ObjectId } from "mongodb";

let ws, task, memberId, mcp;

before(async () => {
  setDB(await setupTestDB());
  ws = createTestCtx("member");
  const prj = await projectService.create({ name: "Core", key: "COR" }, ws);
  task = await taskService.create(ws, prj.id, { title: "Original" });
  memberId = new ObjectId();
  await getDB().collection("workspace_members").insertOne({ workspaceId: ws.workspaceId, userId: memberId, role: "member" });
  mcp = await createTestMcpClient(ws);
});
after(async () => { await mcp?.close(); await teardownTestDB(); });

test("task_update modifies fields and rejects empty updates", async () => {
  const r1 = await mcp.call("task_update", { taskId: task.id, title: "Updated Title", priority: "critical" });
  assert.equal(r1.structuredContent.success, true);
  assert.equal(r1.structuredContent.data.task.title, "Updated Title");
  assert.equal(r1.structuredContent.data.task.priority, "critical");

  const rEmpty = await mcp.call("task_update", { taskId: task.id });
  assert.equal(rEmpty.isError, true);
  assert.ok(rEmpty.structuredContent.error.includes("mutable field"));
});

test("task_assign assigns eligible member, unassigns, and rejects outsider", async () => {
  const rAssign = await mcp.call("task_assign", { taskId: task.id, assigneeId: memberId.toString() });
  assert.equal(rAssign.structuredContent.success, true);
  assert.equal(rAssign.structuredContent.data.assigneeId, memberId.toString());

  const rUnassign = await mcp.call("task_assign", { taskId: task.id, assigneeId: null });
  assert.equal(rUnassign.structuredContent.success, true);
  assert.equal(rUnassign.structuredContent.data.assigneeId, null);

  const rForeign = await mcp.call("task_assign", { taskId: task.id, assigneeId: new ObjectId().toString() });
  assert.equal(rForeign.isError, true);
  assert.ok(rForeign.structuredContent.error.includes("not a workspace member"));
});
