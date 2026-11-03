import { assessmentService } from "./assessment.service.js";

export const assessmentController = {
  create: async (req, res) => {
    const data = await assessmentService.create(
      req.ctx, req.params.taskId, req.body
    );
    res.status(201).json({ success: true, data });
  },

  list: async (req, res) => {
    const data = await assessmentService.list(req.ctx, req.params.taskId);
    res.json({ success: true, data });
  },

  latest: async (req, res) => {
    const data = await assessmentService.latest(req.ctx, req.params.taskId);
    res.json({ success: true, data });
  }
};
