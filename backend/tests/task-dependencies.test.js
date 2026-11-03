import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { taskService } from "../src/modules/tasks/task.service.js";
import { dependencyService } from "../src/modules/dependencies/dependency.service.js";

let ctx, project, tA, tB, tC;

before(async () => {
  setDB(await setupTestDB());
  ctx = createTestCtx("member");
  project = await projectService.create({ name: "Deps", key: "DEP" }, ctx);
  tA = await taskService.create(ctx, project.id, { title: "Task A" });
  tB = await taskService.create(ctx, project.id, { title: "Task B" });
  tC = await taskService.create(ctx, project.id, { title: "Task C" });
});
after(async () => { await teardownTestDB(); });

test("dependency creation, self-dependency and cycle detection", async () => {
  await assert.rejects(() => dependencyService.add(ctx, tA.id, { dependsOnTaskId: tA.id }), { statusCode: 400 });
  await dependencyService.add(ctx, tB.id, { dependsOnTaskId: tA.id });
  await dependencyService.add(ctx, tC.id, { dependsOnTaskId: tB.id });
  // A depends on C should be rejected as cycle!
  await assert.rejects(() => dependencyService.add(ctx, tA.id, { dependsOnTaskId: tC.id }), { statusCode: 400 });
});

test("blocking completion when dependency unfinished; remove dependency", async () => {
  await assert.rejects(() => taskService.transition(ctx, tB.id, "done"), { statusCode: 400 });
  const list = await dependencyService.list(ctx, tB.id);
  assert.equal(list.dependencies.length, 1);
  await dependencyService.remove(ctx, tB.id, list.dependencies[0].id);
  const doneB = await taskService.transition(ctx, tB.id, "done");
  assert.equal(doneB.status, "done");
});
