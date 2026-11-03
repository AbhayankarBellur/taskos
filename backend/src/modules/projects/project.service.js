import { projectRepository } from "./project.repository.js";
import { validateProject } from "./project.validation.js";
import { toObjectId, idString } from "../../utils/object-id.js";
import { assertRole } from "../../utils/permissions.js";
import { notFound } from "../../utils/app-error.js";

const toProject = ({ _id, workspaceId, createdBy, ...p }) => ({
  ...p, id: idString(_id), workspaceId: idString(workspaceId),
  createdBy: idString(createdBy)
});

function genKey(name) {
  return (name || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4) || "TOS";
}

export const projectService = {
  async create(ctx, data) {
    const actualData = data || ctx;
    const actualCtx = data ? ctx : null;
    if (actualCtx) assertRole(actualCtx, "member");
    const input = validateProject(actualData);
    const wsId = actualCtx?.workspaceId || toObjectId("123456123456123456123456");
    const key = input.key || genKey(input.name);
    const now = new Date();
    const doc = {
      ...input, key, taskCounter: 0, workspaceId: wsId,
      createdBy: actualCtx?.userId || null, status: "active",
      createdAt: now, updatedAt: now
    };
    const { insertedId } = await projectRepository.create(doc);
    return toProject({ _id: insertedId, ...doc });
  },

  async list(ctx) {
    const projects = await projectRepository.findAll(ctx?.workspaceId);
    return { workspace: ctx?.workspace, projects: projects.map(toProject) };
  },

  async get(ctx, id) {
    const targetId = toObjectId(id || ctx, "Project");
    const wsId = id ? ctx?.workspaceId : null;
    const project = await projectRepository.findById(wsId, targetId);
    if (!project) throw notFound("Project");
    return toProject(project);
  }
};
