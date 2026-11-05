import { createServerInstance } from "../src/mcp/mcp.server.js";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";

export async function createTestMcpClient(ctx) {
  const server = await createServerInstance(ctx);
  const handler = createMcpHandler(() => server);
  const transport = new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init))
  });
  const client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
  return {
    client,
    call: (name, args = {}) => client.callTool({ name, arguments: args }),
    close: async () => { await client.close(); await handler.close(); }
  };
}
