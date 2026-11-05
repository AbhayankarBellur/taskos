import { z } from "zod";
import { commentService } from "../../modules/comments/comment.service.js";
import { formatMcpSuccess } from "../mcp.response.js";
import { formatMcpError } from "../mcp.errors.js";
import { assertMcpScope } from "../mcp.scopes.js";
import { recordMcpAudit, getErrorCategory } from "../mcp.audit.js";

const toolMeta = {
  title: "Create Task Comment",
  description: "Add a comment to a task within the authenticated workspace.",
  inputSchema: z.object({
    taskId: z.string().describe("Task ID"),
    content: z.string().trim().min(1, "Comment content cannot be empty").max(5000, "Comment cannot exceed 5000 characters").describe("Comment content")
  }),
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false }
};

export function registerTaskCommentCreateTool(server, ctx) {
  server.registerTool("task_comment_create", toolMeta, async ({ taskId, content }) => {
    try {
      assertMcpScope(ctx, "comments:write");
      const res = await commentService.create(ctx, taskId, { content });
      await recordMcpAudit({ keyId: ctx?.keyId, userId: ctx?.userId, workspaceId: ctx?.workspaceId, toolName: "task_comment_create", success: true });
      return formatMcpSuccess({ commentId: res.id, taskId: res.taskId, createdAt: res.createdAt }, `Added comment to task [${taskId}]`);
    } catch (err) {
      await recordMcpAudit({ keyId: ctx?.keyId, userId: ctx?.userId, workspaceId: ctx?.workspaceId, toolName: "task_comment_create", success: false, errorCategory: getErrorCategory(err) });
      return formatMcpError(err);
    }
  });
}
