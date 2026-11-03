import { dependencyService } from "./dependency.service.js";

export const dependencyController = {
  add: async (req, res) => {
    const data = await dependencyService.add(
      req.ctx, req.params.taskId, req.body
    );
    res.status(201).json({ success: true, data });
  },

  list: async (req, res) => {
    const data = await dependencyService.list(req.ctx, req.params.taskId);
    res.json({ success: true, data });
  },

  remove: async (req, res) => {
    const data = await dependencyService.remove(
      req.ctx, req.params.taskId, req.params.dependencyId
    );
    res.json({ success: true, data });
  }
};
