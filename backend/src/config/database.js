import { MongoClient } from "mongodb";

let client;
let database;

export async function connectDB() {
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  database = client.db(process.env.MONGODB_DB_NAME);
  await database.command({ ping: 1 });

  console.log("MongoDB connected");
  return database;
}

export function getDB() {
  if (!database) throw new Error("Database not initialized");
  return database;
}

export async function closeDB() {
  if (client) await client.close();
}
