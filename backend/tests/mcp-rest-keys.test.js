import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB, getDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { sessionService } from "../src/modules/auth/session.service.js";
import { SESSION_COOKIE } from "../src/config/cookie.js";
import app from "../src/app.js";

let wsId, token, csrf;

before(async () => {
  setDB(await setupTestDB());
  const ctx = createTestCtx("owner"); wsId = ctx.workspaceId.toString();
  await getDB().collection("users").insertOne({ _id: ctx.userId, email: "rest@t.com" });
  await getDB().collection("workspace_members").insertOne({ workspaceId: ctx.workspaceId, userId: ctx.userId, role: "owner" });
  token = (await sessionService.create(ctx.userId)).token;
  csrf = (await sessionService.authenticate(token)).csrfToken;
});
after(async () => { await teardownTestDB(); });

function execReq({ method, url, body, noAuth, noCsrf }) {
  return new Promise((resolve) => {
    const s = { remoteAddress: "127.0.0.1", destroy() {} };
    const req = new http.IncomingMessage(s);
    req.socket = s; req.connection = s; req.method = method; req.url = url;
    req.headers = { host: "localhost:5000", origin: "http://localhost:3000", "content-type": "application/json" };
    if (!noAuth) req.headers.cookie = `${SESSION_COOKIE}=${token}`;
    if (!noCsrf && csrf) req.headers["x-csrf-token"] = csrf;
    if (body) { req.body = body; req._body = true; }
    const res = new http.ServerResponse(req);
    let buf = "";
    res.write = (c) => { buf += c; return true; };
    res.end = (c) => { if (c) buf += c; resolve({ status: res.statusCode, body: buf ? JSON.parse(buf) : {} }); };
    app.handle(req, res);
  });
}

test("REST /api/v1/mcp-keys enforces auth, CSRF, and manages keys", async () => {
  const b = { name: "K", workspaceId: wsId, scopes: ["projects:read"] };
  assert.equal((await execReq({ method: "POST", url: "/api/v1/mcp-keys", body: b, noAuth: true })).status, 401);
  assert.equal((await execReq({ method: "POST", url: "/api/v1/mcp-keys", body: b, noCsrf: true })).status, 403);
  const r3 = await execReq({ method: "POST", url: "/api/v1/mcp-keys", body: b });
  assert.equal(r3.status, 201);
  assert.equal((await execReq({ method: "GET", url: `/api/v1/mcp-keys?workspaceId=${wsId}` })).status, 200);
  assert.equal((await execReq({ method: "DELETE", url: `/api/v1/mcp-keys/${r3.body.data.id}` })).status, 200);
});