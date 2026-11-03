import { projectRepository } from "./project.repository.js";
import { validateProject } from "./project.validation.js";

export const projectService = {
  async create(data) {
    const input = validateProject(data);
    const project = {
      ...input,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { insertedId } = await projectRepository.create({ ...project });
    return { ...project, id: insertedId.toString() };
  },

  async list() {
    const projects = await projectRepository.findAll();
    return projects.map(({ _id, ...p }) => ({
      ...p, id: _id.toString()
    }));
  },

  async get(id) {
    const project = await projectRepository.findById(id);
    if (!project) throw Object.assign(
      new Error("Project not found"), { statusCode: 404 }
    );
    const { _id, ...data } = project;
    return { ...data, id: _id.toString() };
  }
};
