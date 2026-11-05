import { registerServerInfoTool } from "./tools/server-info.tool.js";
import { registerProjectListTool } from "./tools/project-list.tool.js";
import { registerProjectGetTool } from "./tools/project-get.tool.js";
import { registerTaskListTool } from "./tools/task-list.tool.js";
import { registerTaskGetTool } from "./tools/task-get.tool.js";
import { registerReportBlockersTool } from "./tools/report-blockers.tool.js";
import { registerTaskCreateTool } from "./tools/task-create.tool.js";
import { registerTaskUpdateTool } from "./tools/task-update.tool.js";
import { registerTaskAssignTool } from "./tools/task-assign.tool.js";
import { registerTaskTransitionTool } from "./tools/task-transition.tool.js";
import { registerTaskCommentCreateTool } from "./tools/task-comment-create.tool.js";
import { registerTaskDependencyAddTool } from "./tools/task-dependency-add.tool.js";

export function registerAllTools(mcpServer, ctx) {
  registerServerInfoTool(mcpServer);
  registerProjectListTool(mcpServer, ctx);
  registerProjectGetTool(mcpServer, ctx);
  registerTaskListTool(mcpServer, ctx);
  registerTaskGetTool(mcpServer, ctx);
  registerReportBlockersTool(mcpServer, ctx);
  registerTaskCreateTool(mcpServer, ctx);
  registerTaskUpdateTool(mcpServer, ctx);
  registerTaskAssignTool(mcpServer, ctx);
  registerTaskTransitionTool(mcpServer, ctx);
  registerTaskCommentCreateTool(mcpServer, ctx);
  registerTaskDependencyAddTool(mcpServer, ctx);
}
