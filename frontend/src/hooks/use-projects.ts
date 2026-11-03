"use client";

import { useCallback } from "react";
import { projectApi } from "@/lib/project-api";
import { useResource } from "./use-resource";
import type { NewProject } from "@/types/project";

export function useProjects(workspaceId?: string) {
  const { data, loading, error, update } = useResource(workspaceId ?? null, projectApi.list);

  const create = useCallback(async (input: NewProject) => {
    if (!workspaceId) return;
    const project = await projectApi.create(workspaceId, input);
    update((d) => ({ ...d, projects: [project, ...d.projects] }));
  }, [workspaceId, update]);

  return { projects: data?.projects ?? [], loading, error, create };
}
