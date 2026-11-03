import { taskRepository } from "./task.repository.js";
import { dependencyRepository } from "../dependencies/dependency.repository.js";
import { eventService } from "../events/event.service.js";
import { statusSchema } from "./task.validation.js";
import { assertNotArchived, validateStatusTransition, computeCompletedAt } from "./task.rules.js";
import { toTaskDTO } from "./task.mapper.js";
import { assertRole } from "../../utils/auth-roles.js";
import { withTransaction } from "../../utils/transaction.js";

export async function transitionTask(ctx, taskId, input) {
  assertRole(ctx, "member");
  const { status } = statusSchema.parse(input);
  const task = await taskRepository.findById(ctx.workspaceId, taskId);
  if (!task) throw Object.assign(new Error("Task not found"), { statusCode: 404 });
  assertNotArchived(task);

  if (status === "done") {
    const deps = await dependencyRepository.findByTaskId(ctx.workspaceId, taskId);
    const unfin = [];
    for (const d of deps) {
      const depTask = await taskRepository.findById(ctx.workspaceId, d.dependsOnTaskId);
      if (depTask && depTask.status !== "done") unfin.push(depTask.key);
    }
    validateStatusTransition(task, status, unfin);
  }

  const completedAt = computeCompletedAt(task.status, status);
  const updates = { status, updatedAt: new Date() };
  if (completedAt !== undefined) updates.completedAt = completedAt;

  return withTransaction(async (session) => {
    const updated = await taskRepository.update(ctx.workspaceId, taskId, updates, session);
    await eventService.record({
      workspaceId: ctx.workspaceId, projectId: task.projectId, taskId: task._id,
      actorId: ctx.userId, action: "task.status_changed",
      changes: { from: task.status, to: status }
    }, session);
    return toTaskDTO(updated);
  });
}
