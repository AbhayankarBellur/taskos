import { Task } from "@/types/task";
import { TaskPriority } from "./task-priority";
import { TaskStatus } from "./task-status";

type Props = {
  task: Task;
  onSelect: (task: Task) => void;
};

export function TaskRow({ task, onSelect }: Props) {
  return (
    <div
      onClick={() => onSelect(task)}
      className="flex cursor-pointer items-center justify-between border-b border-gray-100 bg-white px-4 py-3 hover:bg-gray-50 transition"
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-semibold text-gray-500 w-16">{task.key}</span>
        <span className="text-sm font-medium text-gray-900">{task.title}</span>
        {task.blocked && (
          <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
            Blocked
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <TaskPriority priority={task.priority} />
        <TaskStatus status={task.status} />
      </div>
    </div>
  );
}
