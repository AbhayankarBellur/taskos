import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startServer, client, uniqueEmail } from "./helpers.js";

let ctx, alice, bob, aliceWs, bobWs, aliceProject;
const register = async (c, name) => (await c.request("POST", "/auth/register",
  { name, email: uniqueEmail(name.toLowerCase()), password: "password123" })).body.data;

before(async () => {
  ctx = await startServer();
  alice = client(ctx.base);
  bob = client(ctx.base);
  aliceWs = (await register(alice, "Alice")).workspace.id;
  bobWs = (await register(bob, "Bob")).workspace.id;
  const res = await alice.request("POST", `/workspaces/${aliceWs}/projects`,
    { name: "Secret Project", workspaceId: bobWs });
  aliceProject = res.body.data;
});
after(() => ctx.stop());

test("projects are scoped to the authorised workspace", async () => {
  assert.equal(aliceProject.workspaceId, aliceWs);
  const list = await alice.request("GET", `/workspaces/${aliceWs}/projects`);
  assert.equal(list.body.data.workspace.role, "owner");
  assert.equal(list.body.data.projects.length, 1);
  const one = await alice.request("GET", `/workspaces/${aliceWs}/projects/${aliceProject.id}`);
  assert.equal(one.body.data.name, "Secret Project");
});

test("cross-user and cross-workspace access is denied", async () => {
  assert.equal((await bob.request("GET", `/workspaces/${aliceWs}`)).status, 404);
  assert.equal((await bob.request("GET", `/workspaces/${aliceWs}/projects`)).status, 404);
  assert.equal((await bob.request("GET", `/workspaces/${bobWs}/projects/${aliceProject.id}`)).status, 404);
  assert.equal((await bob.request("GET", "/workspaces/123/projects")).status, 404);
  assert.equal((await alice.request("GET", `/workspaces/${aliceWs}/projects/zzz`)).status, 404);
  assert.equal((await client(ctx.base).request("GET", `/workspaces/${aliceWs}/projects`)).status, 401);
  assert.equal((await alice.request("GET", "/projects")).status, 404);
});

test("viewer can read but cannot mutate projects", async () => {
  const bobEmail = (await bob.request("GET", "/auth/me")).body.data.user.email;
  await alice.request("POST", `/workspaces/${aliceWs}/members`, { email: bobEmail, role: "viewer" });
  const path = `/workspaces/${aliceWs}/projects`;
  assert.equal((await bob.request("GET", path)).status, 200);
  assert.equal((await bob.request("POST", path, { name: "Viewer project" })).status, 403);
  const bobId = (await bob.request("GET", "/auth/me")).body.data.user.id;
  await alice.request("PATCH", `/workspaces/${aliceWs}/members/${bobId}`, { role: "member" });
  assert.equal((await bob.request("POST", path, { name: "Member project" })).status, 201);
});
