import { getDB } from "../../config/database.js";
import { toObjectId } from "../../utils/object-id.js";

const col = () => getDB().collection("task_assessments");

export const assessmentRepository = {
  create: (data, session) =>
    col().insertOne(data, session ? { session } : {}),

  findByTaskId: (workspaceId, taskId) =>
    col()
      .find({
        workspaceId: toObjectId(workspaceId),
        taskId: toObjectId(taskId)
      })
      .sort({ createdAt: -1 })
      .toArray(),

  findLatestByTaskId: (workspaceId, taskId) =>
    col().findOne(
      {
        workspaceId: toObjectId(workspaceId),
        taskId: toObjectId(taskId)
      },
      { sort: { createdAt: -1 } }
    )
};
