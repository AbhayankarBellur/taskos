import { registerProjectOverviewPrompt } from "./project-overview.prompt.js";
import { registerFeatureBreakdownPrompt } from "./feature-breakdown.prompt.js";
import { registerSprintReviewPrompt } from "./sprint-review.prompt.js";
import { registerBlockerAnalysisPrompt } from "./blocker-analysis.prompt.js";
import { registerTaskReviewPrompt } from "./task-review.prompt.js";

export function registerAllPrompts(mcpServer, ctx) {
  registerProjectOverviewPrompt(mcpServer, ctx);
  registerFeatureBreakdownPrompt(mcpServer, ctx);
  registerSprintReviewPrompt(mcpServer, ctx);
  registerBlockerAnalysisPrompt(mcpServer, ctx);
  registerTaskReviewPrompt(mcpServer, ctx);
}
