import { getDB } from "../../config/database.js";

const collection = () => getDB().collection("sessions");

export const authRepository = {
  createSession: (doc) => collection().insertOne(doc),

  findSession: (_id) => collection().findOne({ _id }),

  revokeSession: (_id) =>
    collection().updateOne(
      { _id, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    )
};
