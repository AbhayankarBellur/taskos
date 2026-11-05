import { ResourceTemplate } from "@modelcontextprotocol/server";
import { taskService } from "../../modules/tasks/task.service.js";
import { assertMcpScope } from "../mcp.scopes.js";
import { toObjectId } from "../../utils/object-id.js";
import { formatResourceResult } from "./resource-format.js";

const template = new ResourceTemplate("taskos://projects/{projectId}/tasks", { list: undefined });
const meta = {
  title: "Project Tasks",
  description: "Bounded snapshot of tasks belonging to a project.",
  mimeType: "application/json"
};

export function registerProjectTasksResource(mcpServer, ctx) {
  mcpServer.registerResource("project_tasks", template, meta, async (uri, vars) => {
    assertMcpScope(ctx, "tasks:read");
    toObjectId(vars.projectId, "projectId");
    const res = await taskService.list(ctx, vars.projectId, { limit: 50, page: 1 });
    const tasks = res.items.map((t) => ({
      id: t.id,
      key: t.key,
      title: t.title,
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId ?? null,
      blocked: !!t.blocked,
      blockerReason: t.blockerReason ?? null,
      dueDate: t.dueDate ?? null,
      parentTaskId: t.parentTaskId ?? null
    }));
    return formatResourceResult(uri, { projectId: vars.projectId, tasks, pagination: res.pagination });
  });
}
