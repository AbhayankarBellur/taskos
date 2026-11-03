import { getEnv, allowedOrigins } from "../config/env.js";

export function getMcpConfig() {
  const env = getEnv();
  const enabled = process.env.MCP_ENABLED === "true";
  const isProd = (process.env.NODE_ENV || env.NODE_ENV) === "production";
  const devMode = !isProd && process.env.MCP_DEV_MODE === "true";
  const hostnames = ["localhost", "127.0.0.1", "::1"];
  const origins = allowedOrigins().map((o) => {
    try { return new URL(o).hostname; } catch { return o; }
  });
  return {
    enabled,
    devMode,
    isProd,
    allowedHosts: [...new Set([...hostnames, ...origins])],
    allowedOrigins: [...new Set([...hostnames, ...origins])]
  };
}
