import { taskService } from "./task.service.js";

export const taskQueryController = {
  get: async (req, res) => {
    const task = await taskService.get(req.ctx, req.params.taskId);
    res.json({ success: true, data: task });
  },

  list: async (req, res) => {
    const result = await taskService.list(
      req.ctx, req.params.projectId, req.query
    );
    res.json({ success: true, ...result });
  }
};
