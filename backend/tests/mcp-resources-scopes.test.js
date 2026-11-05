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

before(async () => {
  setDB(await setupTestDB());
  ws = createTestCtx("owner");
  ws.scopes = ["projects:read"]; // only projects:read
  p = await projectService.create({ name: "Alpha", key: "ALPH" }, ws);
  t = await taskService.create(ws, p.id, { title: "Task 1" });
  const server = await createServerInstance(ws);
  handler = createMcpHandler(() => server);
  const transport = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init))
  });
  client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
});

after(async () => { await client?.close(); await handler?.close(); await teardownTestDB(); });

test("resource scope enforcement rejects missing scopes", async () => {
  const allowed = await client.readResource({ uri: "taskos://workspace/projects" });
  assert.ok(allowed.contents.length > 0);
  await assert.rejects(
    client.readResource({ uri: `taskos://projects/${p.id}/tasks` }),
    (err) => err.message.includes("tasks:read")
  );
  await assert.rejects(
    client.readResource({ uri: `taskos://tasks/${t.id}` }),
    (err) => err.message.includes("tasks:read")
  );
  await assert.rejects(
    client.readResource({ uri: `taskos://projects/${p.id}/blockers` }),
    (err) => err.message.includes("reports:read")
  );
});
