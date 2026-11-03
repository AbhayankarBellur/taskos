import { eventRepository } from "./event.repository.js";
import { assertRole } from "../../utils/auth-roles.js";
import { toObjectId } from "../../utils/object-id.js";

export const eventService = {
  async record(data, session) {
    const doc = {
      workspaceId: toObjectId(data.workspaceId),
      projectId: toObjectId(data.projectId),
      taskId: toObjectId(data.taskId),
      actorId: toObjectId(data.actorId),
      actorType: data.actorType || "user",
      action: data.action,
      changes: data.changes || {},
      createdAt: new Date()
    };
    return eventRepository.create(doc, session);
  },

  async listByTaskId(ctx, taskId) {
    assertRole(ctx, "viewer");
    const events = await eventRepository.findByTaskId(
      ctx.workspaceId, taskId
    );
    return events.map(({ _id, ...e }) => ({
      ...e,
      id: _id.toString(),
      workspaceId: e.workspaceId.toString(),
      projectId: e.projectId.toString(),
      taskId: e.taskId.toString(),
      actorId: e.actorId.toString()
    }));
  }
};
