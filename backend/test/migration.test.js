import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { startServer, client, uniqueEmail, getDB } from "./helpers.js";

const run = promisify(execFile);
const migrate = (...args) => run(process.execPath,
  ["scripts/migrate-legacy-projects.js", ...args], { env: process.env })
  .catch((error) => error);

let ctx, owner, email, wsId;
before(async () => {
  ctx = await startServer();
  owner = client(ctx.base);
  email = uniqueEmail("legacy");
  wsId = (await owner.request("POST", "/auth/register", { name: "Legacy", email, password: "password123" })).body.data.workspace.id;
  await getDB().collection("projects").insertMany([
    { name: "Legacy A", description: "", color: "#6366F1", status: "active", createdAt: new Date() },
    { name: "Legacy B", description: "", color: "#6366F1", status: "active", createdAt: new Date() }
  ]);
});
after(() => ctx.stop());

test("migration requires an explicit registered owner", async () => {
  assert.equal((await migrate()).code, 1);
  assert.equal((await migrate("--owner-email", "nobody@example.com", "--apply")).code, 1);
});

test("dry run changes nothing; apply is idempotent", async () => {
  const dry = await migrate("--owner-email", email);
  assert.match(dry.stdout, /Legacy projects without workspaceId: 2/);
  assert.equal((await owner.request("GET", `/workspaces/${wsId}/projects`)).body.data.projects.length, 0);

  const applied = await migrate("--owner-email", email, "--workspace", wsId, "--apply");
  assert.match(applied.stdout, /Migrated 2 project/);
  const again = await migrate("--owner-email", email, "--apply");
  assert.match(again.stdout, /Migrated 0 project/);

  const list = await owner.request("GET", `/workspaces/${wsId}/projects`);
  assert.deepEqual(list.body.data.projects.map((p) => p.name).sort(), ["Legacy A", "Legacy B"]);
});
