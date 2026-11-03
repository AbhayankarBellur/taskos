import { createTask, createSubtask } from "./task-create.service.js";
import { getTask, listTasks } from "./task-query.service.js";
import { transitionTask } from "./task-transition.service.js";
import { assignTask } from "./task-assign.service.js";
import { blockTask, unblockTask } from "./task-block.service.js";
import { updateTask, archiveTask } from "./task-mutate.service.js";

export const taskService = {
  create: createTask,
  createSubtask,
  get: getTask,
  list: listTasks,
  update: updateTask,
  assign: (ctx, id, aId) => assignTask(ctx, id, { assigneeId: aId }),
  transition: (ctx, id, st) => transitionTask(ctx, id, { status: st }),
  block: (ctx, id, reason) => blockTask(ctx, id, { reason }),
  unblock: unblockTask,
  archive: archiveTask
};
