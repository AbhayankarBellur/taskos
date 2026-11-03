import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/task";
import { TaskPriority } from "../tasks/task-priority";
import { Avatar } from "../ui/avatar";

export function KanbanCard({ task, onSelect }: { task: Task; onSelect: (t: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id, data: { task }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1
  };

  return (
    <div
      ref={setNodeRef} style={style} {...attributes} {...listeners}
      onClick={() => onSelect(task)}
      className="cursor-grab active:cursor-grabbing rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:border-indigo-400 hover:shadow transition"
    >
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-mono font-semibold">{task.key}</span>
        <TaskPriority priority={task.priority} />
      </div>
      <h4 className="mt-1.5 text-sm font-medium text-gray-900 line-clamp-2">{task.title}</h4>
      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {task.blocked && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">Blocked</span>
          )}
          {task.dueDate && (
            <span className="text-gray-400 text-[11px]">{new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
          )}
        </div>
        <Avatar name={task.assigneeId ? task.assigneeId.slice(-4) : "U"} size="sm" />
      </div>
    </div>
  );
}
