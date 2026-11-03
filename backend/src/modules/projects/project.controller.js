import { projectService } from "./project.service.js";

export const projectController = {
  create: async (req, res) => {
    const project = await projectService.create(req.body);
    res.status(201).json({ success: true, data: project });
  },

  list: async (req, res) => {
    const projects = await projectService.list();
    res.json({ success: true, data: projects });
  },

  get: async (req, res) => {
    const project = await projectService.get(req.params.id);
    res.json({ success: true, data: project });
  }
};
