import { api, send } from "./api";
import type { NewProject, Project } from "@/types/project";
import type { Workspace } from "@/types/workspace";

type ProjectList = { workspace: Workspace; projects: Project[] };
const path = (workspaceId: string) => `/workspaces/${workspaceId}/projects`;

export const projectApi = {
  list: (workspaceId: string) => api<ProjectList>(path(workspaceId)),
  create: (workspaceId: string, input: NewProject) =>
    send<Project>("POST", path(workspaceId), input)
};
