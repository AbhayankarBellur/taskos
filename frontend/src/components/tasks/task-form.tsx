import { useState, FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Task, TaskPriority, TaskStatus } from "@/types/task";

const pOpts = [
  { value: "low", label: "Low" }, { value: "medium", label: "Medium" },
  { value: "high", label: "High" }, { value: "critical", label: "Critical" }
];
const sOpts = [
  { value: "backlog", label: "Backlog" }, { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" }, { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" }
];

export function TaskForm({
  onSubmit, initial = {}, loading
}: { onSubmit: (d: Partial<Task>) => void; initial?: Partial<Task>; loading?: boolean }) {
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  const [priority, setPriority] = useState<TaskPriority>(initial.priority || "medium");
  const [status, setStatus] = useState<TaskStatus>(initial.status || "backlog");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) onSubmit({ title, description, priority, status });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex gap-4">
        <Select label="Priority" value={priority} options={pOpts}
          onChange={(e) => setPriority(e.target.value as TaskPriority)} />
        <Select label="Status" value={status} options={sOpts}
          onChange={(e) => setStatus(e.target.value as TaskStatus)} />
      </div>
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? "Saving..." : "Save Task"}
      </Button>
    </form>
  );
}
