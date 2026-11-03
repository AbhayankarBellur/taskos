import { taskService } from "./task.service.js";

export const taskMutateController = {
  create: async (req, res) => {
    const data = await taskService.create(req.ctx, req.params.projectId, req.body);
    res.status(201).json({ success: true, data });
  },

  createSubtask: async (req, res) => {
    const data = await taskService.createSubtask(req.ctx, req.params.taskId, req.body);
    res.status(201).json({ success: true, data });
  },

  update: async (req, res) => {
    const data = await taskService.update(req.ctx, req.params.taskId, req.body);
    res.json({ success: true, data });
  },

  archive: async (req, res) => {
    const data = await taskService.archive(req.ctx, req.params.taskId);
    res.json({ success: true, data });
  },

  transition: async (req, res) => {
    const data = await taskService.transition(req.ctx, req.params.taskId, req.body.status);
    res.json({ success: true, data });
  },

  assign: async (req, res) => {
    const data = await taskService.assign(req.ctx, req.params.taskId, req.body.assigneeId);
    res.json({ success: true, data });
  },

  block: async (req, res) => {
    const data = await taskService.block(req.ctx, req.params.taskId, req.body.reason);
    res.json({ success: true, data });
  },

  unblock: async (req, res) => {
    const data = await taskService.unblock(req.ctx, req.params.taskId);
    res.json({ success: true, data });
  }
};
