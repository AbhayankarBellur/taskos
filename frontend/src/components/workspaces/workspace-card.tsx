import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types/workspace";

type Props = { workspace: Workspace; active: boolean; onSelect: () => void };

export function WorkspaceCard({ workspace, active, onSelect }: Props) {
  return (
    <button onClick={onSelect}
      className={cn("flex w-full items-center gap-3 rounded-xl border bg-white p-4 text-left hover:border-indigo-300",
        active && "border-indigo-500 ring-2 ring-indigo-100")}>
      <Avatar name={workspace.name} className="rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{workspace.name}</p>
        <p className="truncate text-xs text-gray-500">{workspace.slug}</p>
      </div>
      <Badge color={active ? "green" : "gray"}>{active ? "Active" : workspace.role}</Badge>
    </button>
  );
}
