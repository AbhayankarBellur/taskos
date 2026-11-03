import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { createServerInstance } from "../src/mcp/mcp.server.js";
import { mcpContextStorage } from "../src/mcp/mcp.context.js";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createMcpHandler } from "@modelcontextprotocol/server";

let ws1, ws2, p1, p2, client, handler;

before(async () => {
  setDB(await setupTestDB());
  ws1 = createTestCtx("owner"); ws2 = createTestCtx("owner");
  p1 = await projectService.create({ name: "P1", key: "P1" }, ws1);
  p2 = await projectService.create({ name: "P2", key: "P2" }, ws2);
  handler = createMcpHandler(() => createServerInstance());
  const transport = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), { fetch: (u, i) => handler.fetch(new Request(u, i)) });
  client = new Client({ name: "concurrency-client", version: "1.0.0" });
  await client.connect(transport);
});
after(async () => { await client?.close(); await handler?.close(); await teardownTestDB(); });

test("concurrent requests maintain strict workspace context isolation", async () => {
  const [res1, res2] = await Promise.all([
    mcpContextStorage.run(ws1, () => client.callTool({ name: "project_list", arguments: {} })),
    mcpContextStorage.run(ws2, () => client.callTool({ name: "project_list", arguments: {} }))
  ]);
  assert.equal(res1.structuredContent.data.projects[0].id, p1.id);
  assert.equal(res2.structuredContent.data.projects[0].id, p2.id);
});

test("model arguments cannot override context identity or role", async () => {
  const res = await mcpContextStorage.run(ws1, () => client.callTool({
    name: "project_list", arguments: { workspaceId: ws2.workspaceId.toString(), role: "viewer" }
  }));
  assert.equal(res.structuredContent.data.projects[0].id, p1.id);
});
