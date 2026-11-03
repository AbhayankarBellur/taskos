import { getDB } from "./database.js";

export async function ensureIndexes() {
  const db = getDB();
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("workspaces").createIndex({ slug: 1 }, { unique: true }),
    db.collection("workspace_members").createIndex(
      { workspaceId: 1, userId: 1 }, { unique: true }
    ),
    db.collection("workspace_members").createIndex({ userId: 1 }),
    db.collection("sessions").createIndex(
      { expiresAt: 1 }, { expireAfterSeconds: 0 }
    ),
    db.collection("projects").createIndex({ workspaceId: 1, createdAt: -1 })
  ]);
}
