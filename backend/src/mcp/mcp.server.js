import { McpServer } from "@modelcontextprotocol/server";
import { registerAllTools } from "./mcp.tools.js";
import { resolveMcpContext } from "./mcp.context.js";

const INSTRUCTIONS = "TaskOS is a project and task management platform that exposes project, task, workflow, and collaboration capabilities to AI clients through the Model Context Protocol.";

export async function createServerInstance(context) {
  const ctx = context || (await resolveMcpContext());
  const server = new McpServer(
    { name: "taskos", version: "1.0.0" },
    { instructions: INSTRUCTIONS }
  );
  registerAllTools(server, ctx);
  return server;
}
