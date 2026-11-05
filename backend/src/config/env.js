import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/taskos"),
  MONGODB_DB_NAME: z.string().min(1).default("taskos"),
  FRONTEND_URL: z.string().min(1).default("http://localhost:3000"),
  JWT_SECRET: z.string().min(32).default("development_secret_must_be_at_least_32_characters_long"),
  JWT_ISSUER: z.string().min(1).default("taskos-api"),
  AUTH_RATE_LIMIT: z.coerce.number().int().positive().default(100)
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
