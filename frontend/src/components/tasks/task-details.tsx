import { Task, TaskStatus as StatusType } from "@/types/task";
import { TaskStatus } from "./task-status";
import { TaskPriority } from "./task-priority";
import { Button } from "../ui/button";

const nextStatuses: StatusType[] = ["todo", "in_progress", "in_review", "done"];

type Props = {
  task: Task; onClose: () => void;
  onStatusChange: (status: StatusType) => void;
  onToggleBlock: (blocked: boolean) => void;
  onArchive: () => void;
};

export function TaskDetails({ task, onClose, onStatusChange, onToggleBlock, onArchive }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-3">
        <span className="font-mono text-sm font-bold text-gray-500">{task.key}</span>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onArchive} className="text-xs text-red-600">Archive</Button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
        <p className="mt-1 text-sm text-gray-600">{task.description || "No description."}</p>
      </div>
      <div className="flex items-center gap-3">
        <TaskPriority priority={task.priority} />
        <TaskStatus status={task.status} />
        <Button variant="secondary" className="text-xs" onClick={() => onToggleBlock(!task.blocked)}>
          {task.blocked ? "Unblock" : "Block"}
        </Button>
      </div>
      <div className="flex flex-wrap gap-1 border-t pt-2">
        <span className="text-xs text-gray-400 w-full mb-1">Move to:</span>
        {nextStatuses.map((st) => (
          <button key={st} onClick={() => onStatusChange(st)} className="rounded bg-gray-100 px-2 py-1 text-xs capitalize hover:bg-gray-200">
            {st.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
