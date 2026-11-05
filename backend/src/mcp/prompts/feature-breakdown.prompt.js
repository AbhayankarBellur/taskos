import { z } from "zod";
import { projectService } from "../../modules/projects/project.service.js";
import { assertMcpScopes } from "../mcp.scopes.js";
import { toObjectId } from "../../utils/object-id.js";

const meta = {
  title: "Break Down Feature",
  description: "Propose parent tasks, subtasks, dependencies, and complexity for a feature proposal.",
  argsSchema: {
    projectId: z.string().describe("The ID of the target project"),
    featureDescription: z.string().min(1).describe("Description of the feature to break down")
  }
};

export function registerFeatureBreakdownPrompt(mcpServer, ctx) {
  mcpServer.registerPrompt("break_down_feature", meta, async ({ projectId, featureDescription }) => {
    assertMcpScopes(ctx, ["projects:read", "tasks:read"]);
    toObjectId(projectId, "projectId");
    const project = await projectService.get(ctx, projectId);
    const promptText = [
      `You are planning a feature breakdown for TaskOS project "${project.name}" (key: ${project.key}).`,
      `Feature to implement:\n${featureDescription}`,
      "Instructions (PROPOSAL ONLY - DO NOT EXECUTE OR CREATE TASKS):",
      "1. Identify key architectural and implementation areas.",
      "2. Propose parent tasks and subtasks with descriptive titles.",
      "3. Suggest prerequisites and dependency relationships between proposed tasks.",
      "4. Estimate relative complexity (low, medium, high, critical) for each item.",
      "5. Highlight implementation risks and edge cases.",
      "Clearly label your output as a Proposal."
    ].join("\n\n");
    return { messages: [{ role: "user", content: { type: "text", text: promptText } }] };
  });
}
