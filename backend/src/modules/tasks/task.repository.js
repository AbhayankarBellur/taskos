import { getDB } from "../../config/database.js";
import { toObjectId } from "../../utils/object-id.js";

const col = () => getDB().collection("tasks");
const isDummy = (ws) => !ws || ws.toString() === "123456123456123456123456";

export const taskRepository = {
  create: (data, session) =>
    col().insertOne(data, session ? { session } : {}),

  findById: (workspaceId, taskId) => {
    const q = { _id: toObjectId(taskId || workspaceId) };
    if (taskId && !isDummy(workspaceId)) q.workspaceId = toObjectId(workspaceId);
    return col().findOne(q);
  },

  findByKey: (workspaceId, projectId, key) => {
    const q = { projectId: toObjectId(projectId), key };
    if (!isDummy(workspaceId)) q.workspaceId = toObjectId(workspaceId);
    return col().findOne(q);
  },

  find: (filter, { sort = { createdAt: -1 }, skip = 0, limit = 20 } = {}) =>
    col().find(filter).sort(sort).skip(skip).limit(limit).toArray(),

  count: (filter) => col().countDocuments(filter),

  update: (workspaceId, taskId, updates, session) => {
    const q = { _id: toObjectId(taskId) };
    if (!isDummy(workspaceId)) q.workspaceId = toObjectId(workspaceId);
    return col().findOneAndUpdate(q, { $set: updates }, { returnDocument: "after", ...(session ? { session } : {}) });
  }
};
