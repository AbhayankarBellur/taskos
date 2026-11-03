import { memberRepository } from "./member.repository.js";
import { badRequest, forbidden, notFound } from "../../utils/app-error.js";
import { toObjectId } from "../../utils/object-id.js";

export function assertCanAssign(ctx, ...roles) {
  if (roles.includes("owner") && ctx.role !== "owner") {
    throw forbidden("Only owners can manage the owner role");
  }
}

export async function findTarget(ctx, userId) {
  const target = await memberRepository.find(ctx.workspaceId, toObjectId(userId, "Member"));
  if (!target) throw notFound("Member");
  return target;
}

export async function assertNotLastOwner(workspaceId, target) {
  if (target.role !== "owner") return;
  if ((await memberRepository.countOwners(workspaceId)) <= 1) {
    throw badRequest("A workspace must keep at least one owner");
  }
}
