import { getDB } from "../../config/database.js";

const collection = () => getDB().collection("projects");
const LEGACY = { workspaceId: null };

export const projectRepository = {
  create: (data) => collection().insertOne(data),

  findAll: (workspaceId) =>
    collection().find({ workspaceId }).sort({ createdAt: -1 }).toArray(),

  findById: (workspaceId, _id) => collection().findOne({ _id, workspaceId }),

  update: (workspaceId, _id, data) =>
    collection().updateOne({ _id, workspaceId }, { $set: data }),

  delete: (workspaceId, _id) => collection().deleteOne({ _id, workspaceId }),

  findLegacy: () => collection().find(LEGACY).toArray(),

  assignLegacy: (workspaceId, createdBy) =>
    collection().updateMany(LEGACY, {
      $set: { workspaceId, createdBy, updatedAt: new Date() }
    })
};
