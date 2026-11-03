import test from "node:test";
import assert from "node:assert/strict";
import { mcpSecurityMiddleware } from "../src/mcp/mcp.security.js";

const mock = (headers = {}) => {
  const req = { headers, method: "POST", path: "/mcp" };
  const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
  return { req, res };
};

test("MCP endpoint disabled by default", () => {
  delete process.env.MCP_ENABLED;
  const { req, res } = mock({ host: "localhost" });
  let next = false;
  mcpSecurityMiddleware(req, res, () => { next = true; });
  assert.equal(res.statusCode, 503);
  assert.equal(next, false);
});

test("production cannot activate dev mode", () => {
  process.env.MCP_ENABLED = "true"; process.env.MCP_DEV_MODE = "true"; process.env.NODE_ENV = "production";
  const { req, res } = mock({ host: "localhost" });
  let next = false;
  mcpSecurityMiddleware(req, res, () => { next = true; });
  assert.equal(res.statusCode, 401);
  assert.equal(next, false);
  process.env.NODE_ENV = "test";
});

test("invalid Host or Origin header is rejected with 403", () => {
  process.env.MCP_ENABLED = "true"; process.env.MCP_DEV_MODE = "true";
  const res1 = mock({ host: "evil.com" }).res;
  mcpSecurityMiddleware(mock({ host: "evil.com" }).req, res1, () => {});
  assert.equal(res1.statusCode, 403);
  const res2 = mock({ host: "localhost:5000", origin: "http://evil.com" }).res;
  mcpSecurityMiddleware(mock({ host: "localhost:5000", origin: "http://evil.com" }).req, res2, () => {});
  assert.equal(res2.statusCode, 403);
});

test("missing Origin from native client is accepted", () => {
  process.env.MCP_ENABLED = "true"; process.env.MCP_DEV_MODE = "true";
  const { req, res } = mock({ host: "localhost:5000" });
  let next = false;
  mcpSecurityMiddleware(req, res, () => { next = true; });
  assert.equal(next, true);
  delete process.env.MCP_ENABLED; delete process.env.MCP_DEV_MODE;
});
