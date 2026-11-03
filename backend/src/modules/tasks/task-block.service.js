import { taskRepository } from "./task.repository.js";
import { eventService } from "../events/event.service.js";
import { blockSchema } from "./task.validation.js";
import { assertNotArchived } from "./task.rules.js";
import { toTaskDTO } from "./task.mapper.js";
import { assertRole } from "../../utils/auth-roles.js";
import { withTransaction } from "../../utils/transaction.js";

export async function blockTask(ctx, taskId, input) {
  assertRole(ctx, "member");
  const { reason } = blockSchema.parse(input);
  const task = await taskRepository.findById(ctx.workspaceId, taskId);
  if (!task) throw Object.assign(new Error("Task not found"), { statusCode: 404 });
  assertNotArchived(task);

  return withTransaction(async (session) => {
    const updated = await taskRepository.update(
      ctx.workspaceId, taskId,
      { blocked: true, blockerReason: reason, updatedAt: new Date() },
      session
    );
    await eventService.record({
      workspaceId: ctx.workspaceId, projectId: task.projectId, taskId: task._id,
      actorId: ctx.userId, action: "task.blocked", changes: { reason }
    }, session);
    return toTaskDTO(updated);
  });
}

export async function unblockTask(ctx, taskId) {
  assertRole(ctx, "member");
  const task = await taskRepository.findById(ctx.workspaceId, taskId);
  if (!task) throw Object.assign(new Error("Task not found"), { statusCode: 404 });
  assertNotArchived(task);

  return withTransaction(async (session) => {
    const updated = await taskRepository.update(
      ctx.workspaceId, taskId,
      { blocked: false, blockerReason: null, updatedAt: new Date() },
      session
    );
    await eventService.record({
      workspaceId: ctx.workspaceId, projectId: task.projectId, taskId: task._id,
      actorId: ctx.userId, action: "task.unblocked", changes: {}
    }, session);
    return toTaskDTO(updated);
  });
}
