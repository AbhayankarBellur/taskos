import { z } from "zod";
import { emailSchema, nameSchema } from "../../utils/schemas.js";
import { ROLES } from "../../utils/permissions.js";

export const workspaceSchema = z.object({ name: nameSchema });

export const roleSchema = z.object({ role: z.enum(ROLES) });

export const addMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(ROLES).default("member")
});
