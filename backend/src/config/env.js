import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().min(1),
  FRONTEND_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_ISSUER: z.string().min(1).default("taskos-api"),
  AUTH_RATE_LIMIT: z.coerce.number().int().positive().default(10)
});

let env;

export function getEnv() {
  if (!env) env = envSchema.parse(process.env);
  return env;
}

export function allowedOrigins() {
  return getEnv().FRONTEND_URL.split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}
