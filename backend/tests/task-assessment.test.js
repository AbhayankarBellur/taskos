import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDB, teardownTestDB } from "./test-db.js";
import { setDB } from "../src/config/database.js";
import { createTestCtx } from "./test-context.js";
import { projectService } from "../src/modules/projects/project.service.js";
import { taskService } from "../src/modules/tasks/task.service.js";
import { assessmentService } from "../src/modules/assessments/assessment.service.js";
import { commentService } from "../src/modules/comments/comment.service.js";
import { eventService } from "../src/modules/events/event.service.js";

let ctx, project, task;

before(async () => {
  setDB(await setupTestDB());
  ctx = createTestCtx("member");
  project = await projectService.create({ name: "Assessments", key: "ASM" }, ctx);
  task = await taskService.create(ctx, project.id, { title: "Evaluate Me" });
});

after(async () => { await teardownTestDB(); });

test("assessment creation and history retention", async () => {
  await assessmentService.create(ctx, task.id, {
    complexity: "low", storyPoints: 3, estimatedHours: 4, risk: "low", confidence: 90
  });
  await assessmentService.create(ctx, task.id, {
    complexity: "high", storyPoints: 8, estimatedHours: 12, risk: "high", confidence: 75
  });

  const all = await assessmentService.list(ctx, task.id);
  assert.equal(all.length, 2);

  const latest = await assessmentService.latest(ctx, task.id);
  assert.equal(latest.storyPoints, 8);
});

test("comments and events audit history", async () => {
  await commentService.create(ctx, task.id, { content: "First comment" });
  const comments = await commentService.list(ctx, task.id);
  assert.equal(comments.length, 1);
  assert.equal(comments[0].content, "First comment");

  const events = await eventService.listByTaskId(ctx, task.id);
  assert.ok(events.length >= 3);
  const actions = events.map((e) => e.action);
  assert.ok(actions.includes("task.created"));
  assert.ok(actions.includes("task.assessed"));
  assert.ok(actions.includes("task.commented"));
});
