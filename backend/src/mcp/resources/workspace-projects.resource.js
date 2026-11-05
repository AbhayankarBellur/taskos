import { projectService } from "../../modules/projects/project.service.js";
import { assertMcpScope } from "../mcp.scopes.js";
import { formatResourceResult } from "./resource-format.js";

const meta = {
  title: "Workspace Projects",
  description: "Structured overview of projects in the authenticated workspace.",
  mimeType: "application/json"
};

export function registerWorkspaceProjectsResource(mcpServer, ctx) {
  mcpServer.registerResource("workspace_projects", "taskos://workspace/projects", meta, async (uri) => {
    assertMcpScope(ctx, "projects:read");
    const result = await projectService.list(ctx);
    const projects = Array.isArray(result) ? result : (result?.projects || []);
    const data = projects.map((p) => ({
      id: p.id,
      name: p.name,
      key: p.key,
      description: p.description ?? null,
      status: p.status ?? "active",
      taskCounter: p.taskCounter ?? 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));
    return formatResourceResult(uri, data);
  });
}
