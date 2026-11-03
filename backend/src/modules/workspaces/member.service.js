import { memberRepository } from "./member.repository.js";
import { addMemberSchema, roleSchema } from "./workspace.validation.js";
import { toMember } from "./workspace.mapper.js";
import { assertCanAssign, findTarget, assertNotLastOwner } from "./member.rules.js";
import { userService } from "../users/user.service.js";
import { assertRole } from "../../utils/permissions.js";
import { conflict, isDuplicateKey, notFound } from "../../utils/app-error.js";

export const memberService = {
  async list(ctx) {
    const members = await memberRepository.listByWorkspace(ctx.workspaceId);
    const users = await userService.findManyByIds(members.map((m) => m.userId));
    const byId = new Map(users.map((u) => [u._id.toString(), u]));
    return members.map((m) => toMember(m, byId.get(m.userId.toString())));
  },

  async add(ctx, input) {
    assertRole(ctx, "admin");
    const { email, role } = addMemberSchema.parse(input);
    assertCanAssign(ctx, role);
    const user = await userService.findByEmail(email);
    if (!user) throw notFound("User");
    const member = { workspaceId: ctx.workspaceId, userId: user._id, role, joinedAt: new Date() };
    await memberRepository.create({ ...member }).catch((error) => {
      throw isDuplicateKey(error) ? conflict("User is already a member") : error;
    });
    return toMember(member, user);
  },

  async changeRole(ctx, userId, input) {
    assertRole(ctx, "admin");
    const { role } = roleSchema.parse(input);
    const target = await findTarget(ctx, userId);
    assertCanAssign(ctx, target.role, role);
    if (role !== "owner") await assertNotLastOwner(ctx.workspaceId, target);
    await memberRepository.updateRole(ctx.workspaceId, target.userId, role);
    const user = await userService.findById(target.userId);
    return toMember({ ...target, role }, user);
  },

  async remove(ctx, userId) {
    assertRole(ctx, "admin");
    const target = await findTarget(ctx, userId);
    assertCanAssign(ctx, target.role);
    await assertNotLastOwner(ctx.workspaceId, target);
    await memberRepository.remove(ctx.workspaceId, target.userId);
  }
};
