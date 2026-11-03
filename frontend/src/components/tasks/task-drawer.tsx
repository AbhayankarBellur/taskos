import { useState, useEffect } from "react";
import { Task, TaskAssessment as AsmType, TaskComment, TaskEvent } from "@/types/task";
import { Member } from "@/types/workspace";
import { taskDetailsApi } from "@/lib/task-details-api";
import { TaskDetails } from "./task-details";
import { TaskAssessment } from "./task-assessment";
import { TaskComments } from "./task-comments";
import { ActivityTimeline } from "./activity-timeline";

type Props = {
  task: Task | null; projectId: string; onClose: () => void; onRefresh: () => void;
  onStatusChange: (task: Task, st: Task["status"]) => void;
  onToggleBlock: (task: Task, bl: boolean) => void;
  onArchive: (task: Task) => void;
  members?: Member[];
  onAssign?: (task: Task, assigneeId: string | null) => void;
};

export function TaskDrawer({ task, projectId, onClose, onRefresh, onStatusChange, onToggleBlock, onArchive, members = [], onAssign }: Props) {
  const [asms, setAsms] = useState<AsmType[]>([]);
  const [cmts, setCmts] = useState<TaskComment[]>([]);
  const [evts, setEvts] = useState<TaskEvent[]>([]);

  useEffect(() => {
    if (!task) return;
    taskDetailsApi.getAssessments(projectId, task.id).then(setAsms).catch(() => {});
    taskDetailsApi.getComments(projectId, task.id).then(setCmts).catch(() => {});
    taskDetailsApi.getEvents(projectId, task.id).then(setEvts).catch(() => {});
  }, [task, projectId]);

  if (!task) return null;
  return (
    <div className="fixed inset-y-0 right-0 z-40 w-96 border-l bg-white p-6 shadow-2xl flex flex-col gap-6 overflow-y-auto">
      <TaskDetails task={task} onClose={onClose} onArchive={() => onArchive(task)}
        onStatusChange={(st) => onStatusChange(task, st)} onToggleBlock={(bl) => onToggleBlock(task, bl)}
        members={members} onAssign={(aId) => onAssign?.(task, aId)} />
      <div className="border-t pt-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Assessments</h4>
        <TaskAssessment assessments={asms} onAdd={(d) => taskDetailsApi.addAssessment(projectId, task.id, d).then(onRefresh)} />
      </div>
      <div className="border-t pt-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Comments</h4>
        <TaskComments comments={cmts} onAdd={(c) => taskDetailsApi.addComment(projectId, task.id, c).then(onRefresh)} />
      </div>
      <ActivityTimeline events={evts} />
    </div>
  );
}
