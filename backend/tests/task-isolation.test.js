import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { taskService } from "../src/modules/tasks/task.service.js";

let ws1, ws2, viewerCtx, memberCtx, adminCtx, prj1;

before(async () => {
  setDB(await setupTestDB());
  ws1 = createTestCtx("owner");
  ws2 = createTestCtx("owner");
  viewerCtx = { ...ws1, role: "viewer" };
  memberCtx = { ...ws1, role: "member" };
  adminCtx = { ...ws1, role: "admin" };
  prj1 = await projectService.create({ name: "P1", key: "P1" }, ws1);
});
after(async () => { await teardownTestDB(); });

test("workspace isolation prevents cross-workspace access", async () => {
  const task = await taskService.create(ws1, prj1.id, { title: "Secret" });
  await assert.rejects(() => taskService.get(ws2, task.id), { statusCode: 404 });
});

test("viewer cannot create or update tasks", async () => {
  await assert.rejects(() => taskService.create(viewerCtx, prj1.id, { title: "Blocked" }), { statusCode: 403 });
  const task = await taskService.create(memberCtx, prj1.id, { title: "Allowed" });
  await assert.rejects(() => taskService.update(viewerCtx, task.id, { title: "Blocked Edit" }), { statusCode: 403 });
});

test("member can update but only admin/owner can archive", async () => {
  const task = await taskService.create(memberCtx, prj1.id, { title: "Archive Role" });
  await taskService.update(memberCtx, task.id, { title: "Member Edit" });
  await assert.rejects(() => taskService.archive(memberCtx, task.id), { statusCode: 403 });
  const archived = await taskService.archive(adminCtx, task.id);
  assert.equal(archived.archived, true);
});
