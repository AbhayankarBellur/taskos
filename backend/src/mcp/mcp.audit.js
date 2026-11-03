import { getDB } from "../config/database.js";
import { toObjectId } from "../utils/object-id.js";

export async function recordMcpAudit({ keyId, userId, workspaceId, toolName, success, errorCategory }) {
  try {
    const db = getDB();
    if (!db) return;
    await db.collection("mcp_audit_logs").insertOne({
      keyId: keyId ? toObjectId(keyId) : null,
      userId: userId ? toObjectId(userId) : null,
      workspaceId: workspaceId ? toObjectId(workspaceId) : null,
      toolName,
      success: Boolean(success),
      errorCategory: errorCategory || null,
      createdAt: new Date()
    });
  } catch {}
}
