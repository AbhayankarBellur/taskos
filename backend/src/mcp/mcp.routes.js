import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { mcpSecurityMiddleware } from "./mcp.security.js";
import { mcpAuthMiddleware } from "./mcp.auth.js";
import { handleMcpRequest } from "./mcp.handler.js";

const router = Router();
const mcpLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  message: { jsonrpc: "2.0", error: { code: -32000, message: "Too many MCP requests" }, id: null }
});

router.use(mcpLimiter);
router.use(mcpSecurityMiddleware);
router.use(mcpAuthMiddleware);
router.post("/", handleMcpRequest);

export default router;
