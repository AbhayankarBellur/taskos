import test, { after } from "node:test";
import assert from "node:assert/strict";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { createServerInstance } from "../src/mcp/mcp.server.js";

const handler = createMcpHandler(() => createServerInstance());
after(() => handler.close());

async function mcpPost(body) {
  const req = new Request("http://localhost:5000/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json, text/event-stream" },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
  const res = await handler.fetch(req);
  const text = await res.text();
  const match = text.match(/data:\s*(\{.*\})/);
  return match ? JSON.parse(match[1]) : JSON.parse(text || "{}");
}

test("MCP initialization returns TaskOS server identity", async () => {
  const data = await mcpPost({
    jsonrpc: "2.0", id: 1, method: "initialize",
    params: { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "test", version: "1.0.0" } }
  });
  assert.equal(data.result.serverInfo.name, "taskos");
  assert.equal(data.result.serverInfo.version, "1.0.0");
});

test("tools/list returns taskos_server_info diagnostic tool", async () => {
  const data = await mcpPost({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  const tool = data.result.tools.find((t) => t.name === "taskos_server_info");
  assert.ok(tool && tool.description.includes("TaskOS MCP server"));
});

test("tools/call invokes taskos_server_info successfully", async () => {
  const data = await mcpPost({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "taskos_server_info", arguments: {} } });
  const payload = JSON.parse(data.result.content[0].text);
  assert.equal(payload.name, "TaskOS");
  assert.equal(payload.status, "operational");
});

test("invalid JSON-RPC is rejected safely", async () => {
  const data = await mcpPost("{ invalid json");
  assert.equal(data.error?.code, -32700);
});
