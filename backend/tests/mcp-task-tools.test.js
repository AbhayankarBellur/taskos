import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { taskService } from "../src/modules/tasks/task.service.js";
import { createServerInstance } from "../src/mcp/mcp.server.js";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createMcpHandler } from "@modelcontextprotocol/server";

let ws1, p1, t1, t2, t3, client, handler;

before(async () => {
  setDB(await setupTestDB());
  ws1 = createTestCtx("owner"); const ws2 = createTestCtx("owner");
  p1 = await projectService.create({ name: "P1", key: "P1" }, ws1);
  const p2 = await projectService.create({ name: "P2", key: "P2" }, ws2);
  t1 = await taskService.create(ws1, p1.id, { title: "T1", priority: "high" });
  await taskService.transition(ws1, t1.id, "in_progress");
  t2 = await taskService.create(ws1, p1.id, { title: "T2", priority: "low" });
  t3 = await taskService.create(ws2, p2.id, { title: "Secret" });
  const server = await createServerInstance(ws1);
  handler = createMcpHandler(() => server);
  const transport = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init))
  });
  client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
});

after(async () => { await client?.close(); await handler?.close(); await teardownTestDB(); });

test("task_list filters by status and priority with pagination", async () => {
  const r1 = await client.callTool({ name: "task_list", arguments: { projectId: p1.id, status: "in_progress" } });
  assert.equal(r1.structuredContent.data.tasks[0].id, t1.id);
  const r2 = await client.callTool({ name: "task_list", arguments: { projectId: p1.id, priority: "low" } });
  assert.equal(r2.structuredContent.data.tasks[0].id, t2.id);
  const r3 = await client.callTool({ name: "task_list", arguments: { projectId: p1.id, page: 1, limit: 1 } });
  assert.equal(r3.structuredContent.data.pagination.limit, 1);
});

test("task_get returns task and denies cross-workspace task", async () => {
  const r1 = await client.callTool({ name: "task_get", arguments: { taskId: t1.id } });
  assert.equal(r1.structuredContent.data.task.id, t1.id);
  const r2 = await client.callTool({ name: "task_get", arguments: { taskId: t3.id } });
  assert.equal(r2.isError, true);
});
