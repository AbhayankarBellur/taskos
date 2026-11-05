import { z } from "zod";
import { taskService } from "../../modules/tasks/task.service.js";
import { formatMcpSuccess } from "../mcp.response.js";
import { formatMcpError } from "../mcp.errors.js";
import { assertMcpScope } from "../mcp.scopes.js";
import { recordMcpAudit, getErrorCategory } from "../mcp.audit.js";

const toolMeta = {
  title: "Transition Task",
  description: "Transition a task through its lifecycle statuses.",
  inputSchema: z.object({
    taskId: z.string().describe("Task ID"),
    status: z.enum(["backlog", "todo", "in_progress", "in_review", "done"]).describe("Target lifecycle status")
  }),
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false }
};

export function registerTaskTransitionTool(server, ctx) {
  server.registerTool("task_transition", toolMeta, async ({ taskId, status }) => {
    try {
      assertMcpScope(ctx, "tasks:write");
      const current = await taskService.get(ctx, taskId);
      const res = await taskService.transition(ctx, taskId, status);
      await recordMcpAudit({ keyId: ctx?.keyId, userId: ctx?.userId, workspaceId: ctx?.workspaceId, toolName: "task_transition", success: true });
      return formatMcpSuccess({ taskId: res.id, taskKey: res.key, previousStatus: current.status, status: res.status }, `Transitioned task [${res.key}] from ${current.status} to ${res.status}`);
    } catch (err) {
      await recordMcpAudit({ keyId: ctx?.keyId, userId: ctx?.userId, workspaceId: ctx?.workspaceId, toolName: "task_transition", success: false, errorCategory: getErrorCategory(err) });
      return formatMcpError(err);
    }
  });
}
