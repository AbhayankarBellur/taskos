"use client";

import { useWorkspaces } from "@/hooks/use-workspaces";
import { WorkspaceCard } from "./workspace-card";
import { CreateWorkspaceForm } from "./create-workspace-form";

export function WorkspaceList() {
  const { workspaces, current, select } = useWorkspaces();

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Your workspaces</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {workspaces.map((workspace) => (
          <WorkspaceCard key={workspace.id} workspace={workspace}
            active={workspace.id === current?.id} onSelect={() => select(workspace.id)} />
        ))}
      </div>
      <CreateWorkspaceForm />
    </section>
  );
}
