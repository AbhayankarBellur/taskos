import { ObjectId } from "mongodb";
import { notFound } from "./app-error.js";

const HEX_ID = /^[0-9a-fA-F]{24}$/;

export function toObjectId(id, label = "Resource") {
  if (typeof id !== "string" || !HEX_ID.test(id)) throw notFound(label);
  return new ObjectId(id);
}

export const idString = (value) => (value ? value.toString() : null);
