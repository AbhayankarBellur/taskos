"use client";

import { WorkspaceGate } from "@/components/auth/workspace-gate";
import { ProjectSection } from "@/components/projects/project-section";

export default function OverviewPage() {
  return (
    <WorkspaceGate>
      {(workspace) => (
        <ProjectSection workspace={workspace} title="Overview" showStats
          subtitle={`${workspace.name} at a glance.`} />
      )}
    </WorkspaceGate>
  );
}
