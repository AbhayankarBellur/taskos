import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { createServerInstance } from "../src/mcp/mcp.server.js";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createMcpHandler } from "@modelcontextprotocol/server";

let ws, p, clientTasksOnly, clientProjectsOnly;

before(async () => {
  setDB(await setupTestDB());
  ws = createTestCtx("owner");
  p = await projectService.create({ name: "ScopeProj", key: "SCPE" }, ws);

  const serverTasks = await createServerInstance({ ...ws, scopes: ["tasks:read"] });
  const handlerT = createMcpHandler(() => serverTasks);
  const transT = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), { fetch: (u, i) => handlerT.fetch(new Request(u, i)) });
  clientTasksOnly = new Client({ name: "t-client", version: "1.0.0" });
  await clientTasksOnly.connect(transT);

  const serverProjects = await createServerInstance({ ...ws, scopes: ["projects:read"] });
  const handlerP = createMcpHandler(() => serverProjects);
  const transP = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), { fetch: (u, i) => handlerP.fetch(new Request(u, i)) });
  clientProjectsOnly = new Client({ name: "p-client", version: "1.0.0" });
  await clientProjectsOnly.connect(transP);
});

after(async () => { await clientTasksOnly?.close(); await clientProjectsOnly?.close(); await teardownTestDB(); });

test("scope enforcement allows matching scope and rejects missing scope", async () => {
  const r1 = await clientTasksOnly.callTool({ name: "task_list", arguments: { projectId: p.id } });
  assert.equal(r1.isError, undefined);
  const r2 = await clientTasksOnly.callTool({ name: "project_list", arguments: {} });
  assert.equal(r2.isError, true);
  assert.ok(r2.content[0].text.includes("projects:read"));

  const r3 = await clientProjectsOnly.callTool({ name: "project_list", arguments: {} });
  assert.equal(r3.isError, undefined);
  const r4 = await clientProjectsOnly.callTool({ name: "report_blockers", arguments: { projectId: p.id } });
  assert.equal(r4.isError, true);
  assert.ok(r4.content[0].text.includes("reports:read"));
});
