import { ObjectId } from "mongodb";

export function toObjectId(id, label = "Resource") {
  if (!id) return null;
  if (id instanceof ObjectId) return id;
  if (typeof id === "string" && ObjectId.isValid(id)) return new ObjectId(id);
  const err = new Error(`Invalid ObjectId for ${label}: ${id}`);
  err.statusCode = 400;
  throw err;
}

export const idString = (value) => (value ? value.toString() : null);
