import { dependencyRepository } from "./dependency.repository.js";
import { taskRepository } from "../tasks/task.repository.js";
import { eventService } from "../events/event.service.js";
import { addDependencySchema } from "./dependency.validation.js";
import { wouldCreateCycle } from "./dependency.cycle.js";
import { assertNotArchived } from "../tasks/task.rules.js";
import { assertRole } from "../../utils/auth-roles.js";
import { toObjectId } from "../../utils/object-id.js";
import { withTransaction } from "../../utils/transaction.js";

export async function addDependency(ctx, taskId, input) {
  assertRole(ctx, "member");
  const { dependsOnTaskId } = addDependencySchema.parse(input);
  const tId = toObjectId(taskId);
  const dId = toObjectId(dependsOnTaskId);
  if (tId.equals(dId)) throw Object.assign(new Error("Self-dependency not allowed"), { statusCode: 400 });

  const [task, depTask] = await Promise.all([
    taskRepository.findById(ctx.workspaceId, tId),
    taskRepository.findById(ctx.workspaceId, dId)
  ]);
  if (!task || !depTask) throw Object.assign(new Error("Task not found"), { statusCode: 404 });
  if (!task.projectId.equals(depTask.projectId)) {
    throw Object.assign(new Error("Cross-project dependencies not allowed"), { statusCode: 400 });
  }
  assertNotArchived(task);
  assertNotArchived(depTask);

  if (await dependencyRepository.findOne(ctx.workspaceId, tId, dId)) {
    throw Object.assign(new Error("Dependency already exists"), { statusCode: 400 });
  }
  if (await wouldCreateCycle(ctx.workspaceId, tId, dId)) {
    throw Object.assign(new Error("Circular dependency detected"), { statusCode: 400 });
  }

  return withTransaction(async (session) => {
    const doc = {
      workspaceId: ctx.workspaceId, projectId: task.projectId,
      taskId: tId, dependsOnTaskId: dId, createdAt: new Date()
    };
    const { insertedId } = await dependencyRepository.create(doc, session);
    await eventService.record({
      workspaceId: ctx.workspaceId, projectId: task.projectId, taskId: tId,
      actorId: ctx.userId, action: "task.dependency_added",
      changes: { dependsOnTaskId: dId.toString(), dependsOnKey: depTask.key }
    }, session);
    return { ...doc, id: insertedId.toString() };
  });
}
