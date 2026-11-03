import { getClient } from "../config/database.js";

export async function withTransaction(fn) {
  const client = getClient();
  if (!client || typeof client.startSession !== "function") {
    return fn(null);
  }
  const session = client.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } catch (err) {
    const msg = err?.message || "";
    if (msg.includes("replica set") || msg.includes("Transaction")) {
      return fn(null);
    }
    throw err;
  } finally {
    await session.endSession();
  }
}
