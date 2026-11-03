import { projectService } from "./project.service.js";

export const projectController = {
  create: async (req, res) => {
    const project = await projectService.create(req.ctx, req.body);
    res.status(201).json({ success: true, data: project });
  },

  list: async (req, res) => {
    const data = await projectService.list(req.ctx);
    res.json({ success: true, data });
  },

  get: async (req, res) => {
    const id = req.params.projectId || req.params.id;
    const project = await projectService.get(req.ctx, id);
    res.json({ success: true, data: project });
  }
};
