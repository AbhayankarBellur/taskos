import { z } from "zod";
import { taskService } from "../../modules/tasks/task.service.js";
import { formatMcpSuccess } from "../mcp.response.js";
import { formatMcpError } from "../mcp.errors.js";
import { assertMcpScope } from "../mcp.scopes.js";
import { recordMcpAudit, getErrorCategory } from "../mcp.audit.js";

const toolMeta = {
  title: "Update Task",
  description: "Update permitted fields (title, description, priority, dueDate) on an existing task.",
  inputSchema: z.object({
    taskId: z.string().describe("Task ID"),
    title: z.string().trim().min(1).max(200).optional().describe("New title"),
    description: z.string().max(5000).optional().describe("New description"),
    priority: z.enum(["critical", "high", "medium", "low"]).optional().describe("New priority"),
    dueDate: z.string().nullable().optional().describe("New due date (ISO string or null)")
  }),
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false }
};

export function registerTaskUpdateTool(server, ctx) {
  server.registerTool("task_update", toolMeta, async ({ taskId, ...fields }) => {
    try {
      assertMcpScope(ctx, "tasks:write");
      const updates = Object.fromEntries(Object.entries(fields).filter(([_, v]) => v !== undefined));
      if (Object.keys(updates).length === 0) {
        throw Object.assign(new Error("At least one mutable field must be provided for update"), { statusCode: 400 });
      }
      const res = await taskService.update(ctx, taskId, updates);
      await recordMcpAudit({ keyId: ctx?.keyId, userId: ctx?.userId, workspaceId: ctx?.workspaceId, toolName: "task_update", success: true });
      return formatMcpSuccess({ task: { id: res.id, key: res.key, title: res.title, priority: res.priority, dueDate: res.dueDate } }, `Updated task [${res.key}]`);
    } catch (err) {
      await recordMcpAudit({ keyId: ctx?.keyId, userId: ctx?.userId, workspaceId: ctx?.workspaceId, toolName: "task_update", success: false, errorCategory: getErrorCategory(err) });
      return formatMcpError(err);
    }
  });
}
