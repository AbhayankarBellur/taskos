"use client";

import { useWorkspaces } from "@/hooks/use-workspaces";
import { CreateWorkspaceForm } from "@/components/workspaces/create-workspace-form";
import { Card } from "@/components/ui/card";
import type { Workspace } from "@/types/workspace";

type Props = { children: (workspace: Workspace) => React.ReactNode };

export function WorkspaceGate({ children }: Props) {
  const { current, loading, error } = useWorkspaces();

  if (loading) return <p className="text-sm text-gray-500">Loading workspace…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!current) {
    return (
      <Card className="max-w-md">
        <h2 className="mb-1 font-semibold">No workspace yet</h2>
        <p className="mb-4 text-sm text-gray-500">Create a workspace to start organising projects.</p>
        <CreateWorkspaceForm />
      </Card>
    );
  }
  return <>{children(current)}</>;
}
