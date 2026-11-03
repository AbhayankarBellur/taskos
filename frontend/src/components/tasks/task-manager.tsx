import { useState } from "react";
import { Task, TaskStatus } from "@/types/task";
import { taskApi } from "@/lib/task-api";
import { SwimlaneMode } from "@/lib/board-utils";
import { useBoardFilters } from "@/hooks/use-board-filters";
import { BoardToolbar } from "../board/board-toolbar";
import { BoardFilters } from "../board/board-filters";
import { KanbanBoard } from "../board/kanban-board";
import { ProjectOverviewPanel } from "../projects/project-overview-panel";
import { ProjectWorkload } from "../projects/project-workload";
import { TaskRow } from "./task-row";
import { TaskDrawer } from "./task-drawer";
import { Modal } from "../ui/modal";
import { TaskForm } from "./task-form";

export function TaskManager({ tasks, projectId, onRefresh }: { tasks: Task[]; projectId: string; onRefresh: () => void }) {
  const [view, setView] = useState<"board" | "list" | "overview">("board");
  const [swimlane, setSwimlane] = useState<SwimlaneMode>("none");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const filters = useBoardFilters(tasks);

  const handleStatus = async (task: Task, newStatus: TaskStatus) => {
    try { setError(null); await taskApi.transition(projectId, task.id, newStatus); onRefresh(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to change status"); onRefresh(); }
  };

  return (
    <div className="flex flex-col gap-4">
      <BoardToolbar view={view} onViewChange={setView} swimlane={swimlane} onSwimlaneChange={setSwimlane} onCreateOpen={() => setCreateOpen(true)} />
      {error && <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 font-medium">{error}</div>}
      {view !== "overview" && <BoardFilters {...filters} onSearch={filters.setSearch} onStatus={filters.setStatus} onPriority={filters.setPriority} onToggleArchived={filters.setShowArchived} />}
      {view === "board" && <KanbanBoard tasks={filters.filteredTasks} swimlane={swimlane} onSelect={setSelectedTask} onStatusChange={handleStatus} />}
      {view === "list" && (
        <div className="rounded-lg border border-gray-200 overflow-hidden divide-y">
          {filters.filteredTasks.map((t) => <TaskRow key={t.id} task={t} onSelect={setSelectedTask} />)}
        </div>
      )}
      {view === "overview" && <div className="flex flex-col gap-4"><ProjectOverviewPanel tasks={tasks} /><ProjectWorkload tasks={tasks} /></div>}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Task"><TaskForm onSubmit={async (d) => { await taskApi.create(projectId, d); setCreateOpen(false); onRefresh(); }} /></Modal>
      <TaskDrawer task={selectedTask} projectId={projectId} onClose={() => setSelectedTask(null)} onRefresh={onRefresh} onStatusChange={handleStatus} onToggleBlock={async (t, b) => { await (b ? taskApi.block(projectId, t.id, "Flagged via UI") : taskApi.unblock(projectId, t.id)); onRefresh(); }} onArchive={async (t) => { await taskApi.archive(projectId, t.id); onRefresh(); setSelectedTask(null); }} />
    </div>
  );
}
