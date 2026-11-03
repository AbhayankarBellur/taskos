import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { resolveMcpContext } from "../src/mcp/mcp.context.js";
import { createServerInstance } from "../src/mcp/mcp.server.js";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createMcpHandler } from "@modelcontextprotocol/server";

let p1, client, handler;

before(async () => {
  setDB(await setupTestDB());
  const ownerCtx = createTestCtx("owner");
  p1 = await projectService.create({ name: "P1", key: "P1" }, ownerCtx);
  const server = await createServerInstance({ ...ownerCtx, role: "viewer" });
  handler = createMcpHandler(() => server);
  const transport = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init))
  });
  client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
});
after(async () => { await client?.close(); await handler?.close(); await teardownTestDB(); });

test("viewer can execute read-only tools", async () => {
  const res = await client.callTool({ name: "project_list", arguments: {} });
  assert.equal(res.structuredContent.data.projects.length, 1);
});

test("invalid input schema filters are rejected by Zod", async () => {
  const res = await client.callTool({ name: "task_list", arguments: { projectId: p1.id, status: "invalid" } });
  assert.equal(res.isError, true);
  assert.ok(res.content[0].text.includes("Input validation error"));
});

test("model arguments cannot override context identity", async () => {
  const res = await client.callTool({ name: "project_list", arguments: { workspaceId: "999999999999999999999999" } });
  assert.equal(res.structuredContent.data.projects[0].id, p1.id);
});

test("production rejects development context resolution", async () => {
  process.env.NODE_ENV = "production";
  await assert.rejects(() => resolveMcpContext(), { statusCode: 401 });
  process.env.NODE_ENV = "test";
});
