import type { Role } from "@/types/workspace";

export const ROLES: Role[] = ["owner", "admin", "member", "viewer"];
const RANK: Record<Role, number> = { viewer: 1, member: 2, admin: 3, owner: 4 };

export const hasRole = (role: Role | undefined, minimum: Role) =>
  !!role && RANK[role] >= RANK[minimum];
