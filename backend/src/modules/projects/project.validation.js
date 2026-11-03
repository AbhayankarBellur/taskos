import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().max(1000).default(""),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#6366F1")
});

export const updateProjectSchema = createProjectSchema.partial();

export function validateProject(data) {
  return createProjectSchema.parse(data);
}
