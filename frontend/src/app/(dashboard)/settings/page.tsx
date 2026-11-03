"use client";

import { WorkspaceGate } from "@/components/auth/workspace-gate";
import { WorkspaceSettingsForm } from "@/components/workspaces/workspace-settings-form";
import { WorkspaceList } from "@/components/workspaces/workspace-list";

export default function SettingsPage() {
  return (
    <WorkspaceGate>
      {(workspace) => (
        <div className="max-w-3xl space-y-8">
          <h2 className="text-2xl font-semibold">Workspace settings</h2>
          <WorkspaceSettingsForm workspace={workspace} />
          <WorkspaceList />
        </div>
      )}
    </WorkspaceGate>
  );
}
