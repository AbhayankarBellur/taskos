import { ResourceTemplate } from "@modelcontextprotocol/server";
import { projectService } from "../../modules/projects/project.service.js";
import { assertMcpScope } from "../mcp.scopes.js";
import { toObjectId } from "../../utils/object-id.js";
import { formatResourceResult } from "./resource-format.js";

const template = new ResourceTemplate("taskos://projects/{projectId}", { list: undefined });
const meta = {
  title: "Project Details",
  description: "Details of a specific project within the authenticated workspace.",
  mimeType: "application/json"
};

export function registerProjectResource(mcpServer, ctx) {
  mcpServer.registerResource("project_details", template, meta, async (uri, vars) => {
    assertMcpScope(ctx, "projects:read");
    toObjectId(vars.projectId, "projectId");
    const p = await projectService.get(ctx, vars.projectId);
    const data = {
      id: p.id,
      name: p.name,
      key: p.key,
      description: p.description ?? null,
      status: p.status ?? "active",
      taskCounter: p.taskCounter ?? 0,
      workspaceId: p.workspaceId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    };
    return formatResourceResult(uri, data);
  });
}
