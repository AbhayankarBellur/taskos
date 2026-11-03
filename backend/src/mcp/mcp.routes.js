import { Router } from "express";
import { mcpSecurityMiddleware } from "./mcp.security.js";
import { handleMcpRequest } from "./mcp.handler.js";

const router = Router();
router.use(mcpSecurityMiddleware);
router.post("/", handleMcpRequest);

export default router;
