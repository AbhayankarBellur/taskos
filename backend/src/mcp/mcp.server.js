import { McpServer } from "@modelcontextprotocol/server";
import { registerServerInfoTool } from "./tools/server-info.tool.js";

export function createServerInstance() {
  const server = new McpServer(
    {
      name: "taskos",
      version: "1.0.0"
    },
    {
      instructions: "TaskOS is a project and task management platform that exposes project, task, workflow, and collaboration capabilities to AI clients through the Model Context Protocol."
    }
  );
  registerServerInfoTool(server);
  return server;
}
