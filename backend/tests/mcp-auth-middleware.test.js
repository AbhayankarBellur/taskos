import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB, getDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { mcpKeyService } from "../src/modules/mcp-keys/mcp-key.service.js";
import { mcpAuthMiddleware } from "../src/mcp/mcp.auth.js";

let ctx, wsId, activeKey, revokedKey, expKey;

const mockReq = (auth) => ({ headers: { authorization: auth } });
const mockRes = () => ({
  statusCode: 200, status(c) { this.statusCode = c; return this; },
  json(b) { this.body = b; return this; }
});

before(async () => {
  setDB(await setupTestDB());
  ctx = createTestCtx("owner"); wsId = ctx.workspaceId.toString();
  await getDB().collection("users").insertOne({ _id: ctx.userId, email: "u@t.com" });
  await getDB().collection("workspace_members").insertOne({ workspaceId: ctx.workspaceId, userId: ctx.userId, role: "member" });
  activeKey = (await mcpKeyService.createKey(ctx, { name: "A", workspaceId: wsId, scopes: ["projects:read"] })).apiKey;
  revokedKey = (await mcpKeyService.createKey(ctx, { name: "R", workspaceId: wsId, scopes: ["projects:read"] })).apiKey;
  await mcpKeyService.revokeKey(ctx, (await getDB().collection("mcp_api_keys").findOne({ name: "R" }))._id);
  expKey = (await mcpKeyService.createKey(ctx, { name: "E", workspaceId: wsId, scopes: ["projects:read"], expiresAt: new Date(Date.now() - 1000).toISOString() })).apiKey;
});
after(async () => { await teardownTestDB(); });

test("mcpAuthMiddleware rejects missing, malformed, revoked, and expired tokens with 401", async () => {
  let r = mockRes(); await mcpAuthMiddleware(mockReq(), r, () => {}); assert.equal(r.statusCode, 401);
  r = mockRes(); await mcpAuthMiddleware(mockReq("Basic xyz"), r, () => {}); assert.equal(r.statusCode, 401);
  r = mockRes(); await mcpAuthMiddleware(mockReq("Bearer invalid_key"), r, () => {}); assert.equal(r.statusCode, 401);
  r = mockRes(); await mcpAuthMiddleware(mockReq(`Bearer ${revokedKey}`), r, () => {}); assert.equal(r.statusCode, 401);
  r = mockRes(); await mcpAuthMiddleware(mockReq(`Bearer ${expKey}`), r, () => {}); assert.equal(r.statusCode, 401);
});

test("mcpAuthMiddleware authenticates valid key, dynamic role and removed membership", async () => {
  const req = mockReq(`Bearer ${activeKey}`); let nextCalled = false;
  await mcpAuthMiddleware(req, mockRes(), () => { nextCalled = true; });
  assert.equal(nextCalled, true); assert.equal(req.mcpContext.role, "member");

  await getDB().collection("workspace_members").deleteOne({ workspaceId: ctx.workspaceId, userId: ctx.userId });
  const r2 = mockRes(); await mcpAuthMiddleware(mockReq(`Bearer ${activeKey}`), r2, () => {});
  assert.equal(r2.statusCode, 403);
});
