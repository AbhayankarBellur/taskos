import { getDB } from "../../config/database.js";

const collection = () => getDB().collection("workspaces");

export const workspaceRepository = {
  create: (doc) => collection().insertOne(doc),

  findById: (_id) => collection().findOne({ _id }),

  findByIds: (ids) =>
    collection().find({ _id: { $in: ids } }).sort({ createdAt: 1 }).toArray(),

  slugExists: (slug) =>
    collection().countDocuments({ slug }, { limit: 1 }).then(Boolean),

  update: (_id, data) =>
    collection().findOneAndUpdate(
      { _id }, { $set: data }, { returnDocument: "after" }
    )
};
