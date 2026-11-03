import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startServer, client, uniqueEmail } from "./helpers.js";

let ctx;
before(async () => { ctx = await startServer(); });
after(() => ctx.stop());

test("register creates user, default workspace and secure session", async () => {
  const alex = client(ctx.base);
  const email = uniqueEmail("alex");
  const res = await alex.request("POST", "/auth/register", { name: "Alex", email, password: "password123" });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.user.email, email);
  assert.equal(res.body.data.workspace.role, "owner");
  assert.equal(JSON.stringify(res.body).includes("passwordHash"), false);
  assert.match(res.setCookie, /taskos_session=.*HttpOnly/i);
  assert.equal(res.body.data.token, undefined);

  const dup = await client(ctx.base).request("POST", "/auth/register", { name: "A", email, password: "password123" });
  assert.equal(dup.status, 409);
  const bad = await client(ctx.base).request("POST", "/auth/register", { name: "A", email: "nope", password: "x" });
  assert.equal(bad.status, 400);

  const me = await alex.request("GET", "/auth/me");
  assert.equal(me.status, 200);
  assert.equal(me.body.data.user.email, email);
});

test("login, csrf, origin, logout and revoked session", async () => {
  const email = uniqueEmail("sam");
  await client(ctx.base).request("POST", "/auth/register", { name: "Sam", email, password: "password123" });
  const sam = client(ctx.base);
  assert.equal((await sam.request("POST", "/auth/login", { email, password: "wrong-pass" })).status, 401);
  assert.equal((await sam.request("POST", "/auth/login", { email: "SAM" + email.slice(3), password: "password123" })).status, 200);

  const csrf = sam.state.csrf;
  sam.state.csrf = null;
  assert.equal((await sam.request("POST", "/workspaces", { name: "No CSRF" })).status, 403);
  sam.state.csrf = csrf;
  const evil = await sam.request("POST", "/workspaces", { name: "Evil" }, { Origin: "https://evil.example" });
  assert.equal(evil.status, 403);

  const stolenCookie = sam.state.cookie;
  assert.equal((await sam.request("POST", "/auth/logout")).status, 200);
  sam.state.cookie = stolenCookie;
  assert.equal((await sam.request("GET", "/auth/me")).status, 401);
});
