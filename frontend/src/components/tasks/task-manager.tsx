import { useState } from "react";
import { Task } from "@/types/task";
import { taskApi } from "@/lib/task-api";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { EmptyState } from "../ui/empty-state";
import { TaskRow } from "./task-row";
import { TaskForm } from "./task-form";
import { TaskDrawer } from "./task-drawer";

export function TaskManager({
  tasks, projectId, onRefresh
}: { tasks: Task[]; projectId: string; onRefresh: () => void }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const onCreate = async (d: Partial<Task>) => {
    await taskApi.create(projectId, d);
    setCreateOpen(false);
    onRefresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Tasks ({tasks.length})</h2>
        <Button onClick={() => setCreateOpen(true)}>Create Task</Button>
      </div>
      {tasks.length === 0 ? (
        <EmptyState title="No tasks yet" description="Create your first task to start tracking work." />
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden divide-y">
          {tasks.map((t) => <TaskRow key={t.id} task={t} onSelect={setSelectedTask} />)}
        </div>
      )}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Task">
        <TaskForm onSubmit={onCreate} />
      </Modal>
      <TaskDrawer
        task={selectedTask} projectId={projectId} onClose={() => setSelectedTask(null)}
        onRefresh={onRefresh}
        onStatusChange={async (t, s) => { await taskApi.transition(projectId, t.id, s); onRefresh(); setSelectedTask(null); }}
        onToggleBlock={async (t, b) => { await (b ? taskApi.block(projectId, t.id, "Blocked") : taskApi.unblock(projectId, t.id)); onRefresh(); }}
        onArchive={async (t) => { await taskApi.archive(projectId, t.id); onRefresh(); setSelectedTask(null); }}
      />
    </div>
  );
}
