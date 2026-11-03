"use client";

import { WorkspaceGate } from "@/components/auth/workspace-gate";
import { ProjectSection } from "@/components/projects/project-section";

export default function ProjectsPage() {
  return (
    <WorkspaceGate>
      {(workspace) => (
        <ProjectSection workspace={workspace} title="Projects"
          subtitle={`All projects in ${workspace.name}.`} />
      )}
    </WorkspaceGate>
  );
}
