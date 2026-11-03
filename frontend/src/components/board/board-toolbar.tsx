import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { SwimlaneMode } from "@/lib/board-utils";

type Props = {
  view: "board" | "list" | "overview";
  onViewChange: (v: "board" | "list" | "overview") => void;
  swimlane: SwimlaneMode;
  onSwimlaneChange: (m: SwimlaneMode) => void;
  onCreateOpen: () => void;
};

const SWIMLANE_OPTS = [
  { value: "none", label: "No Swimlanes" }, { value: "assignee", label: "By Assignee" },
  { value: "priority", label: "By Priority" }, { value: "parent", label: "By Parent Task" }
];

export function BoardToolbar({ view, onViewChange, swimlane, onSwimlaneChange, onCreateOpen }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
        {(["board", "list", "overview"] as const).map((v) => (
          <button key={v} onClick={() => onViewChange(v)}
            className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition ${view === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
            {v}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {view === "board" && (
          <div className="w-36"><Select value={swimlane} onChange={(e) => onSwimlaneChange(e.target.value as SwimlaneMode)} options={SWIMLANE_OPTS} /></div>
        )}
        <Button onClick={onCreateOpen} className="text-xs py-1.5">New Task</Button>
      </div>
    </div>
  );
}
