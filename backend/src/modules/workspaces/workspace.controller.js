import { workspaceService } from "./workspace.service.js";

export const workspaceController = {
  create: async (req, res) => {
    const workspace = await workspaceService.create(req.auth.user._id, req.body);
    res.status(201).json({ success: true, data: workspace });
  },

  list: async (req, res) => {
    const workspaces = await workspaceService.listForUser(req.auth.user._id);
    res.json({ success: true, data: workspaces });
  },

  get: (req, res) => res.json({ success: true, data: req.ctx.workspace }),

  update: async (req, res) => {
    const workspace = await workspaceService.update(req.ctx, req.body);
    res.json({ success: true, data: workspace });
  }
};
