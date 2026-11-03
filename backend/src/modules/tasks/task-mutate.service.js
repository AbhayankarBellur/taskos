import { taskRepository } from "./task.repository.js";
import { eventService } from "../events/event.service.js";
import { updateTaskSchema } from "./task.validation.js";
import { assertNotArchived } from "./task.rules.js";
import { toTaskDTO } from "./task.mapper.js";
import { assertRole } from "../../utils/auth-roles.js";
import { withTransaction } from "../../utils/transaction.js";

export async function updateTask(ctx, taskId, input) {
  assertRole(ctx, "member");
  const data = updateTaskSchema.parse(input);
  const task = await taskRepository.findById(ctx.workspaceId, taskId);
  if (!task) throw Object.assign(new Error("Task not found"), { statusCode: 404 });
  assertNotArchived(task);

  const updates = { ...data, updatedAt: new Date() };
  return withTransaction(async (session) => {
    const updated = await taskRepository.update(
      ctx.workspaceId, taskId, updates, session
    );
    await eventService.record({
      workspaceId: ctx.workspaceId, projectId: task.projectId, taskId: task._id,
      actorId: ctx.userId, action: "task.updated", changes: data
    }, session);
    return toTaskDTO(updated);
  });
}

export async function archiveTask(ctx, taskId) {
  assertRole(ctx, "admin");
  const task = await taskRepository.findById(ctx.workspaceId, taskId);
  if (!task) throw Object.assign(new Error("Task not found"), { statusCode: 404 });
  assertNotArchived(task);

  return withTransaction(async (session) => {
    const updated = await taskRepository.update(
      ctx.workspaceId, taskId, { archived: true, updatedAt: new Date() }, session
    );
    await eventService.record({
      workspaceId: ctx.workspaceId, projectId: task.projectId, taskId: task._id,
      actorId: ctx.userId, action: "task.archived", changes: {}
    }, session);
    return toTaskDTO(updated);
  });
}
