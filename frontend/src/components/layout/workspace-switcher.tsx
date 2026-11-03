"use client";

import { useWorkspaces } from "@/hooks/use-workspaces";
import { Avatar } from "@/components/ui/avatar";

export function WorkspaceSwitcher() {
  const { workspaces, current, select } = useWorkspaces();
  if (!current) return null;

  return (
    <div className="rounded-xl border p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        Current workspace
      </p>
      <div className="flex items-center gap-3">
        <Avatar name={current.name} className="rounded-lg" />
        <div className="min-w-0 flex-1">
          <label htmlFor="workspace-switcher" className="sr-only">Switch workspace</label>
          <select id="workspace-switcher" value={current.id}
            onChange={(event) => select(event.target.value)}
            className="w-full truncate bg-transparent text-sm font-medium outline-none">
            {workspaces.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <p className="text-xs capitalize text-gray-500">{current.role}</p>
        </div>
      </div>
    </div>
  );
}
