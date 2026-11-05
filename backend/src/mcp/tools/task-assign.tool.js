import { z } from "zod";
import { taskService } from "../../modules/tasks/task.service.js";
import { memberRepository } from "../../modules/workspaces/member.repository.js";
import { toObjectId } from "../../utils/object-id.js";
import { formatMcpSuccess } from "../mcp.response.js";
import { formatMcpError } from "../mcp.errors.js";
import { assertMcpScope } from "../mcp.scopes.js";
import { recordMcpAudit, getErrorCategory } from "../mcp.audit.js";

const toolMeta = {
  title: "Assign Task",
  description: "Assign or reassign a task to an eligible workspace member.",
  inputSchema: z.object({
    taskId: z.string().describe("Task ID"),
    assigneeId: z.string().nullable().describe("User ID of the member, or null to unassign")
  }),
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false }
};

export function registerTaskAssignTool(server, ctx) {
  server.registerTool("task_assign", toolMeta, async ({ taskId, assigneeId }) => {
    try {
      assertMcpScope(ctx, "tasks:write");
      if (assigneeId) {
        const mem = await memberRepository.find(toObjectId(ctx.workspaceId), toObjectId(assigneeId));
        if (!mem) throw Object.assign(new Error("Assignee is not a workspace member"), { statusCode: 400 });
      }
      const res = await taskService.assign(ctx, taskId, assigneeId);
      await recordMcpAudit({ keyId: ctx?.keyId, userId: ctx?.userId, workspaceId: ctx?.workspaceId, toolName: "task_assign", success: true });
      return formatMcpSuccess({ taskId: res.id, taskKey: res.key, assigneeId: res.assigneeId }, `Assigned task [${res.key}] to ${assigneeId || "unassigned"}`);
    } catch (err) {
      await recordMcpAudit({ keyId: ctx?.keyId, userId: ctx?.userId, workspaceId: ctx?.workspaceId, toolName: "task_assign", success: false, errorCategory: getErrorCategory(err) });
      return formatMcpError(err);
    }
  });
}
