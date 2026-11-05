import { AsyncLocalStorage } from "node:async_hooks";
import { getMcpConfig } from "./mcp.config.js";
import { workspaceService } from "../modules/workspaces/workspace.service.js";
import { toObjectId } from "../utils/object-id.js";
import { getDB } from "../config/database.js";
import { MCP_SCOPES } from "./mcp.scopes.js";

export const mcpContextStorage = new AsyncLocalStorage();

const DEF_U = "654321654321654321654321";
const DEF_W = "123456123456123456123456";
const ALL_SCOPES = Object.values(MCP_SCOPES);

export function createTestContext(overrides = {}) {
  const userId = toObjectId(overrides.userId || DEF_U);
  const workspaceId = toObjectId(overrides.workspaceId || DEF_W);
  const role = overrides.role || "owner";
  const scopes = overrides.scopes || ALL_SCOPES;
  return { userId, workspaceId, role, scopes, workspace: { _id: workspaceId, name: "Test WS" }, ...overrides };
}

export async function resolveMcpContext() {
  const stored = mcpContextStorage.getStore();
  if (stored) return stored;
  const config = getMcpConfig();
  if (config.isProd) throw Object.assign(new Error("Development context unavailable in production"), { statusCode: 401 });
  const devU = process.env.MCP_DEV_USER_ID, devW = process.env.MCP_DEV_WORKSPACE_ID;
  if (devU && devW) {
    const ctx = await workspaceService.resolveContext(toObjectId(devU), toObjectId(devW));
    return { ...ctx, scopes: ALL_SCOPES };
  }
  try {
    const db = getDB();
    const doc = db ? await db.collection("workspace_members").findOne({}) : null;
    if (doc) {
      const ctx = await workspaceService.resolveContext(doc.userId, doc.workspaceId);
      return { ...ctx, scopes: ALL_SCOPES };
    }
  } catch {}
  return createTestContext();
}
