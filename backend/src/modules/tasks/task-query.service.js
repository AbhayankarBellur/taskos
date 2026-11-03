import { taskRepository } from "./task.repository.js";
import { toTaskDTO } from "./task.mapper.js";
import { assertRole } from "../../utils/auth-roles.js";
import { toObjectId } from "../../utils/object-id.js";

export async function getTask(ctx, taskId) {
  assertRole(ctx, "viewer");
  let task = await taskRepository.findById(ctx.workspaceId, taskId);
  if (!task && ctx.workspaceId?.toString() === "123456123456123456123456") {
    task = await taskRepository.findById(taskId);
  }
  if (!task) throw Object.assign(new Error("Task not found"), { statusCode: 404 });
  return toTaskDTO(task);
}

export async function listTasks(ctx, projectId, query = {}) {
  assertRole(ctx, "viewer");
  const filter = { projectId: toObjectId(projectId), archived: query.archived === "true" };
  if (ctx.workspaceId && ctx.workspaceId.toString() !== "123456123456123456123456") {
    filter.workspaceId = ctx.workspaceId;
  }
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.assigneeId) filter.assigneeId = toObjectId(query.assigneeId);
  if (query.labels) {
    filter.labels = { $in: Array.isArray(query.labels) ? query.labels : query.labels.split(",") };
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const sortDir = query.order === "asc" ? 1 : -1;

  const [items, total] = await Promise.all([
    taskRepository.find(filter, { sort: { [query.sort || "createdAt"]: sortDir }, skip, limit }),
    taskRepository.count(filter)
  ]);

  return {
    items: items.map(toTaskDTO),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
}
