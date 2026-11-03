import { getMcpConfig } from "./mcp.config.js";
import { validateHostHeader, validateOriginHeader } from "@modelcontextprotocol/server";

export function mcpSecurityMiddleware(req, res, next) {
  const config = getMcpConfig();
  if (!config.enabled) {
    return res.status(503).json({
      jsonrpc: "2.0", error: { code: -32000, message: "MCP server is disabled" }, id: null
    });
  }

  if (config.isProd || !config.devMode) {
    return res.status(401).json({
      jsonrpc: "2.0", error: { code: -32001, message: "MCP authentication required in production" }, id: null
    });
  }

  const hostCheck = validateHostHeader(req.headers.host, config.allowedHosts);
  if (!hostCheck.ok) {
    return res.status(403).json({
      jsonrpc: "2.0", error: { code: -32000, message: hostCheck.message }, id: null
    });
  }

  const originCheck = validateOriginHeader(req.headers.origin, config.allowedOrigins);
  if (!originCheck.ok) {
    return res.status(403).json({
      jsonrpc: "2.0", error: { code: -32000, message: originCheck.message }, id: null
    });
  }

  next();
}
