import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createServerInstance } from "../src/mcp/mcp.server.js";
import app from "../src/app.js";

test("official MCP Client connects, discovers tools and executes server_info", async () => {
  const handler = createMcpHandler(() => createServerInstance());
  const customFetch = (url, init) => handler.fetch(new Request(url, init));
  const transport = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), { fetch: customFetch });
  const client = new Client({ name: "mcp-test-client", version: "1.0.0" });

  await client.connect(transport);
  const toolsResult = await client.listTools();
  const toolNames = toolsResult.tools.map((t) => t.name);
  assert.ok(toolNames.includes("taskos_server_info"));

  const callResult = await client.callTool({ name: "taskos_server_info", arguments: {} });
  const payload = JSON.parse(callResult.content[0].text);
  assert.equal(payload.name, "TaskOS");
  assert.equal(payload.status, "operational");

  await client.close();
  await handler.close();
});

test("existing REST /health endpoint remains functional", () => {
  const req = new http.IncomingMessage(null);
  req.method = "GET"; req.url = "/health"; req.headers = { host: "localhost:5000" };
  const res = new http.ServerResponse(req);
  let body;
  res.end = (chunk) => { if (chunk) body = JSON.parse(chunk); };
  app.handle(req, res);
  assert.equal(body?.success, true);
  assert.equal(body?.service, "TaskOS API");
});
