import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { taskService } from "../src/modules/tasks/task.service.js";
import { ObjectId } from "mongodb";

let ctx, project;

before(async () => {
  setDB(await setupTestDB());
  ctx = createTestCtx("member");
  project = await projectService.create({ name: "Lifecycle", key: "LC" }, ctx);
});

after(async () => { await teardownTestDB(); });

test("task assignment and invalid assignee check", async () => {
  const task = await taskService.create(ctx, project.id, { title: "Assign Me" });
  const user = new ObjectId().toString();
  const assigned = await taskService.assign(ctx, task.id, user);
  assert.equal(assigned.assigneeId, user);
  await assert.rejects(() => taskService.assign(ctx, task.id, "invalid-id"));
});

test("status transition sets completedAt, blocking prevents done", async () => {
  const task = await taskService.create(ctx, project.id, { title: "Status Test" });
  await taskService.block(ctx, task.id, "Waiting on API");
  await assert.rejects(
    () => taskService.transition(ctx, task.id, "done"),
    { statusCode: 400 }
  );

  await taskService.unblock(ctx, task.id);
  const done = await taskService.transition(ctx, task.id, "done");
  assert.equal(done.status, "done");
  assert.ok(done.completedAt);

  const reopened = await taskService.transition(ctx, task.id, "in_progress");
  assert.equal(reopened.completedAt, null);
});

test("subtask creation links to parentTaskId in same project", async () => {
  const parent = await taskService.create(ctx, project.id, { title: "Parent" });
  const sub = await taskService.createSubtask(ctx, parent.id, { title: "Subtask" });
  assert.equal(sub.parentTaskId, parent.id);
  assert.equal(sub.projectId, project.id);
});
