import { dependencyRepository } from "./dependency.repository.js";
import { taskRepository } from "../tasks/task.repository.js";
import { eventService } from "../events/event.service.js";
import { assertNotArchived } from "../tasks/task.rules.js";
import { assertRole } from "../../utils/auth-roles.js";
import { toObjectId } from "../../utils/object-id.js";
import { withTransaction } from "../../utils/transaction.js";

export async function listDependencies(ctx, taskId) {
  assertRole(ctx, "viewer");
  const tId = toObjectId(taskId);
  const [outgoing, incoming] = await Promise.all([
    dependencyRepository.findByTaskId(ctx.workspaceId, tId),
    dependencyRepository.findByDependsOnTaskId(ctx.workspaceId, tId)
  ]);
  return {
    dependencies: outgoing.map((d) => ({ ...d, id: d._id.toString() })),
    dependents: incoming.map((d) => ({ ...d, id: d._id.toString() }))
  };
}

export async function removeDependency(ctx, taskId, depId) {
  assertRole(ctx, "member");
  const dep = await dependencyRepository.findById(ctx.workspaceId, depId);
  if (!dep) throw Object.assign(new Error("Dependency not found"), { statusCode: 404 });
  const task = await taskRepository.findById(ctx.workspaceId, dep.taskId);
  if (task) assertNotArchived(task);

  return withTransaction(async (session) => {
    await dependencyRepository.delete(ctx.workspaceId, depId, session);
    if (task) {
      await eventService.record({
        workspaceId: ctx.workspaceId, projectId: dep.projectId, taskId: dep.taskId,
        actorId: ctx.userId, action: "task.dependency_removed",
        changes: { dependencyId: depId }
      }, session);
    }
    return { success: true };
  });
}
