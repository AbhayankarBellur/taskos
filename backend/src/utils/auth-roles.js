export const ROLE_HIERARCHY = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4
};

export function assertRole(ctx, minRole) {
  if (!ctx || !ctx.userId) {
    const err = new Error("Authentication required");
    err.statusCode = 401;
    throw err;
  }
  const userLevel = ROLE_HIERARCHY[ctx.role] || 0;
  const reqLevel = ROLE_HIERARCHY[minRole] || 99;
  if (userLevel < reqLevel) {
    const err = new Error("Insufficient permissions");
    err.statusCode = 403;
    throw err;
  }
}
