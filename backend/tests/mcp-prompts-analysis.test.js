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

let ws, p, t, client, handler;
const mcpUrl = new URL("http://localhost/mcp");

before(async () => {
  setDB(await setupTestDB());
  ws = createTestCtx("owner");
  p = await projectService.create({ name: "Alpha", key: "ALPH" }, ws);
  t = await taskService.create(ws, p.id, { title: "Fix bug", description: "Null pointer in auth" });
  const server = await createServerInstance(ws);
  handler = createMcpHandler(() => server);
  const transport = new StreamableHTTPClientTransport(mcpUrl, { fetch: (url, i) => handler.fetch(new Request(url, i)) });
  client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
});

after(async () => { await client?.close(); await handler?.close(); await teardownTestDB(); });

test("sprint_review, blocker_analysis and task_review return analysis instructions", async () => {
  const sprint = await client.getPrompt({ name: "sprint_review", arguments: { projectId: p.id } });
  assert.ok(sprint.messages[0].content.text.includes("sprint review"));
  const blocker = await client.getPrompt({ name: "blocker_analysis", arguments: { projectId: p.id } });
  assert.ok(blocker.messages[0].content.text.includes("Analyze the blockers"));
  const taskRev = await client.getPrompt({ name: "task_review", arguments: { taskId: t.id } });
  assert.ok(taskRev.messages[0].content.text.includes("Fix bug"));
});

test("prompt invalid arguments and scope gating are enforced", async () => {
  await assert.rejects(client.getPrompt({ name: "task_review", arguments: {} }));
  const limWs = createTestCtx("owner");
  limWs.scopes = ["projects:read"];
  const limServer = await createServerInstance(limWs);
  const limHandler = createMcpHandler(() => limServer);
  const limClient = new Client({ name: "c", version: "1.0.0" });
  await limClient.connect(new StreamableHTTPClientTransport(mcpUrl, { fetch: (url, i) => limHandler.fetch(new Request(url, i)) }));
  await assert.rejects(limClient.getPrompt({ name: "blocker_analysis", arguments: { projectId: p.id } }));
  await limClient.close(); await limHandler.close();
});