import { Task, TaskStatus } from "@/types/task";
import { BOARD_COLUMNS } from "@/lib/board-utils";
import { KanbanColumn } from "./kanban-column";

type Props = {
  title: string;
  tasks: Task[];
  onSelect: (t: Task) => void;
  columnPrefix?: string;
};

export function SwimlaneRow({ title, tasks, onSelect, columnPrefix = "" }: Props) {
  const byStatus = (st: TaskStatus) => tasks.filter((t) => t.status === st);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">{title}</h4>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
          {tasks.length}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto">
        {BOARD_COLUMNS.map((col) => (
          <KanbanColumn
            key={`${columnPrefix}${col.id}`}
            status={col.id}
            label={col.label}
            tasks={byStatus(col.id)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
