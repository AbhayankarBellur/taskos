import { toObjectId } from "../../utils/object-id.js";
import { getDB } from "../../config/database.js";

const col = () => getDB().collection("projects");
const LEGACY = { workspaceId: null };

export const projectRepository = {
  create: (data) => col().insertOne(data),

  findAll: (wsId) =>
    col().find(wsId ? { workspaceId: toObjectId(wsId) } : {}).sort({ createdAt: -1 }).toArray(),

  findById: (wsId, id) => {
    const targetId = toObjectId(id || wsId);
    const q = { _id: targetId };
    if (id && wsId) q.workspaceId = toObjectId(wsId);
    return col().findOne(q);
  },

  findByKey: (wsId, key) =>
    col().findOne({ workspaceId: toObjectId(wsId), key }),

  incrementTaskCounter: (wsId, id, session) =>
    col().findOneAndUpdate(
      { _id: toObjectId(id), workspaceId: toObjectId(wsId) },
      { $inc: { taskCounter: 1 } },
      { returnDocument: "after", session }
    ),

  update: (wsId, id, data) =>
    col().updateOne(
      { _id: toObjectId(id || wsId), ...(id ? { workspaceId: toObjectId(wsId) } : {}) },
      { $set: data }
    ),

  delete: (wsId, id) =>
    col().deleteOne({ _id: toObjectId(id || wsId), ...(id ? { workspaceId: toObjectId(wsId) } : {}) }),

  findLegacy: () => col().find(LEGACY).toArray(),

  assignLegacy: (workspaceId, createdBy) =>
    col().updateMany(LEGACY, { $set: { workspaceId, createdBy, updatedAt: new Date() } })
};
