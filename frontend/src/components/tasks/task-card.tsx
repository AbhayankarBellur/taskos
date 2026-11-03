import { Task } from "@/types/task";
import { TaskPriority } from "./task-priority";
import { TaskStatus } from "./task-status";

type Props = {
  task: Task;
  onClick: (task: Task) => void;
};

export function TaskCard({ task, onClick }: Props) {
  return (
    <div
      onClick={() => onClick(task)}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-mono font-medium">{task.key}</span>
        <TaskPriority priority={task.priority} />
      </div>
      <h4 className="mt-2 text-sm font-semibold text-gray-900 line-clamp-2">
        {task.title}
      </h4>
      <div className="mt-3 flex items-center justify-between">
        <TaskStatus status={task.status} />
        {task.blocked && (
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
            Blocked
          </span>
        )}
      </div>
    </div>
  );
}
