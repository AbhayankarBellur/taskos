import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { createServerInstance } from "../src/mcp/mcp.server.js";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createMcpHandler } from "@modelcontextprotocol/server";

let ws1, p1, client, handler;

before(async () => {
  setDB(await setupTestDB());
  ws1 = createTestCtx("owner");
  p1 = await projectService.create({ name: "Alpha", key: "ALPH" }, ws1);
  const server = await createServerInstance(ws1);
  handler = createMcpHandler(() => server);
  const transport = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init))
  });
  client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
});

after(async () => { await client?.close(); await handler?.close(); await teardownTestDB(); });

test("resources/list returns static workspace projects", async () => {
  const res = await client.listResources();
  assert.equal(res.resources.length, 1);
  assert.equal(res.resources[0].uri, "taskos://workspace/projects");
  const read = await client.readResource({ uri: "taskos://workspace/projects" });
  const data = JSON.parse(read.contents[0].text);
  assert.equal(data.length, 1);
  assert.equal(data[0].id, p1.id);
});

test("resources/templates/list returns templates and read returns project", async () => {
  const tList = await client.listResourceTemplates();
  assert.equal(tList.resourceTemplates.length, 4);
  const read = await client.readResource({ uri: `taskos://projects/${p1.id}` });
  const data = JSON.parse(read.contents[0].text);
  assert.equal(data.id, p1.id);
  assert.equal(data.key, "ALPH");
});