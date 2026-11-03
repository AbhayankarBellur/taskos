import { z } from "zod";
import { projectService } from "../../modules/projects/project.service.js";
import { formatMcpSuccess } from "../mcp.response.js";
import { formatMcpError } from "../mcp.errors.js";
import { assertMcpScope } from "../mcp.scopes.js";

const toolMeta = {
  title: "Get Project",
  description: "Retrieve a project by ID within the authenticated workspace.",
  inputSchema: z.object({
    projectId: z.string().describe("The unique ID of the project")
  }),
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
};

export function registerProjectGetTool(mcpServer, ctx) {
  mcpServer.registerTool("project_get", toolMeta, async ({ projectId }) => {
    try {
      assertMcpScope(ctx, "projects:read");
      const project = await projectService.get(ctx, projectId);
      return formatMcpSuccess({ project }, `Project [${project.key}] ${project.name}`);
    } catch (err) {
      return formatMcpError(err);
    }
  });
}
