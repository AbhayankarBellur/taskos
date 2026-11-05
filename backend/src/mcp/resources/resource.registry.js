import { registerWorkspaceProjectsResource } from "./workspace-projects.resource.js";
import { registerProjectResource } from "./project.resource.js";
import { registerProjectTasksResource } from "./project-tasks.resource.js";
import { registerTaskResource } from "./task.resource.js";
import { registerProjectBlockersResource } from "./project-blockers.resource.js";

export function registerAllResources(mcpServer, ctx) {
  registerWorkspaceProjectsResource(mcpServer, ctx);
  registerProjectResource(mcpServer, ctx);
  registerProjectTasksResource(mcpServer, ctx);
  registerTaskResource(mcpServer, ctx);
  registerProjectBlockersResource(mcpServer, ctx);
}
