import { getDB } from "../../config/database.js";

const collection = () => getDB().collection("workspace_members");

export const memberRepository = {
  create: (doc) => collection().insertOne(doc),

  find: (workspaceId, userId) => collection().findOne({ workspaceId, userId }),

  listByUser: (userId) => collection().find({ userId }).toArray(),

  listByWorkspace: (workspaceId) =>
    collection().find({ workspaceId }).sort({ joinedAt: 1 }).toArray(),

  countOwners: (workspaceId) =>
    collection().countDocuments({ workspaceId, role: "owner" }),

  updateRole: (workspaceId, userId, role) =>
    collection().updateOne({ workspaceId, userId }, { $set: { role } }),

  remove: (workspaceId, userId) =>
    collection().deleteOne({ workspaceId, userId })
};
