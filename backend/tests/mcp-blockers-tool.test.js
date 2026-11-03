import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { taskService } from "../src/modules/tasks/task.service.js";
import { dependencyService } from "../src/modules/dependencies/dependency.service.js";
import { createServerInstance } from "../src/mcp/mcp.server.js";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createMcpHandler } from "@modelcontextprotocol/server";

let ws, p1, tExp, tDep, tPrereq, client, handler;

before(async () => {
  setDB(await setupTestDB());
  ws = createTestCtx("owner");
  p1 = await projectService.create({ name: "BlockProj", key: "BLCK" }, ws);
  tExp = await taskService.create(ws, p1.id, { title: "Explicit Block" });
  await taskService.block(ws, tExp.id, "Waiting on API token");
  tPrereq = await taskService.create(ws, p1.id, { title: "Prereq" });
  tDep = await taskService.create(ws, p1.id, { title: "Blocked by Prereq" });
  await dependencyService.add(ws, tDep.id, { dependsOnTaskId: tPrereq.id });
  const server = await createServerInstance(ws);
  handler = createMcpHandler(() => server);
  const transport = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init))
  });
  client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
});

after(async () => { await client?.close(); await handler?.close(); await teardownTestDB(); });

test("report_blockers identifies explicit and dependency blocked tasks separately", async () => {
  const res = await client.callTool({ name: "report_blockers", arguments: { projectId: p1.id } });
  const report = res.structuredContent.data;
  assert.equal(report.summary.total, 2);
  assert.equal(report.summary.explicit, 1);
  assert.equal(report.summary.dependency, 1);
  const expItem = report.tasks.find((t) => t.taskId === tExp.id);
  assert.equal(expItem.blockType, "explicit");
  assert.equal(expItem.blockerReason, "Waiting on API token");
  const depItem = report.tasks.find((t) => t.taskId === tDep.id);
  assert.equal(depItem.blockType, "dependency");
  assert.equal(depItem.dependencies[0].key, tPrereq.key);
});
