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

let ws, p, client, handler;

before(async () => {
  setDB(await setupTestDB());
  ws = createTestCtx("owner");
  p = await projectService.create({ name: "Alpha", key: "ALPH" }, ws);
  await taskService.create(ws, p.id, { title: "Setup auth" });
  const server = await createServerInstance(ws);
  handler = createMcpHandler(() => server);
  const transport = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init))
  });
  client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
});

after(async () => { await client?.close(); await handler?.close(); await teardownTestDB(); });

test("prompts/list returns all five prompts", async () => {
  const res = await client.listPrompts();
  const names = res.prompts.map((p) => p.name);
  assert.equal(names.length, 5);
  assert.ok(["project_overview", "break_down_feature", "sprint_review", "blocker_analysis", "task_review"].every((n) => names.includes(n)));
});

test("project_overview and break_down_feature return structured prompts", async () => {
  const pOverview = await client.getPrompt({ name: "project_overview", arguments: { projectId: p.id } });
  assert.ok(pOverview.messages[0].content.text.includes("Alpha"));
  assert.ok(pOverview.messages[0].content.text.includes("Setup auth"));
  const pFeature = await client.getPrompt({
    name: "break_down_feature",
    arguments: { projectId: p.id, featureDescription: "OAuth2 GitHub Login" }
  });
  assert.ok(pFeature.messages[0].content.text.includes("OAuth2 GitHub Login"));
  assert.ok(pFeature.messages[0].content.text.includes("Proposal"));
});
