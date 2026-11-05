import { z } from "zod";
import { taskService } from "../../modules/tasks/task.service.js";
import { assertMcpScope } from "../mcp.scopes.js";
import { toObjectId } from "../../utils/object-id.js";

const meta = {
  title: "Task Review",
  description: "Review a task's description, priority, blockers, and missing acceptance criteria.",
  argsSchema: { taskId: z.string().describe("The ID of the task to review") }
};

export function registerTaskReviewPrompt(mcpServer, ctx) {
  mcpServer.registerPrompt("task_review", meta, async ({ taskId }) => {
    assertMcpScope(ctx, "tasks:read");
    toObjectId(taskId, "taskId");
    const task = await taskService.get(ctx, taskId);
    const promptText = [
      `Review TaskOS task [${task.key}] "${task.title}" (status: ${task.status}, priority: ${task.priority}).`,
      `Description:\n${task.description || "(No description provided)"}`,
      `Blocked: ${task.blocked ? `Yes - ${task.blockerReason || "No reason given"}` : "No"}`,
      `Due Date: ${task.dueDate || "None"} | Labels: ${(task.labels || []).join(", ") || "None"}`,
      "Instructions (REVIEW ONLY - DO NOT CHANGE THE TASK):",
      "1. Evaluate clarity and completeness of the task description.",
      "2. Assess whether priority and details align.",
      "3. Identify missing acceptance criteria or ambiguity.",
      "4. Flag dependencies, blockers, and execution risks.",
      "5. Suggest actionable refinements for the task owner."
    ].join("\n\n");
    return { messages: [{ role: "user", content: { type: "text", text: promptText } }] };
  });
}
