import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(80),
  key: z.string().trim().toUpperCase()
    .regex(/^[A-Z0-9]{2,10}$/, "Key must be 2-10 alphanumeric characters")
    .optional(),
  description: z.string().max(1000).default(""),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#6366F1")
});

export const updateProjectSchema = createProjectSchema.partial();

export function validateProject(data) {
  return createProjectSchema.parse(data);
}
