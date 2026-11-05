import { z } from "zod";
import { projectService } from "../../modules/projects/project.service.js";
import { taskService } from "../../modules/tasks/task.service.js";
import { assertMcpScopes } from "../mcp.scopes.js";
import { toObjectId } from "../../utils/object-id.js";

const meta = {
  title: "Project Overview",
  description: "Analyze project progress, task distribution, workload, blockers, and risks.",
  argsSchema: { projectId: z.string().describe("The ID of the project to analyze") }
};

export function registerProjectOverviewPrompt(mcpServer, ctx) {
  mcpServer.registerPrompt("project_overview", meta, async ({ projectId }) => {
    assertMcpScopes(ctx, ["projects:read", "tasks:read"]);
    toObjectId(projectId, "projectId");
    const [project, taskData] = await Promise.all([
      projectService.get(ctx, projectId),
      taskService.list(ctx, projectId, { limit: 50 })
    ]);
    const promptText = [
      `Analyze the TaskOS project "${project.name}" (key: ${project.key}, status: ${project.status || "active"}).`,
      `Context: ${taskData.items.length} tasks retrieved (total: ${taskData.pagination.total}).`,
      "Tasks snapshot:",
      JSON.stringify(taskData.items.map((t) => ({ key: t.key, title: t.title, status: t.status, priority: t.priority, blocked: t.blocked }))),
      "Please provide:",
      "1. Overall progress analysis",
      "2. Task and priority distribution",
      "3. Workload and bottlenecks",
      "4. Blockers and risks",
      "5. Recommendations for next steps."
    ].join("\n\n");
    return { messages: [{ role: "user", content: { type: "text", text: promptText } }] };
  });
}
