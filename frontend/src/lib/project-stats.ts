import { Task } from "@/types/task";

export function computeProjectStats(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const blocked = tasks.filter((t) => t.blocked).length;
  const now = new Date();
  const overdue = tasks.filter((t) => t.status !== "done" && t.dueDate && new Date(t.dueDate) < now).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const priorities: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  const assignees: Record<string, number> = {};

  tasks.forEach((t) => {
    priorities[t.priority] = (priorities[t.priority] || 0) + 1;
    const a = t.assigneeId ? t.assigneeId.slice(-4) : "Unassigned";
    assignees[a] = (assignees[a] || 0) + 1;
  });

  return { total, completed, inProgress, blocked, overdue, percent, priorities, assignees };
}
