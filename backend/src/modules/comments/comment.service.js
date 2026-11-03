import { commentRepository } from "./comment.repository.js";
import { taskRepository } from "../tasks/task.repository.js";
import { eventService } from "../events/event.service.js";
import { createCommentSchema } from "./comment.validation.js";
import { assertNotArchived } from "../tasks/task.rules.js";
import { assertRole } from "../../utils/auth-roles.js";
import { toObjectId } from "../../utils/object-id.js";
import { withTransaction } from "../../utils/transaction.js";

const toDTO = (c) => ({
  ...c, id: c._id.toString(), workspaceId: c.workspaceId.toString(),
  projectId: c.projectId.toString(), taskId: c.taskId.toString(),
  authorId: c.authorId.toString()
});

export const commentService = {
  async create(ctx, taskId, input) {
    assertRole(ctx, "member");
    const { content } = createCommentSchema.parse(input);
    const task = await taskRepository.findById(ctx.workspaceId, taskId);
    if (!task) throw Object.assign(new Error("Task not found"), { statusCode: 404 });
    assertNotArchived(task);

    return withTransaction(async (session) => {
      const doc = {
        workspaceId: ctx.workspaceId, projectId: task.projectId,
        taskId: toObjectId(taskId), authorId: ctx.userId, content,
        createdAt: new Date(), updatedAt: new Date()
      };
      const { insertedId } = await commentRepository.create(doc, session);
      await eventService.record({
        workspaceId: ctx.workspaceId, projectId: task.projectId, taskId: task._id,
        actorId: ctx.userId, action: "task.commented", changes: { length: content.length }
      }, session);
      return toDTO({ ...doc, _id: insertedId });
    });
  },

  async list(ctx, taskId) {
    assertRole(ctx, "viewer");
    const docs = await commentRepository.findByTaskId(ctx.workspaceId, taskId);
    return docs.map(toDTO);
  }
};
