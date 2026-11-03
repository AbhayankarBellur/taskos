import { z } from "zod";

export const createKeySchema = z.object({
  name: z.string().min(1).max(50),
  workspaceId: z.string().min(1),
  scopes: z.array(z.enum(["projects:read", "tasks:read", "reports:read"])).min(1),
  expiresAt: z.string().datetime().nullable().optional()
});

export function validateCreateKey(data) {
  return createKeySchema.parse(data);
}
