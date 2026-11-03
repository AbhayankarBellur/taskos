import { z } from "zod";
import { taskService } from "../../modules/tasks/task.service.js";
import { formatMcpSuccess } from "../mcp.response.js";
import { formatMcpError } from "../mcp.errors.js";
import { assertMcpScope } from "../mcp.scopes.js";

const toolMeta = {
  title: "Report Blockers",
  description: "Report tasks blocked explicitly or by unfinished dependencies.",
  inputSchema: z.object({
    projectId: z.string().optional().describe("Optional project ID to filter blockers"),
    assigneeId: z.string().optional().describe("Optional assignee ID to filter blockers"),
    limit: z.number().int().min(1).max(100).optional().describe("Maximum tasks to return")
  }),
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
};

export function registerReportBlockersTool(mcpServer, ctx) {
  mcpServer.registerTool("report_blockers", toolMeta, async (args) => {
    try {
      assertMcpScope(ctx, "reports:read");
      const report = await taskService.reportBlockers(ctx, args);
      const summary = `Found ${report.summary.total} blocked task(s) (${report.summary.explicit} explicit, ${report.summary.dependency} dependency).`;
      return formatMcpSuccess(report, summary);
    } catch (err) {
      return formatMcpError(err);
    }
  });
}
