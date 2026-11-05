export function assertMcpScope(ctx, requiredScope) {
  if (!requiredScope) return;
  if (Array.isArray(ctx?.scopes) && !ctx.scopes.includes(requiredScope)) {
    const err = new Error(`Forbidden: missing required scope '${requiredScope}'`);
    err.statusCode = 403;
    throw err;
  }
}

export function assertMcpScopes(ctx, scopes = []) {
  for (const s of scopes) {
    assertMcpScope(ctx, s);
  }
}
