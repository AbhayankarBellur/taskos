import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB, getDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { mcpKeyService } from "../src/modules/mcp-keys/mcp-key.service.js";

let ctx, wsId;

before(async () => {
  setDB(await setupTestDB());
  ctx = createTestCtx("owner");
  wsId = ctx.workspaceId.toString();
  await getDB().collection("workspace_members").insertOne({
    workspaceId: ctx.workspaceId, userId: ctx.userId, role: "owner"
  });
});
after(async () => { await teardownTestDB(); });

test("API key creation returns secret once and persists only hash", async () => {
  const res = await mcpKeyService.createKey(ctx, {
    name: "Cursor Key", workspaceId: wsId, scopes: ["projects:read", "tasks:read"]
  });
  assert.ok(res.apiKey.startsWith("taskos_live_"));
  assert.equal(res.apiKey.length, 76); // taskos_live_ (12) + 64 hex

  const inDb = await getDB().collection("mcp_api_keys").findOne({ _id: res.id });
  assert.equal(inDb.apiKey, undefined);
  assert.ok(inDb.keyHash && inDb.keyHash.length === 64);
});

test("listKeys never exposes secret or keyHash", async () => {
  const keys = await mcpKeyService.listKeys(ctx, wsId);
  assert.ok(keys.length >= 1);
  assert.equal(keys[0].apiKey, undefined);
  assert.equal(keys[0].keyHash, undefined);
  assert.ok(keys[0].keyPrefix.startsWith("taskos_live_"));
});

test("revokeKey revokes immediately", async () => {
  const res = await mcpKeyService.createKey(ctx, {
    name: "Temp Key", workspaceId: wsId, scopes: ["reports:read"]
  });
  await mcpKeyService.revokeKey(ctx, res.id);
  const inDb = await getDB().collection("mcp_api_keys").findOne({ _id: res.id });
  assert.ok(inDb.revokedAt instanceof Date);
});
