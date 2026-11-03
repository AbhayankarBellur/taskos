import { ObjectId } from "mongodb";

export function createTestCtx(role = "owner") {
  const userId = new ObjectId();
  const workspaceId = new ObjectId();
  return {
    userId,
    workspaceId,
    role,
    workspace: { _id: workspaceId, name: "Test Workspace" }
  };
}
