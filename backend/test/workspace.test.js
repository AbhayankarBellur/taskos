import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startServer, client, uniqueEmail } from "./helpers.js";

let ctx, owner, other, wsId, otherId, otherEmail;
before(async () => {
  ctx = await startServer();
  owner = client(ctx.base);
  other = client(ctx.base);
  const reg = await owner.request("POST", "/auth/register", { name: "Owner", email: uniqueEmail("owner"), password: "password123", workspaceName: "Development Team" });
  wsId = reg.body.data.workspace.id;
  otherEmail = uniqueEmail("other");
  otherId = (await other.request("POST", "/auth/register", { name: "Other", email: otherEmail, password: "password123" })).body.data.user.id;
});
after(() => ctx.stop());

test("list, create, get and update workspaces", async () => {
  const created = await owner.request("POST", "/workspaces", { name: "Second Team" });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.slug, "second-team");
  const list = await owner.request("GET", "/workspaces");
  assert.deepEqual(list.body.data.map((w) => w.name), ["Development Team", "Second Team"]);
  assert.equal((await owner.request("GET", `/workspaces/${wsId}`)).body.data.role, "owner");
  const renamed = await owner.request("PATCH", `/workspaces/${wsId}`, { name: "Dev Team" });
  assert.equal(renamed.body.data.name, "Dev Team");
});

test("membership and role rules", async () => {
  const path = `/workspaces/${wsId}/members`;
  assert.equal((await owner.request("POST", path, { email: "ghost@example.com" })).status, 404);
  assert.equal((await owner.request("POST", path, { email: otherEmail, role: "viewer" })).status, 201);
  assert.equal((await owner.request("POST", path, { email: otherEmail })).status, 409);
  assert.equal((await owner.request("GET", path)).body.data.length, 2);
  assert.equal((await owner.request("PATCH", `${path}/${otherId}`, { role: "superuser" })).status, 400);
  assert.equal((await owner.request("PATCH", `${path}/not-an-id`, { role: "member" })).status, 404);
  assert.equal((await other.request("PATCH", `/workspaces/${wsId}`, { name: "Hijack" })).status, 403);
  assert.equal((await other.request("PATCH", `${path}/${otherId}`, { role: "admin" })).status, 403);

  const ownerId = (await owner.request("GET", "/auth/me")).body.data.user.id;
  assert.equal((await owner.request("PATCH", `${path}/${ownerId}`, { role: "admin" })).status, 400);
  assert.equal((await owner.request("DELETE", `${path}/${ownerId}`)).status, 400);

  assert.equal((await owner.request("PATCH", `${path}/${otherId}`, { role: "admin" })).body.data.role, "admin");
  assert.equal((await other.request("DELETE", `${path}/${ownerId}`)).status, 403);
  assert.equal((await owner.request("DELETE", `${path}/${otherId}`)).status, 200);
  assert.equal((await other.request("GET", `/workspaces/${wsId}`)).status, 404);
});
