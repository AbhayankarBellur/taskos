import dns from "node:dns";
import { MongoClient } from "mongodb";
import { ensureIndexes } from "./indexes.js";

try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch {}
let client;
let database;

export async function connectDB() {
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  database = client.db(process.env.MONGODB_DB_NAME);
  await database.command({ ping: 1 });
  await ensureIndexes(database);
  return database;
}

export function getDB() {
  if (!database) throw new Error("Database not initialized");
  return database;
}

export function setDB(db) {
  database = db;
}

export function getClient() {
  return client;
}

export async function closeDB() {
  if (client) await client.close();
}
