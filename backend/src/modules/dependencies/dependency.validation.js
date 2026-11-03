import { z } from "zod";

export const addDependencySchema = z.object({
  dependsOnTaskId: z.string().min(1, "dependsOnTaskId is required")
});
