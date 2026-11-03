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

let ws, p, t1, t3, client, handler;

before(async () => {
  setDB(await setupTestDB());
  ws = createTestCtx("owner");
  p = await projectService.create({ name: "Core", key: "CORE" }, ws);
  t1 = await taskService.create(ws, p.id, { title: "T1" });
  await taskService.block(ws, t1.id, "Waiting on SSL cert");
  const t2 = await taskService.create(ws, p.id, { title: "T2" });
  t3 = await taskService.create(ws, p.id, { title: "T3" });
  await dependencyService.add(ws, t3.id, { dependsOnTaskId: t2.id });
  const server = await createServerInstance(ws);
  handler = createMcpHandler(() => server);
  const transport = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), { fetch: (url, init) => handler.fetch(new Request(url, init)) });
  client = new Client({ name: "acceptance-client", version: "1.0.0" });
  await client.connect(transport);
});
after(async () => { await client?.close(); await handler?.close(); await teardownTestDB(); });

test("acceptance criteria: 1.discover, 2.projects, 3.inspect, 4.tasks, 5.blockers", async () => {
  const { tools } = await client.listTools();
  assert.ok(["taskos_server_info", "project_list", "project_get", "task_list", "task_get", "report_blockers"].every((t) => tools.some((x) => x.name === t)));
  const r2 = await client.callTool({ name: "project_list", arguments: {} });
  assert.equal(r2.structuredContent.data.projects[0].key, "CORE");
  const r3 = await client.callTool({ name: "project_get", arguments: { projectId: p.id } });
  assert.equal(r3.structuredContent.data.project.id, p.id);
  const r4 = await client.callTool({ name: "task_list", arguments: { projectId: p.id, page: 1, limit: 10 } });
  assert.equal(r4.structuredContent.data.tasks.length, 3);
  const r5 = await client.callTool({ name: "report_blockers", arguments: { projectId: p.id } });
  const { summary, tasks } = r5.structuredContent.data;
  assert.equal(summary.total, 2);
  assert.equal(tasks.find((t) => t.taskId === t1.id).blockType, "explicit");
  assert.equal(tasks.find((t) => t.taskId === t3.id).blockType, "dependency");
});