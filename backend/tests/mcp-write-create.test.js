import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { createTestMcpClient } from "./mcp-test-client.js";

let ws, prj, otherPrj, mcp;

before(async () => {
  setDB(await setupTestDB());
  ws = createTestCtx("member");
  const otherWs = createTestCtx("member");
  prj = await projectService.create({ name: "Alpha", key: "ALP" }, ws);
  otherPrj = await projectService.create({ name: "Beta", key: "BET" }, otherWs);
  mcp = await createTestMcpClient(ws);
});
after(async () => { await mcp?.close(); await teardownTestDB(); });

test("task_create creates task and subtask successfully", async () => {
  const r1 = await mcp.call("task_create", { projectId: prj.id, title: "Parent Task", priority: "high" });
  assert.equal(r1.structuredContent.success, true);
  assert.equal(r1.structuredContent.data.task.key, "ALP-1");
  const pId = r1.structuredContent.data.task.id;
  const r2 = await mcp.call("task_create", { projectId: prj.id, title: "Subtask", parentTaskId: pId });
  assert.equal(r2.structuredContent.success, true);
  assert.equal(r2.structuredContent.data.task.key, "ALP-2");
});

test("task_create enforces project workspace, viewer role and scope", async () => {
  const rCross = await mcp.call("task_create", { projectId: otherPrj.id, title: "Sneaky" });
  assert.equal(rCross.isError, true);
  assert.ok(rCross.structuredContent.error.includes("not found"));

  const vMcp = await createTestMcpClient({ ...ws, role: "viewer" });
  const rView = await vMcp.call("task_create", { projectId: prj.id, title: "Viewer Task" });
  assert.equal(rView.isError, true);
  const errMsg = rView.structuredContent?.error || rView.content?.[0]?.text;
  assert.ok(errMsg.includes("Forbidden") || errMsg.includes("permissions") || errMsg.includes("Access denied"));
  await vMcp.close();

  const sMcp = await createTestMcpClient({ ...ws, scopes: ["projects:read"] });
  const rScope = await sMcp.call("task_create", { projectId: prj.id, title: "No Scope Task" });
  assert.equal(rScope.isError, true);
  assert.ok(rScope.structuredContent.error.includes("tasks:write"));
  await sMcp.close();
});
