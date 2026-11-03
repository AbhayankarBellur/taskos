import { mcpKeyService } from "./mcp-key.service.js";
import { asyncHandler } from "../../utils/async-handler.js";

const getCtx = (req) => ({
  userId: req.auth?.user?._id || req.ctx?.userId
});

export const mcpKeyController = {
  create: asyncHandler(async (req, res) => {
    const data = await mcpKeyService.createKey(getCtx(req), req.body);
    res.status(201).json({ success: true, data });
  }),

  list: asyncHandler(async (req, res) => {
    const wsId = req.query.workspaceId || req.headers["x-workspace-id"];
    const data = await mcpKeyService.listKeys(getCtx(req), wsId);
    res.json({ success: true, data });
  }),

  revoke: asyncHandler(async (req, res) => {
    const data = await mcpKeyService.revokeKey(getCtx(req), req.params.id);
    res.json({ success: true, data });
  })
};
