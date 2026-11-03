"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { hasRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { NewProjectForm } from "./new-project-form";
import { ProjectGrid } from "./project-grid";
import { ProjectStats } from "./project-stats";
import type { Workspace } from "@/types/workspace";

type Props = { workspace: Workspace; title: string; subtitle: string; showStats?: boolean };

export function ProjectSection({ workspace, title, subtitle, showStats }: Props) {
  const { projects, loading, error, create } = useProjects(workspace.id);
  const [creating, setCreating] = useState(false);
  const canCreate = hasRole(workspace.role, "member");

  return (
    <>
      <div className="mb-8 flex justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        {canCreate && !creating && <Button onClick={() => setCreating(true)}>New Project</Button>}
      </div>
      {creating && <NewProjectForm onCreate={create} onDone={() => setCreating(false)} />}
      {showStats && <ProjectStats projects={projects} loading={loading} />}
      <h3 className="mb-4 text-lg font-semibold">Projects</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading projects…</p>}
      {!loading && !error && <ProjectGrid projects={projects} />}
    </>
  );
}
