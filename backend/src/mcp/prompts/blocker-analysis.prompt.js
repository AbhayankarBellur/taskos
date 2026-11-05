import { z } from "zod";
import { taskService } from "../../modules/tasks/task.service.js";
import { assertMcpScope } from "../mcp.scopes.js";
import { toObjectId } from "../../utils/object-id.js";

const meta = {
  title: "Blocker Analysis",
  description: "Analyze explicit blockers, dependency chains, and recommended resolution paths.",
  argsSchema: { projectId: z.string().describe("The ID of the project to analyze") }
};

export function registerBlockerAnalysisPrompt(mcpServer, ctx) {
  mcpServer.registerPrompt("blocker_analysis", meta, async ({ projectId }) => {
    assertMcpScope(ctx, "reports:read");
    toObjectId(projectId, "projectId");
    const report = await taskService.reportBlockers(ctx, { projectId });
    const promptText = [
      `Analyze the blockers for TaskOS project "${projectId}".`,
      `Summary: ${report.summary.total} total blocked (${report.summary.explicit} explicit, ${report.summary.dependency} dependency).`,
      "Blocker report data:",
      JSON.stringify(report),
      "Instructions:",
      "1. Examine explicit blockers and reasons provided.",
      "2. Trace dependency blockers and identify unfinished prerequisite tasks.",
      "3. Highlight potential critical paths causing cascading blocks.",
      "4. Recommend prioritize resolution actions.",
      "5. Note: Clearly distinguish facts retrieved from TaskOS from AI-generated recommendations."
    ].join("\n\n");
    return { messages: [{ role: "user", content: { type: "text", text: promptText } }] };
  });
}
