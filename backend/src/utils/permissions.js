import { forbidden } from "./app-error.js";

export const ROLES = ["owner", "admin", "member", "viewer"];
const RANK = { viewer: 1, member: 2, admin: 3, owner: 4 };

export const hasRole = (role, minimum) =>
  (RANK[role] ?? 0) >= RANK[minimum];

export function assertRole(ctx, minimum) {
  if (!hasRole(ctx.role, minimum)) {
    throw forbidden(`This action requires the ${minimum} role`);
  }
}
