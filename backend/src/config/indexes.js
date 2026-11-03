import { getDB } from "./database.js";

export async function ensureIndexes(customDb) {
  const db = customDb || getDB();
  if (!db) return;
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("workspaces").createIndex({ slug: 1 }, { unique: true }),
    db.collection("workspace_members").createIndex({ workspaceId: 1, userId: 1 }, { unique: true }),
    db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("tasks").createIndexes([
      { key: { workspaceId: 1, projectId: 1, key: 1 }, unique: true },
      { key: { workspaceId: 1, projectId: 1, createdAt: -1 } },
      { key: { workspaceId: 1, projectId: 1, status: 1 } },
      { key: { workspaceId: 1, assigneeId: 1, status: 1 } }
    ]),
    db.collection("task_assessments").createIndex({ workspaceId: 1, taskId: 1, createdAt: -1 }),
    db.collection("task_events").createIndex({ workspaceId: 1, taskId: 1, createdAt: -1 }),
    db.collection("task_comments").createIndex({ workspaceId: 1, taskId: 1, createdAt: -1 }),
    db.collection("task_dependencies").createIndex({ workspaceId: 1, taskId: 1, dependsOnTaskId: 1 }, { unique: true }),
    db.collection("mcp_api_keys").createIndex({ keyHash: 1 }, { unique: true }),
    db.collection("mcp_api_keys").createIndex({ workspaceId: 1, createdBy: 1 }),
    db.collection("mcp_audit_logs").createIndex({ workspaceId: 1, createdAt: -1 })
  ]);
  try {
    await db.collection("projects").createIndex({ workspaceId: 1, key: 1 }, { unique: true, sparse: true });
  } catch {}
}
