import { ObjectId } from "mongodb";

export function createTestCtx(role = "owner", scopes = null) {
  const userId = new ObjectId();
  const workspaceId = new ObjectId();
  return {
    userId,
    workspaceId,
    role,
    scopes: scopes || [
      "projects:read", "tasks:read", "reports:read",
      "tasks:write", "comments:write", "dependencies:write"
    ],
    workspace: { _id: workspaceId, name: "Test Workspace" }
  };
}
