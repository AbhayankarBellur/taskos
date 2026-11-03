import dns from "node:dns";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch {}
dotenv.config();

async function verify() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "taskos";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  console.log("Connected to MongoDB Atlas:", dbName);
  const projects = await db.collection("projects").find({}).toArray();
  console.log(`Projects count: ${projects.length}`);
  projects.forEach((p) => {
    console.log(`- Project: id=${p._id}, name="${p.name}", key="${p.key}", counter=${p.taskCounter}`);
  });

  const prjIndexes = await db.collection("projects").indexes();
  console.log("Project indexes:", prjIndexes.map((i) => i.name));

  const taskIndexes = await db.collection("tasks").indexes();
  console.log("Tasks indexes:", taskIndexes.map((i) => i.name));

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      console.log("MongoDB Atlas transaction session verified successfully!");
    });
  } catch (err) {
    console.error("Transaction check failed:", err.message);
  } finally {
    await session.endSession();
  }

  await client.close();
}

verify().catch(console.error);
