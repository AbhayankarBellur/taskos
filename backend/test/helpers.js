import "dotenv/config";
import { randomBytes } from "node:crypto";
import { ORIGIN } from "./client.js";

export { client, uniqueEmail } from "./client.js";
Object.assign(process.env, {
  NODE_ENV: "test",
  MONGODB_DB_NAME: "taskos_test",
  FRONTEND_URL: ORIGIN,
  JWT_SECRET: randomBytes(48).toString("base64"),
  AUTH_RATE_LIMIT: "1000"
});

const { connectDB, closeDB, getDB } = await import("../src/config/database.js");
const { ensureIndexes } = await import("../src/config/indexes.js");
const { default: app } = await import("../src/app.js");

export { getDB };

async function clearDatabase() {
  const collections = await getDB().collections();
  await Promise.all(collections.map((c) => c.drop()));
}

export async function startServer() {
  await connectDB();
  await clearDatabase();
  await ensureIndexes();
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  const stop = async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await clearDatabase();
    await closeDB();
  };
  return { base, stop };
}
