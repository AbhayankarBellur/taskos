import { Input } from "../ui/input";
import { Select } from "../ui/select";

type Props = {
  search: string; onSearch: (s: string) => void;
  status: string; onStatus: (s: string) => void;
  priority: string; onPriority: (p: string) => void;
  showArchived: boolean; onToggleArchived: (a: boolean) => void;
};

const STATUS_OPTS = [
  { value: "all", label: "All Statuses" }, { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To Do" }, { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" }, { value: "done", label: "Done" }
];

const PRIORITY_OPTS = [
  { value: "all", label: "All Priorities" }, { value: "critical", label: "Critical" },
  { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }
];

export function BoardFilters({ search, onSearch, status, onStatus, priority, onPriority, showArchived, onToggleArchived }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-56"><Input placeholder="Search tasks..." value={search} onChange={(e) => onSearch(e.target.value)} /></div>
      <div className="w-36"><Select value={status} onChange={(e) => onStatus(e.target.value)} options={STATUS_OPTS} /></div>
      <div className="w-32"><Select value={priority} onChange={(e) => onPriority(e.target.value)} options={PRIORITY_OPTS} /></div>
      <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
        <input type="checkbox" checked={showArchived} onChange={(e) => onToggleArchived(e.target.checked)} className="rounded border-gray-300 text-indigo-600" />
        Archived
      </label>
    </div>
  );
}
