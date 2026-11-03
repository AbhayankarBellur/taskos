import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { createServerInstance } from "../src/mcp/mcp.server.js";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createMcpHandler } from "@modelcontextprotocol/server";

let ws1, ws2, p1, p2, client, handler;

before(async () => {
  setDB(await setupTestDB());
  ws1 = createTestCtx("owner");
  ws2 = createTestCtx("owner");
  p1 = await projectService.create({ name: "Alpha", key: "ALPH" }, ws1);
  p2 = await projectService.create({ name: "Beta", key: "BETA" }, ws2);
  const server = await createServerInstance(ws1);
  handler = createMcpHandler(() => server);
  const transport = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init))
  });
  client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
});

after(async () => {
  await client?.close();
  await handler?.close();
  await teardownTestDB();
});

test("project_list returns only current workspace projects", async () => {
  const res = await client.callTool({ name: "project_list", arguments: {} });
  const projects = res.structuredContent.data.projects;
  assert.equal(projects.length, 1);
  assert.equal(projects[0].id, p1.id);
});

test("project_get returns project and rejects cross-workspace access", async () => {
  const r1 = await client.callTool({ name: "project_get", arguments: { projectId: p1.id } });
  assert.equal(r1.structuredContent.data.project.id, p1.id);
  const r2 = await client.callTool({ name: "project_get", arguments: { projectId: p2.id } });
  assert.equal(r2.isError, true);
  const r3 = await client.callTool({ name: "project_get", arguments: { projectId: "bad-id" } });
  assert.equal(r3.isError, true);
});
