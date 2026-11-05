import { z } from "zod";
import { dependencyService } from "../../modules/dependencies/dependency.service.js";
import { formatMcpSuccess } from "../mcp.response.js";
import { formatMcpError } from "../mcp.errors.js";
import { assertMcpScope } from "../mcp.scopes.js";
import { recordMcpAudit, getErrorCategory } from "../mcp.audit.js";

const toolMeta = {
  title: "Add Task Dependency",
  description: "Establish a dependency indicating a task depends on another prerequisite task.",
  inputSchema: z.object({
    taskId: z.string().describe("Dependent task ID"),
    dependsOnTaskId: z.string().describe("Prerequisite task ID")
  }),
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false }
};

export function registerTaskDependencyAddTool(server, ctx) {
  server.registerTool("task_dependency_add", toolMeta, async ({ taskId, dependsOnTaskId }) => {
    try {
      assertMcpScope(ctx, "dependencies:write");
      if (taskId === dependsOnTaskId) {
        throw Object.assign(new Error("Self-dependency not allowed"), { statusCode: 400 });
      }
      const res = await dependencyService.add(ctx, taskId, { dependsOnTaskId });
      await recordMcpAudit({ keyId: ctx?.keyId, userId: ctx?.userId, workspaceId: ctx?.workspaceId, toolName: "task_dependency_add", success: true });
      return formatMcpSuccess({ dependencyId: res.id, taskId, dependsOnTaskId }, `Added dependency: task [${taskId}] depends on [${dependsOnTaskId}]`);
    } catch (err) {
      await recordMcpAudit({ keyId: ctx?.keyId, userId: ctx?.userId, workspaceId: ctx?.workspaceId, toolName: "task_dependency_add", success: false, errorCategory: getErrorCategory(err) });
      return formatMcpError(err);
    }
  });
}
