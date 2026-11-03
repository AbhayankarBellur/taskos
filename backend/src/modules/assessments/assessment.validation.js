import { z } from "zod";

export const POINTS = [1, 2, 3, 5, 8, 13];
export const LEVELS = ["low", "medium", "high"];

export const createAssessmentSchema = z.object({
  complexity: z.enum(LEVELS),
  storyPoints: z.number().refine(
    (n) => POINTS.includes(n),
    { message: "Story points must be one of: 1, 2, 3, 5, 8, 13" }
  ),
  estimatedHours: z.number().nonnegative(),
  risk: z.enum(LEVELS),
  confidence: z.number().int().min(0).max(100),
  notes: z.string().max(2000).optional().default(""),
  source: z.enum(["user", "mcp", "system"]).optional().default("user")
});
