import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1).default("mongodb+srv://abhi:abhi123@cluster0.d9usm.mongodb.net/"),
  MONGODB_DB_NAME: z.string().min(1).default("taskos"),
  FRONTEND_URL: z.string().min(1).default("http://localhost:3000"),
  JWT_SECRET: z.string().min(32).default("iTLOHOsqWc72WBzsSW1P0BMZ/YxMWY04y83yBBX4W7USNykf+VRs3emdJi5c1Kgd"),
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
