import { projectRepository } from "./project.repository.js";
import { validateProject } from "./project.validation.js";
import { toObjectId, idString } from "../../utils/object-id.js";
import { assertRole } from "../../utils/permissions.js";
import { notFound } from "../../utils/app-error.js";

const toProject = ({ _id, workspaceId, createdBy, ...project }) => ({
  ...project,
  id: idString(_id),
  workspaceId: idString(workspaceId),
  createdBy: idString(createdBy)
});

export const projectService = {
  async create(ctx, data) {
    assertRole(ctx, "member");
    const input = validateProject(data);
    const now = new Date();
    const project = {
      ...input, workspaceId: ctx.workspaceId, createdBy: ctx.userId,
      status: "active", createdAt: now, updatedAt: now
    };
    const { insertedId } = await projectRepository.create({ ...project });
    return toProject({ _id: insertedId, ...project });
  },

  async list(ctx) {
    const projects = await projectRepository.findAll(ctx.workspaceId);
    return { workspace: ctx.workspace, projects: projects.map(toProject) };
  },

  async get(ctx, id) {
    const projectId = toObjectId(id, "Project");
    const project = await projectRepository.findById(ctx.workspaceId, projectId);
    if (!project) throw notFound("Project");
    return toProject(project);
  }
};
