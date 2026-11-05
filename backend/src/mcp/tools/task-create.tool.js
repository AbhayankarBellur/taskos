import { z } from "zod";
import { taskService } from "../../modules/tasks/task.service.js";
import { projectService } from "../../modules/projects/project.service.js";
import { memberRepository } from "../../modules/workspaces/member.repository.js";
import { toObjectId } from "../../utils/object-id.js";
import { formatMcpSuccess } from "../mcp.response.js";
import { formatMcpError } from "../mcp.errors.js";
import { assertMcpScope } from "../mcp.scopes.js";
import { recordMcpAudit, getErrorCategory } from "../mcp.audit.js";

const toolMeta = {
  title: "Create Task",
  description: "Create a task or subtask in an authorized project.",
  inputSchema: z.object({
    projectId: z.string().describe("Project ID"),
    title: z.string().trim().min(1).max(200).describe("Task title"),
    description: z.string().max(5000).optional().describe("Description"),
    priority: z.enum(["critical", "high", "medium", "low"]).optional().describe("Priority"),
    assigneeId: z.string().nullable().optional().describe("Assignee user ID"),
    dueDate: z.string().nullable().optional().describe("Due date (ISO format)"),
    parentTaskId: z.string().nullable().optional().describe("Parent task ID for subtasks")
  }),
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false }
};

export function registerTaskCreateTool(server, ctx) {
  server.registerTool("task_create", toolMeta, async (args) => {
    try {
      assertMcpScope(ctx, "tasks:write");
      await projectService.get(ctx, args.projectId);
      if (args.assigneeId) {
        const mem = await memberRepository.find(toObjectId(ctx.workspaceId), toObjectId(args.assigneeId));
        if (!mem) throw Object.assign(new Error("Assignee is not a workspace member"), { statusCode: 400 });
      }
      const data = { ...args };
      delete data.projectId; delete data.parentTaskId;
      const res = args.parentTaskId
        ? await taskService.createSubtask(ctx, args.parentTaskId, data)
        : await taskService.create(ctx, args.projectId, data);
      await recordMcpAudit({ keyId: ctx?.keyId, userId: ctx?.userId, workspaceId: ctx?.workspaceId, toolName: "task_create", success: true });
      return formatMcpSuccess({ task: { id: res.id, key: res.key, title: res.title, status: res.status, projectId: res.projectId } }, `Created task [${res.key}] ${res.title}`);
    } catch (err) {
      await recordMcpAudit({ keyId: ctx?.keyId, userId: ctx?.userId, workspaceId: ctx?.workspaceId, toolName: "task_create", success: false, errorCategory: getErrorCategory(err) });
      return formatMcpError(err);
    }
  });
}
