import { useDroppable } from "@dnd-kit/core";
import { Task, TaskStatus } from "@/types/task";
import { KanbanCard } from "./kanban-card";

type Props = {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onSelect: (t: Task) => void;
};

export function KanbanColumn({ status, label, tasks, onSelect }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl bg-gray-50/80 p-3 min-w-[260px] w-full flex-1 border transition ${
        isOver ? "border-indigo-400 bg-indigo-50/30" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200/70 text-xs font-semibold text-gray-700">
        <span>{label}</span>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-gray-600">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2 min-h-[150px] overflow-y-auto">
        {tasks.map((t) => (
          <KanbanCard key={t.id} task={t} onSelect={onSelect} />
        ))}
        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded border border-dashed border-gray-300 text-xs text-gray-400">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
