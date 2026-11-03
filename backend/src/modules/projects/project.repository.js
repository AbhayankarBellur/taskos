import { ObjectId } from "mongodb";
import { getDB } from "../../config/database.js";

const collection = () => getDB().collection("projects");

export const projectRepository = {
  create: (data) => collection().insertOne(data),

  findAll: (filter = {}) =>
    collection().find(filter).sort({ createdAt: -1 }).toArray(),

  findById: (id) =>
    ObjectId.isValid(id)
      ? collection().findOne({ _id: new ObjectId(id) })
      : null,

  update: (id, data) =>
    collection().updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    ),

  delete: (id) =>
    collection().deleteOne({ _id: new ObjectId(id) })
};
