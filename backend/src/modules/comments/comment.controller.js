import { commentService } from "./comment.service.js";

export const commentController = {
  create: async (req, res) => {
    const data = await commentService.create(
      req.ctx, req.params.taskId, req.body
    );
    res.status(201).json({ success: true, data });
  },

  list: async (req, res) => {
    const data = await commentService.list(req.ctx, req.params.taskId);
    res.json({ success: true, data });
  }
};
