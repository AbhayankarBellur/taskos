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

let ws1, ws2, p1, p2, t1, client, handler;

before(async () => {
  setDB(await setupTestDB());
  ws1 = createTestCtx("owner"); ws2 = createTestCtx("owner");
  p1 = await projectService.create({ name: "Alpha", key: "ALPH" }, ws1);
  p2 = await projectService.create({ name: "Beta", key: "BETA" }, ws2);
  t1 = await taskService.create(ws1, p1.id, { title: "Task 1", priority: "high" });
  await taskService.block(ws1, t1.id, "Waiting on API spec");
  const server = await createServerInstance(ws1);
  handler = createMcpHandler(() => server);
  const transport = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init))
  });
  client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
});

after(async () => { await client?.close(); await handler?.close(); await teardownTestDB(); });

test("task and blocker resources return data and deny cross-workspace access", async () => {
  const tasksRead = await client.readResource({ uri: `taskos://projects/${p1.id}/tasks` });
  const tasksData = JSON.parse(tasksRead.contents[0].text);
  assert.equal(tasksData.tasks.length, 1);
  assert.equal(tasksData.tasks[0].id, t1.id);
  const taskRead = await client.readResource({ uri: `taskos://tasks/${t1.id}` });
  const taskData = JSON.parse(taskRead.contents[0].text);
  assert.equal(taskData.title, "Task 1");
  assert.equal(taskData.blocked, true);
  const blockRead = await client.readResource({ uri: `taskos://projects/${p1.id}/blockers` });
  const blockData = JSON.parse(blockRead.contents[0].text);
  assert.equal(blockData.summary.explicit, 1);
  await assert.rejects(client.readResource({ uri: `taskos://projects/${p2.id}` }));
  await assert.rejects(client.readResource({ uri: "taskos://invalid/url" }));
});
