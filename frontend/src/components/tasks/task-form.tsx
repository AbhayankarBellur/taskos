import { useState, FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { Member } from "@/types/workspace";

const pOpts = [{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "critical", label: "Critical" }];
const sOpts = [{ value: "backlog", label: "Backlog" }, { value: "todo", label: "To Do" }, { value: "in_progress", label: "In Progress" }, { value: "in_review", label: "In Review" }, { value: "done", label: "Done" }];

type Props = { onSubmit: (d: Partial<Task>) => void; initial?: Partial<Task>; loading?: boolean; members?: Member[] };

export function TaskForm({ onSubmit, initial = {}, loading, members = [] }: Props) {
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  const [priority, setPriority] = useState<TaskPriority>(initial.priority || "medium");
  const [status, setStatus] = useState<TaskStatus>(initial.status || "backlog");
  const [assigneeId, setAssigneeId] = useState(initial.assigneeId || "");

  const memOpts = [{ value: "", label: "Unassigned" }, ...members.map((m) => ({ value: m.userId, label: m.name || m.email || m.userId.slice(-4) }))];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) onSubmit({ title, description, priority, status, assigneeId: assigneeId || null });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="grid grid-cols-3 gap-2">
        <Select label="Priority" value={priority} options={pOpts} onChange={(e) => setPriority(e.target.value as TaskPriority)} />
        <Select label="Status" value={status} options={sOpts} onChange={(e) => setStatus(e.target.value as TaskStatus)} />
        <Select label="Assignee" value={assigneeId} options={memOpts} onChange={(e) => setAssigneeId(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading} className="mt-1">{loading ? "Saving..." : "Save Task"}</Button>
    </form>
  );
}
