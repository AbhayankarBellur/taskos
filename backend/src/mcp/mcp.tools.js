import { registerServerInfoTool } from "./tools/server-info.tool.js";
import { registerProjectListTool } from "./tools/project-list.tool.js";
import { registerProjectGetTool } from "./tools/project-get.tool.js";
import { registerTaskListTool } from "./tools/task-list.tool.js";
import { registerTaskGetTool } from "./tools/task-get.tool.js";
import { registerReportBlockersTool } from "./tools/report-blockers.tool.js";

export function registerAllTools(mcpServer, ctx) {
  registerServerInfoTool(mcpServer);
  registerProjectListTool(mcpServer, ctx);
  registerProjectGetTool(mcpServer, ctx);
  registerTaskListTool(mcpServer, ctx);
  registerTaskGetTool(mcpServer, ctx);
  registerReportBlockersTool(mcpServer, ctx);
}
