import { z } from "zod";

export const MCP_KEY_SCOPES = [
  "projects:read", "tasks:read", "reports:read",
  "tasks:write", "comments:write", "dependencies:write"
];

export const createKeySchema = z.object({
  name: z.string().min(1).max(50),
  workspaceId: z.string().min(1),
  scopes: z.array(z.enum(MCP_KEY_SCOPES)).min(1),
  expiresAt: z.string().datetime().nullable().optional()
});

export function validateCreateKey(data) {
  return createKeySchema.parse(data);
}
