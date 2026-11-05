import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB, getDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { taskService } from "../src/modules/tasks/task.service.js";
import { createTestMcpClient } from "./mcp-test-client.js";

let ws, task, mcp;

before(async () => {
  setDB(await setupTestDB());
  ws = createTestCtx("member");
  const prj = await projectService.create({ name: "Lifecycle", key: "LIFE" }, ws);
  task = await taskService.create(ws, prj.id, { title: "Cycle Task" });
  mcp = await createTestMcpClient(ws);
});
after(async () => { await mcp?.close(); await teardownTestDB(); });

test("task_transition executes valid change and blocks invalid done", async () => {
  const r1 = await mcp.call("task_transition", { taskId: task.id, status: "in_progress" });
  assert.equal(r1.structuredContent.success, true);
  assert.equal(r1.structuredContent.data.previousStatus, "backlog");
  assert.equal(r1.structuredContent.data.status, "in_progress");

  await taskService.block(ws, task.id, "Wait on review");
  const rBlocked = await mcp.call("task_transition", { taskId: task.id, status: "done" });
  assert.equal(rBlocked.isError, true);
  assert.ok(rBlocked.structuredContent.error.includes("blocked"));
});

test("task_comment_create adds comment and validates non-empty content", async () => {
  const r1 = await mcp.call("task_comment_create", { taskId: task.id, content: "Great progress!" });
  assert.equal(r1.structuredContent.success, true);
  assert.equal(r1.structuredContent.data.taskId, task.id);

  const doc = await getDB().collection("comments").findOne({ _id: r1.structuredContent.data.commentId });
  if (doc) assert.equal(doc.authorId.toString(), ws.userId.toString());

  const rEmpty = await mcp.call("task_comment_create", { taskId: task.id, content: "" });
  assert.equal(rEmpty.isError, true);
  const errMsg = rEmpty.structuredContent?.error || rEmpty.content?.[0]?.text;
  assert.ok(errMsg.includes("empty") || errMsg.includes("Character count") || errMsg.includes("validation"));
});
