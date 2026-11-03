import { taskRepository } from "./task.repository.js";
import { projectRepository } from "../projects/project.repository.js";
import { eventService } from "../events/event.service.js";
import { createTaskSchema } from "./task.validation.js";
import { toTaskDTO } from "./task.mapper.js";
import { assertRole } from "../../utils/auth-roles.js";
import { toObjectId } from "../../utils/object-id.js";
import { withTransaction } from "../../utils/transaction.js";

export async function createTask(ctx, projectId, input) {
  assertRole(ctx, "member");
  const data = createTaskSchema.parse(input);
  const pId = toObjectId(projectId);
  return withTransaction(async (session) => {
    const prj = await projectRepository.incrementTaskCounter(
      ctx.workspaceId, pId, session
    );
    if (!prj) throw Object.assign(new Error("Project not found"), { statusCode: 404 });
    const key = `${prj.key}-${prj.taskCounter}`;
    const doc = {
      workspaceId: ctx.workspaceId, projectId: pId, key,
      title: data.title, description: data.description,
      status: data.status, priority: data.priority,
      assigneeId: data.assigneeId ? toObjectId(data.assigneeId) : null,
      reporterId: ctx.userId,
      parentTaskId: data.parentTaskId ? toObjectId(data.parentTaskId) : null,
      blocked: false, blockerReason: null, dueDate: data.dueDate || null,
      labels: data.labels, archived: false,
      createdAt: new Date(), updatedAt: new Date(), completedAt: null
    };
    const { insertedId } = await taskRepository.create(doc, session);
    const created = { ...doc, _id: insertedId };
    await eventService.record({
      workspaceId: ctx.workspaceId, projectId: pId, taskId: insertedId,
      actorId: ctx.userId, action: "task.created", changes: { key, title: doc.title }
    }, session);
    return toTaskDTO(created);
  });
}

export async function createSubtask(ctx, parentTaskId, input) {
  assertRole(ctx, "member");
  const parent = await taskRepository.findById(ctx.workspaceId, parentTaskId);
  if (!parent) throw Object.assign(new Error("Parent task not found"), { statusCode: 404 });
  return createTask(ctx, parent.projectId, { ...input, parentTaskId });
}
