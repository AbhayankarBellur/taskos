import { z } from "zod";
import { projectService } from "../../modules/projects/project.service.js";
import { taskService } from "../../modules/tasks/task.service.js";
import { assertMcpScopes } from "../mcp.scopes.js";
import { toObjectId } from "../../utils/object-id.js";

const meta = {
  title: "Sprint Review",
  description: "Analyze completed, in-progress, pending, and blocked tasks for a project review.",
  argsSchema: { projectId: z.string().describe("The ID of the project to review") }
};

export function registerSprintReviewPrompt(mcpServer, ctx) {
  mcpServer.registerPrompt("sprint_review", meta, async ({ projectId }) => {
    assertMcpScopes(ctx, ["projects:read", "tasks:read", "reports:read"]);
    toObjectId(projectId, "projectId");
    const [project, taskData, blockers] = await Promise.all([
      projectService.get(ctx, projectId),
      taskService.list(ctx, projectId, { limit: 100 }),
      taskService.reportBlockers(ctx, { projectId })
    ]);
    const promptText = [
      `Perform a sprint review for TaskOS project "${project.name}" (key: ${project.key}).`,
      `Context: ${taskData.items.length} tasks retrieved. Blockers: ${blockers.summary.total} blocked (${blockers.summary.explicit} explicit, ${blockers.summary.dependency} dependency).`,
      "Tasks snapshot:",
      JSON.stringify(taskData.items.map((t) => ({ key: t.key, title: t.title, status: t.status, priority: t.priority, dueDate: t.dueDate, assigneeId: t.assigneeId }))),
      "Instructions:",
      "1. Analyze completed tasks vs remaining workload.",
      "2. Review in-progress and pending tasks.",
      "3. Identify blocked items and their causes.",
      "4. Flag overdue tasks based on available due dates.",
      "5. Note: Do not invent sprint boundaries or dates if TaskOS does not store them."
    ].join("\n\n");
    return { messages: [{ role: "user", content: { type: "text", text: promptText } }] };
  });
}
