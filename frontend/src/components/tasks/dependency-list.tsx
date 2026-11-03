import { useState, FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type Props = {
  dependencies: Array<{ id: string; dependsOnTaskId: string }>;
  dependents: Array<{ id: string; taskId: string }>;
  onAdd: (dependsOnTaskId: string) => void;
  onRemove: (depId: string) => void;
};

export function DependencyList({ dependencies, dependents, onAdd, onRemove }: Props) {
  const [depId, setDepId] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!depId.trim()) return;
    onAdd(depId.trim());
    setDepId("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold text-gray-700">Depends on ({dependencies.length})</div>
      {dependencies.map((d) => (
        <div key={d.id} className="flex justify-between items-center bg-gray-50 p-1.5 rounded text-xs">
          <span className="font-mono text-gray-600">{d.dependsOnTaskId}</span>
          <button onClick={() => onRemove(d.id)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      ))}
      <div className="text-xs font-semibold text-gray-700 mt-2">Blocks ({dependents.length})</div>
      {dependents.map((d) => (
        <div key={d.id} className="bg-gray-50 p-1.5 rounded text-xs font-mono text-gray-600">
          {d.taskId}
        </div>
      ))}
      <form onSubmit={submit} className="flex gap-2 mt-2">
        <Input placeholder="Task ID to depend on..." value={depId} onChange={(e) => setDepId(e.target.value)} />
        <Button type="submit" variant="secondary" className="text-xs">Link</Button>
      </form>
    </div>
  );
}
