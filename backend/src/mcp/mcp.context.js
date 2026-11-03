import { getMcpConfig } from "./mcp.config.js";
import { workspaceService } from "../modules/workspaces/workspace.service.js";
import { toObjectId } from "../utils/object-id.js";
import { getDB } from "../config/database.js";

const DEF_U = "654321654321654321654321";
const DEF_W = "123456123456123456123456";

export function createTestContext(overrides = {}) {
  const userId = toObjectId(overrides.userId || DEF_U);
  const workspaceId = toObjectId(overrides.workspaceId || DEF_W);
  const role = overrides.role || "owner";
  return { userId, workspaceId, role, workspace: { _id: workspaceId, name: "Test WS" }, ...overrides };
}

export async function resolveMcpContext() {
  const config = getMcpConfig();
  if (config.isProd) throw Object.assign(new Error("Development context unavailable in production"), { statusCode: 401 });
  const devU = process.env.MCP_DEV_USER_ID, devW = process.env.MCP_DEV_WORKSPACE_ID;
  if (devU && devW) return workspaceService.resolveContext(toObjectId(devU), toObjectId(devW));
  try {
    const db = getDB();
    const doc = db ? await db.collection("workspace_members").findOne({}) : null;
    if (doc) return await workspaceService.resolveContext(doc.userId, doc.workspaceId);
  } catch {}
  return createTestContext();
}
