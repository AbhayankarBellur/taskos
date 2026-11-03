import crypto from "node:crypto";
import { mcpKeyRepository } from "../modules/mcp-keys/mcp-key.repository.js";
import { memberRepository } from "../modules/workspaces/member.repository.js";
import { userRepository } from "../modules/users/user.repository.js";
import { mcpContextStorage } from "./mcp.context.js";

export async function mcpAuthMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ jsonrpc: "2.0", error: { code: -32001, message: "Missing Bearer token" }, id: null });
  }
  const token = auth.slice(7).trim();
  if (!token) {
    return res.status(401).json({ jsonrpc: "2.0", error: { code: -32001, message: "Empty Bearer token" }, id: null });
  }

  const keyHash = crypto.createHash("sha256").update(token).digest("hex");
  const key = await mcpKeyRepository.findByHash(keyHash);
  if (!key) {
    return res.status(401).json({ jsonrpc: "2.0", error: { code: -32001, message: "Invalid API key" }, id: null });
  }
  if (key.revokedAt) {
    return res.status(401).json({ jsonrpc: "2.0", error: { code: -32001, message: "API key has been revoked" }, id: null });
  }
  if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
    return res.status(401).json({ jsonrpc: "2.0", error: { code: -32001, message: "API key has expired" }, id: null });
  }

  const [user, member] = await Promise.all([
    userRepository.findById(key.createdBy),
    memberRepository.find(key.workspaceId, key.createdBy)
  ]);
  if (!user) {
    return res.status(401).json({ jsonrpc: "2.0", error: { code: -32001, message: "User not found or inactive" }, id: null });
  }
  if (!member) {
    return res.status(403).json({ jsonrpc: "2.0", error: { code: -32003, message: "User is no longer a member of this workspace" }, id: null });
  }

  const ctx = {
    userId: key.createdBy, workspaceId: key.workspaceId, role: member.role,
    scopes: key.scopes || [], keyId: key._id, workspace: { _id: key.workspaceId, name: "Workspace" }
  };
  mcpKeyRepository.touchLastUsed(key._id).catch(() => {});
  req.mcpContext = ctx;
  mcpContextStorage.run(ctx, () => next());
}
