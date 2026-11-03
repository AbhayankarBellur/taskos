import { z } from "zod";
import { taskService } from "../../modules/tasks/task.service.js";
import { formatMcpSuccess } from "../mcp.response.js";
import { formatMcpError } from "../mcp.errors.js";

const toolMeta = {
  title: "Get Task",
  description: "Retrieve a task by ID within the authenticated workspace.",
  inputSchema: z.object({
    taskId: z.string().describe("The unique ID of the task")
  }),
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
};

export function registerTaskGetTool(mcpServer, ctx) {
  mcpServer.registerTool("task_get", toolMeta, async ({ taskId }) => {
    try {
      const task = await taskService.get(ctx, taskId);
      return formatMcpSuccess({ task }, `Task [${task.key}] ${task.title} (${task.status})`);
    } catch (err) {
      return formatMcpError(err);
    }
  });
}
