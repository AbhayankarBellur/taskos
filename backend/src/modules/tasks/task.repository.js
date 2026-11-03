import { getDB } from "../../config/database.js";
import { toObjectId } from "../../utils/object-id.js";

const col = () => getDB().collection("tasks");

export const taskRepository = {
  create: (data, session) =>
    col().insertOne(data, session ? { session } : {}),

  findById: (workspaceId, taskId) =>
    col().findOne({
      _id: toObjectId(taskId),
      workspaceId: toObjectId(workspaceId)
    }),

  findByKey: (workspaceId, projectId, key) =>
    col().findOne({
      workspaceId: toObjectId(workspaceId),
      projectId: toObjectId(projectId),
      key
    }),

  find: (filter, { sort = { createdAt: -1 }, skip = 0, limit = 20 } = {}) =>
    col().find(filter).sort(sort).skip(skip).limit(limit).toArray(),

  count: (filter) => col().countDocuments(filter),

  update: (workspaceId, taskId, updates, session) =>
    col().findOneAndUpdate(
      {
        _id: toObjectId(taskId),
        workspaceId: toObjectId(workspaceId)
      },
      { $set: updates },
      { returnDocument: "after", ...(session ? { session } : {}) }
    )
};
