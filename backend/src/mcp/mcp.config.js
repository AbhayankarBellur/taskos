import { getEnv, allowedOrigins } from "../config/env.js";

export function getMcpConfig() {
  const env = getEnv();
  const enabled = process.env.MCP_ENABLED === "true";
  const isProd = (process.env.NODE_ENV || env.NODE_ENV) === "production";
  const devMode = !isProd && process.env.MCP_DEV_MODE === "true";
  const hostnames = [
    "localhost", "127.0.0.1", "::1",
    process.env.RENDER_EXTERNAL_HOSTNAME,
    process.env.MCP_HOST
  ].filter(Boolean);
  const extra = (process.env.MCP_ALLOWED_HOSTS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const origins = allowedOrigins().map((o) => {
    try { return new URL(o).hostname; } catch { return o; }
  });
  const allAllowed = [...new Set([...hostnames, ...origins, ...extra])];
  return { enabled, devMode, isProd, allowedHosts: allAllowed, allowedOrigins: allAllowed };
}
