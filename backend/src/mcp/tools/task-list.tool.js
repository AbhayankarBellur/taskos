import { z } from "zod";
import { taskService } from "../../modules/tasks/task.service.js";
import { formatMcpSuccess } from "../mcp.response.js";
import { formatMcpError } from "../mcp.errors.js";
import { assertMcpScope } from "../mcp.scopes.js";

const toolMeta = {
  title: "List Tasks",
  description: "List tasks for a project with optional filters and pagination.",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project"),
    status: z.enum(["backlog", "todo", "in_progress", "in_review", "done"]).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    assigneeId: z.string().optional(),
    labels: z.array(z.string()).optional(),
    archived: z.boolean().optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional()
  }),
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
};

export function registerTaskListTool(mcpServer, ctx) {
  mcpServer.registerTool("task_list", toolMeta, async ({ projectId, ...args }) => {
    try {
      assertMcpScope(ctx, "tasks:read");
      const q = { ...args, archived: args.archived ? "true" : "false" };
      const res = await taskService.list(ctx, projectId, q);
      const summary = `Found ${res.items.length} tasks (total: ${res.pagination.total}).`;
      return formatMcpSuccess({ tasks: res.items, pagination: res.pagination }, summary);
    } catch (err) {
      return formatMcpError(err);
    }
  });
}
