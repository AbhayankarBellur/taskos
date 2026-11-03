const SERVER_INFO = {
  name: "TaskOS",
  version: "1.0.0",
  status: "operational",
  capabilities: [
    "mcp",
    "project_management",
    "task_management"
  ]
};

export function registerServerInfoTool(mcpServer) {
  mcpServer.registerTool(
    "taskos_server_info",
    {
      description: "Return basic information about the TaskOS MCP server"
    },
    async () => ({
      content: [{ type: "text", text: JSON.stringify(SERVER_INFO) }]
    })
  );
}
