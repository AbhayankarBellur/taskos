import { workspaceRepository } from "./workspace.repository.js";
import { memberRepository } from "./member.repository.js";
import { workspaceSchema } from "./workspace.validation.js";
import { toWorkspace } from "./workspace.mapper.js";
import { toObjectId } from "../../utils/object-id.js";
import { assertRole } from "../../utils/permissions.js";
import { notFound } from "../../utils/app-error.js";
import { slugify, withSuffix } from "../../utils/slug.js";

async function uniqueSlug(name) {
  const base = slugify(name);
  return (await workspaceRepository.slugExists(base)) ? withSuffix(base) : base;
}

export const workspaceService = {
  async createForOwner(ownerId, name) {
    const input = workspaceSchema.parse({ name });
    const now = new Date();
    const doc = { name: input.name, slug: await uniqueSlug(input.name), ownerId, createdAt: now, updatedAt: now };
    const { insertedId } = await workspaceRepository.create({ ...doc });
    await memberRepository.create({ workspaceId: insertedId, userId: ownerId, role: "owner", joinedAt: now });
    return toWorkspace({ _id: insertedId, ...doc }, "owner");
  },

  create: (userId, input) => workspaceService.createForOwner(userId, input?.name),

  async listForUser(userId) {
    const memberships = await memberRepository.listByUser(userId);
    const roles = new Map(memberships.map((m) => [m.workspaceId.toString(), m.role]));
    const workspaces = await workspaceRepository.findByIds(memberships.map((m) => m.workspaceId));
    return workspaces.map((w) => toWorkspace(w, roles.get(w._id.toString())));
  },

  async resolveContext(userId, workspaceId) {
    const _id = toObjectId(workspaceId, "Workspace");
    const [membership, workspace] = await Promise.all([
      memberRepository.find(_id, userId), workspaceRepository.findById(_id)
    ]);
    if (!membership || !workspace) throw notFound("Workspace");
    return { userId, workspaceId: _id, role: membership.role, workspace: toWorkspace(workspace, membership.role) };
  },

  async update(ctx, input) {
    assertRole(ctx, "admin");
    const { name } = workspaceSchema.parse(input);
    const updated = await workspaceRepository.update(ctx.workspaceId, { name, updatedAt: new Date() });
    return toWorkspace(updated, ctx.role);
  }
};
