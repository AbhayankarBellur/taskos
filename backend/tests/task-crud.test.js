import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { taskService } from "../src/modules/tasks/task.service.js";

let ctx, project;

before(async () => {
  setDB(await setupTestDB());
  ctx = createTestCtx("owner");
  project = await projectService.create({ name: "Task Engine", key: "TOS" }, ctx);
});
after(async () => { await teardownTestDB(); });

test("creates task with atomic key and retrieves it", async () => {
  const task = await taskService.create(ctx, project.id, { title: "First Task", description: "Desc", priority: "high" });
  assert.equal(task.key, "TOS-1");
  assert.equal(task.status, "backlog");
  const fetched = await taskService.get(ctx, task.id);
  assert.equal(fetched.title, "First Task");
});

test("concurrent task creation produces unique sequential keys", async () => {
  const results = await Promise.all([
    taskService.create(ctx, project.id, { title: "Concurrent A" }),
    taskService.create(ctx, project.id, { title: "Concurrent B" }),
    taskService.create(ctx, project.id, { title: "Concurrent C" })
  ]);
  const keys = results.map((t) => t.key);
  assert.equal(new Set(keys).size, 3);
});

test("updates task and archives it; archived task is read-only", async () => {
  const task = await taskService.create(ctx, project.id, { title: "To Archive" });
  await taskService.update(ctx, task.id, { title: "Updated Title" });
  const archived = await taskService.archive(ctx, task.id);
  assert.equal(archived.archived, true);
  await assert.rejects(() => taskService.update(ctx, task.id, { title: "Fail Edit" }), { statusCode: 409 });
});
