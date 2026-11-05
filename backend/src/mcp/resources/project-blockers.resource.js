import { ResourceTemplate } from "@modelcontextprotocol/server";
import { taskService } from "../../modules/tasks/task.service.js";
import { assertMcpScope } from "../mcp.scopes.js";
import { toObjectId } from "../../utils/object-id.js";
import { formatResourceResult } from "./resource-format.js";

const template = new ResourceTemplate("taskos://projects/{projectId}/blockers", { list: undefined });
const meta = {
  title: "Project Blockers",
  description: "Project blocker report distinguishing explicit and dependency blockers.",
  mimeType: "application/json"
};

export function registerProjectBlockersResource(mcpServer, ctx) {
  mcpServer.registerResource("project_blockers", template, meta, async (uri, vars) => {
    assertMcpScope(ctx, "reports:read");
    toObjectId(vars.projectId, "projectId");
    const report = await taskService.reportBlockers(ctx, { projectId: vars.projectId });
    const data = {
      projectId: vars.projectId,
      summary: report.summary,
      explicitBlockers: report.explicitBlockers,
      dependencyBlockers: report.dependencyBlockers
    };
    return formatResourceResult(uri, data);
  });
}
