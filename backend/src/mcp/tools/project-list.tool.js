import { z } from "zod";
import { projectService } from "../../modules/projects/project.service.js";
import { formatMcpSuccess } from "../mcp.response.js";
import { formatMcpError } from "../mcp.errors.js";

const toolMeta = {
  title: "List Projects",
  description: "List all projects belonging to the authenticated workspace.",
  inputSchema: z.object({}),
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
};

export function registerProjectListTool(mcpServer, ctx) {
  mcpServer.registerTool("project_list", toolMeta, async () => {
    try {
      const res = await projectService.list(ctx);
      const summary = `Found ${res.projects.length} project(s) in workspace.`;
      return formatMcpSuccess({ projects: res.projects }, summary);
    } catch (err) {
      return formatMcpError(err);
    }
  });
}
