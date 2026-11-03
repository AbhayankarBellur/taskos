import dns from "node:dns";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { ensureIndexes } from "../src/config/indexes.js";

try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch {}
dotenv.config();

function deriveKey(name, index) {
  const clean = (name || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return (clean.slice(0, 4) || "PRJ") + (index + 1);
}

async function backfill() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "taskos";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const projectsCol = db.collection("projects");

  const projects = await projectsCol.find({}).toArray();
  console.log(`Found ${projects.length} total projects in ${dbName}`);

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const key = p.key || deriveKey(p.name, i);
    const taskCounter = typeof p.taskCounter === "number" ? p.taskCounter : 0;
    await projectsCol.updateOne(
      { _id: p._id },
      { $set: { key, taskCounter, updatedAt: new Date() } }
    );
    console.log(`Updated project ${p._id} (${p.name || "unnamed"}): key=${key}, counter=${taskCounter}`);
  }

  console.log("Ensuring indexes now that projects have unique keys...");
  await ensureIndexes(db);
  await client.close();
  console.log("Backfill & index creation complete!");
}

backfill().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
