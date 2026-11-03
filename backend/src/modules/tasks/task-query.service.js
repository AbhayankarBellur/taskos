import { taskRepository } from "./task.repository.js";
import { toTaskDTO } from "./task.mapper.js";
import { assertRole } from "../../utils/auth-roles.js";
import { toObjectId } from "../../utils/object-id.js";

export async function getTask(ctx, taskId) {
  assertRole(ctx, "viewer");
  const task = await taskRepository.findById(ctx.workspaceId, taskId);
  if (!task) {
    const err = new Error("Task not found");
    err.statusCode = 404;
    throw err;
  }
  return toTaskDTO(task);
}

export async function listTasks(ctx, projectId, query = {}) {
  assertRole(ctx, "viewer");
  const filter = {
    workspaceId: ctx.workspaceId,
    projectId: toObjectId(projectId),
    archived: query.archived === "true"
  };
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.assigneeId) filter.assigneeId = toObjectId(query.assigneeId);
  if (query.labels) {
    const labelsArr = Array.isArray(query.labels)
      ? query.labels
      : query.labels.split(",");
    filter.labels = { $in: labelsArr };
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const sortField = query.sort || "createdAt";
  const sortDir = query.order === "asc" ? 1 : -1;

  const [items, total] = await Promise.all([
    taskRepository.find(filter, { sort: { [sortField]: sortDir }, skip, limit }),
    taskRepository.count(filter)
  ]);

  return {
    items: items.map(toTaskDTO),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
}
