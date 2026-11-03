import { taskRepository } from "./task.repository.js";
import { dependencyRepository } from "../dependencies/dependency.repository.js";
import { assertRole } from "../../utils/auth-roles.js";
import { toObjectId } from "../../utils/object-id.js";

const DUMMY_WS = "123456123456123456123456";

async function getUnfinDeps(wsId, taskId) {
  const deps = await dependencyRepository.findByTaskId(wsId, taskId), unfin = [];
  for (const d of deps) {
    const dep = await taskRepository.findById(wsId, d.dependsOnTaskId);
    if (dep && dep.status !== "done") unfin.push({ id: dep._id.toString(), key: dep.key, title: dep.title, status: dep.status });
  }
  return unfin;
}

export async function reportBlockers(ctx, filter = {}) {
  assertRole(ctx, "viewer");
  const q = { archived: false };
  if (ctx.workspaceId && ctx.workspaceId.toString() !== DUMMY_WS) q.workspaceId = ctx.workspaceId;
  if (filter.projectId) q.projectId = toObjectId(filter.projectId);
  if (filter.assigneeId) q.assigneeId = toObjectId(filter.assigneeId);
  const limit = Math.min(100, Math.max(1, parseInt(filter.limit, 10) || 50));
  const tasks = await taskRepository.find(q, { limit: 200 }), blocked = [];
  for (const t of tasks) {
    const isExp = Boolean(t.blocked), unfin = await getUnfinDeps(ctx.workspaceId, t._id);
    const isDep = t.status !== "done" && unfin.length > 0;
    if (isExp || isDep) {
      blocked.push({
        taskId: t._id.toString(), taskKey: t.key, title: t.title, priority: t.priority,
        status: t.status, projectKey: t.key?.split("-")[0] || "",
        assigneeId: t.assigneeId ? t.assigneeId.toString() : null,
        blocked: isExp, blockerReason: t.blockerReason || null,
        blockType: isExp && isDep ? "both" : isExp ? "explicit" : "dependency",
        dependencies: unfin
      });
      if (blocked.length >= limit) break;
    }
  }
  return {
    summary: { total: blocked.length, explicit: blocked.filter((b) => b.blocked).length, dependency: blocked.filter((b) => b.blockType === "dependency" || b.blockType === "both").length },
    tasks: blocked
  };
}
