import { ObjectId } from "mongodb";

export function createTestCtx(role = "owner") {
  const userId = new ObjectId();
  const workspaceId = new ObjectId();
  return {
    userId,
    workspaceId,
    role,
    scopes: ["projects:read", "tasks:read", "reports:read"],
    workspace: { _id: workspaceId, name: "Test Workspace" }
  };
}
