import { taskRepository } from "./task.repository.js";
import { eventService } from "../events/event.service.js";
import { assigneeSchema } from "./task.validation.js";
import { assertNotArchived } from "./task.rules.js";
import { toTaskDTO } from "./task.mapper.js";
import { assertRole } from "../../utils/auth-roles.js";
import { toObjectId } from "../../utils/object-id.js";
import { withTransaction } from "../../utils/transaction.js";

export async function assignTask(ctx, taskId, input) {
  assertRole(ctx, "member");
  const { assigneeId } = assigneeSchema.parse(input);
  const task = await taskRepository.findById(ctx.workspaceId, taskId);
  if (!task) {
    const err = new Error("Task not found");
    err.statusCode = 404;
    throw err;
  }
  assertNotArchived(task);
  const targetId = assigneeId ? toObjectId(assigneeId) : null;

  return withTransaction(async (session) => {
    const updated = await taskRepository.update(
      ctx.workspaceId,
      taskId,
      { assigneeId: targetId, updatedAt: new Date() },
      session
    );
    await eventService.record({
      workspaceId: ctx.workspaceId,
      projectId: task.projectId,
      taskId: task._id,
      actorId: ctx.userId,
      action: "task.assigned",
      changes: { assigneeId }
    }, session);
    return toTaskDTO(updated);
  });
}
