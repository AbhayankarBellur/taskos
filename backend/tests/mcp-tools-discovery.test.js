import test from "node:test";
import assert from "node:assert/strict";
import { createServerInstance } from "../src/mcp/mcp.server.js";
import { createTestCtx } from "./test-context.js";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createMcpHandler } from "@modelcontextprotocol/server";

test("MCP Client discovers all 6 tools with readOnly annotations", async () => {
  const ctx = createTestCtx("viewer");
  const server = await createServerInstance(ctx);
  const handler = createMcpHandler(() => server);
  const transport = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init))
  });
  const client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);

  const res = await client.listTools();
  const names = res.tools.map((t) => t.name);
  assert.deepEqual(names.sort(), [
    "project_get", "project_list", "report_blockers",
    "task_get", "task_list", "taskos_server_info"
  ].sort());

  const pList = res.tools.find((t) => t.name === "project_list");
  assert.equal(pList.annotations?.readOnlyHint, true);
  assert.equal(pList.annotations?.destructiveHint, false);

  await client.close();
  await handler.close();
});
