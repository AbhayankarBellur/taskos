import { getDB } from "../../config/database.js";

const collection = () => getDB().collection("users");
const withoutHash = { projection: { passwordHash: 0 } };

export const userRepository = {
  create: (doc) => collection().insertOne(doc),
  findByEmail: (email) => collection().findOne({ email }),
  findById: (_id) => collection().findOne({ _id }, withoutHash),
  findManyByIds: (ids) =>
    collection().find({ _id: { $in: ids } }, withoutHash).toArray(),
  deleteById: (_id) => collection().deleteOne({ _id })
};
