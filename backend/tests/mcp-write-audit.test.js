import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB, getDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { createTestMcpClient } from "./mcp-test-client.js";

let ws, prj, mcp;

before(async () => {
  setDB(await setupTestDB());
  ws = createTestCtx("member");
  prj = await projectService.create({ name: "AuditPrj", key: "AUD" }, ws);
  mcp = await createTestMcpClient(ws);
});
after(async () => { await mcp?.close(); await teardownTestDB(); });

test("write tools generate audit records for both success and failure", async () => {
  const col = getDB().collection("mcp_audit_logs");
  const countBefore = await col.countDocuments();

  const rSuccess = await mcp.call("task_create", { projectId: prj.id, title: "Audit Task" });
  assert.equal(rSuccess.structuredContent.success, true);

  const rFail = await mcp.call("task_create", { projectId: "000000000000000000000000", title: "Fail Task" });
  assert.equal(rFail.isError, true);

  const successAudit = await col.findOne({ toolName: "task_create", success: true });
  assert.ok(successAudit);
  assert.equal(successAudit.workspaceId?.toString(), ws.workspaceId.toString());

  const failAudit = await col.findOne({ toolName: "task_create", success: false });
  assert.ok(failAudit);
  assert.equal(failAudit.errorCategory, "NOT_FOUND");
  assert.equal(failAudit.workspaceId?.toString(), ws.workspaceId.toString());

  const countAfter = await col.countDocuments();
  assert.equal(countAfter, countBefore + 2);
});
