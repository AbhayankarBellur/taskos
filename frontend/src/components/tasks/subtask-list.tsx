import { useState, FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Task } from "@/types/task";

type Props = {
  subtasks: Task[];
  onCreate: (title: string) => void;
};

export function SubtaskList({ subtasks, onCreate }: Props) {
  const [title, setTitle] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim());
    setTitle("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
        {subtasks.map((s) => (
          <div key={s.id} className="flex justify-between rounded bg-gray-50 px-2 py-1 text-xs">
            <span className="font-mono text-gray-500">{s.key}</span>
            <span className="text-gray-800">{s.title}</span>
            <span className="capitalize text-gray-500">{s.status}</span>
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <Input placeholder="New subtask..." value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button type="submit" variant="secondary" className="text-xs">Add</Button>
      </form>
    </div>
  );
}
