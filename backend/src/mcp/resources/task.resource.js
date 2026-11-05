import { ResourceTemplate } from "@modelcontextprotocol/server";
import { taskService } from "../../modules/tasks/task.service.js";
import { assertMcpScope } from "../mcp.scopes.js";
import { toObjectId } from "../../utils/object-id.js";
import { formatResourceResult } from "./resource-format.js";

const template = new ResourceTemplate("taskos://tasks/{taskId}", { list: undefined });
const meta = {
  title: "Task Details",
  description: "Complete context for an individual task.",
  mimeType: "application/json"
};

export function registerTaskResource(mcpServer, ctx) {
  mcpServer.registerResource("task_details", template, meta, async (uri, vars) => {
    assertMcpScope(ctx, "tasks:read");
    toObjectId(vars.taskId, "taskId");
    const t = await taskService.get(ctx, vars.taskId);
    const data = {
      id: t.id,
      projectId: t.projectId,
      workspaceId: t.workspaceId,
      key: t.key,
      title: t.title,
      description: t.description ?? "",
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId ?? null,
      reporterId: t.reporterId ?? null,
      blocked: !!t.blocked,
      blockerReason: t.blockerReason ?? null,
      parentTaskId: t.parentTaskId ?? null,
      dueDate: t.dueDate ?? null,
      labels: t.labels ?? [],
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    };
    return formatResourceResult(uri, data);
  });
}
