import { Task, TaskStatus } from "@/types/task";

export type SwimlaneMode = "none" | "assignee" | "priority" | "parent";

export const BOARD_COLUMNS: Array<{ id: TaskStatus; label: string }> = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "in_review", label: "In Review" },
  { id: "done", label: "Done" }
];

export function groupTasksBySwimlane(tasks: Task[], mode: SwimlaneMode) {
  if (mode === "none") return [{ id: "all", title: "All Tasks", tasks }];

  const groups: Record<string, { id: string; title: string; tasks: Task[] }> = {};
  for (const t of tasks) {
    let key = "Unassigned";
    let title = "Unassigned";
    if (mode === "priority") {
      key = t.priority;
      title = `${t.priority.toUpperCase()} Priority`;
    } else if (mode === "assignee") {
      key = t.assigneeId || "unassigned";
      title = t.assigneeId ? `Assignee: ${t.assigneeId.slice(-4)}` : "Unassigned";
    } else if (mode === "parent") {
      key = t.parentTaskId || "root";
      title = t.parentTaskId ? `Parent: ${t.parentTaskId.slice(-4)}` : "Root Tasks";
    }
    if (!groups[key]) groups[key] = { id: key, title, tasks: [] };
    groups[key].tasks.push(t);
  }
  return Object.values(groups);
}
