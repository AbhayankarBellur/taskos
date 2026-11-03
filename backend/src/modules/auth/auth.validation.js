import { z } from "zod";
import { emailSchema, nameSchema } from "../../utils/schemas.js";

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: emailSchema,
  password: z.string().min(8).max(72),
  workspaceName: nameSchema.optional()
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72)
});
