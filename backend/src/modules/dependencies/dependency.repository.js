import { getDB } from "../../config/database.js";
import { toObjectId } from "../../utils/object-id.js";

const col = () => getDB().collection("task_dependencies");

export const dependencyRepository = {
  create: (data, session) =>
    col().insertOne(data, session ? { session } : {}),

  findByTaskId: (workspaceId, taskId) =>
    col().find({
      workspaceId: toObjectId(workspaceId),
      taskId: toObjectId(taskId)
    }).toArray(),

  findByDependsOnTaskId: (workspaceId, dependsOnTaskId) =>
    col().find({
      workspaceId: toObjectId(workspaceId),
      dependsOnTaskId: toObjectId(dependsOnTaskId)
    }).toArray(),

  findOne: (workspaceId, taskId, dependsOnTaskId) =>
    col().findOne({
      workspaceId: toObjectId(workspaceId),
      taskId: toObjectId(taskId),
      dependsOnTaskId: toObjectId(dependsOnTaskId)
    }),

  findById: (workspaceId, id) =>
    col().findOne({
      _id: toObjectId(id),
      workspaceId: toObjectId(workspaceId)
    }),

  delete: (workspaceId, id, session) =>
    col().deleteOne(
      { _id: toObjectId(id), workspaceId: toObjectId(workspaceId) },
      session ? { session } : {}
    )
};
