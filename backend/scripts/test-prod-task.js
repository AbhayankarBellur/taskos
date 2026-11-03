import dns from "node:dns";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch {}
dotenv.config();

async function testTask() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("taskos");
  const project = await db.collection("projects").findOne({ key: "MCPS1" });
  if (!project) throw new Error("Project MCPS1 not found");
  const session = client.startSession();
  let createdTaskId, taskKey;
  await session.withTransaction(async () => {
    const updatedPrj = await db.collection("projects").findOneAndUpdate(
      { _id: project._id, workspaceId: project.workspaceId },
      { $inc: { taskCounter: 1 } },
      { returnDocument: "after", session }
    );
    taskKey = `${updatedPrj.key}-${updatedPrj.taskCounter}`;
    const taskDoc = {
      workspaceId: project.workspaceId, projectId: project._id,
      key: taskKey, title: "Production Verification Task",
      status: "todo", priority: "high", blocked: false, archived: false,
      createdAt: new Date(), updatedAt: new Date()
    };
    const res = await db.collection("tasks").insertOne(taskDoc, { session });
    createdTaskId = res.insertedId;
    await db.collection("task_events").insertOne({
      workspaceId: project.workspaceId, projectId: project._id,
      taskId: createdTaskId, action: "task.created", createdAt: new Date()
    }, { session });
  });
  console.log(`Created prod task: id=${createdTaskId}, key=${taskKey}`);
  await db.collection("tasks").deleteOne({ _id: createdTaskId });
  await db.collection("task_events").deleteMany({ taskId: createdTaskId });
  console.log("Cleaned up verification task. Atlas transaction verified!");
  await session.endSession();
  await client.close();
}

testTask().catch(console.error);
