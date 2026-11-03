import { getDB } from "../../config/database.js";
import { toObjectId } from "../../utils/object-id.js";

const col = () => getDB().collection("task_events");

export const eventRepository = {
  create: (data, session) =>
    col().insertOne(data, session ? { session } : {}),

  findByTaskId: (workspaceId, taskId) =>
    col()
      .find({
        workspaceId: toObjectId(workspaceId),
        taskId: toObjectId(taskId)
      })
      .sort({ createdAt: -1 })
      .toArray()
};
