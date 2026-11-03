import { getDB } from "../../config/database.js";
import { toObjectId } from "../../utils/object-id.js";

const col = () => getDB().collection("mcp_api_keys");

export const mcpKeyRepository = {
  create: (data) => col().insertOne(data),

  findByHash: (keyHash) => col().findOne({ keyHash }),

  findById: (id) => col().findOne({ _id: toObjectId(id) }),

  listByUser: (userId, workspaceId) =>
    col().find({
      createdBy: toObjectId(userId),
      workspaceId: toObjectId(workspaceId)
    }).sort({ createdAt: -1 }).toArray(),

  revoke: (id, userId) =>
    col().findOneAndUpdate(
      { _id: toObjectId(id), createdBy: toObjectId(userId) },
      { $set: { revokedAt: new Date() } },
      { returnDocument: "after" }
    ),

  touchLastUsed: (id) =>
    col().updateOne({ _id: toObjectId(id) }, { $set: { lastUsedAt: new Date() } })
};
