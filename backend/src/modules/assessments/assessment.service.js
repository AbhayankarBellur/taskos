import { assessmentRepository } from "./assessment.repository.js";
import { taskRepository } from "../tasks/task.repository.js";
import { eventService } from "../events/event.service.js";
import { createAssessmentSchema } from "./assessment.validation.js";
import { assertNotArchived } from "../tasks/task.rules.js";
import { assertRole } from "../../utils/auth-roles.js";
import { toObjectId } from "../../utils/object-id.js";
import { withTransaction } from "../../utils/transaction.js";

const toDTO = (d) => d && ({
  ...d, id: d._id.toString(), workspaceId: d.workspaceId.toString(),
  projectId: d.projectId.toString(), taskId: d.taskId.toString(),
  assessedBy: d.assessedBy.toString()
});

export const assessmentService = {
  async create(ctx, taskId, input) {
    assertRole(ctx, "member");
    const data = createAssessmentSchema.parse(input);
    const task = await taskRepository.findById(ctx.workspaceId, taskId);
    if (!task) throw Object.assign(new Error("Task not found"), { statusCode: 404 });
    assertNotArchived(task);

    return withTransaction(async (session) => {
      const doc = {
        workspaceId: ctx.workspaceId, projectId: task.projectId,
        taskId: toObjectId(taskId), ...data,
        assessedBy: ctx.userId, createdAt: new Date()
      };
      const { insertedId } = await assessmentRepository.create(doc, session);
      await eventService.record({
        workspaceId: ctx.workspaceId, projectId: task.projectId, taskId: task._id,
        actorId: ctx.userId, action: "task.assessed",
        changes: { complexity: data.complexity, storyPoints: data.storyPoints }
      }, session);
      return toDTO({ ...doc, _id: insertedId });
    });
  },

  async list(ctx, taskId) {
    assertRole(ctx, "viewer");
    const docs = await assessmentRepository.findByTaskId(ctx.workspaceId, taskId);
    return docs.map(toDTO);
  },

  async latest(ctx, taskId) {
    assertRole(ctx, "viewer");
    const doc = await assessmentRepository.findLatestByTaskId(ctx.workspaceId, taskId);
    return toDTO(doc);
  }
};
