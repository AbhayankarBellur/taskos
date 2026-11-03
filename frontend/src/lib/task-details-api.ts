import { api } from "./api";
import { TaskAssessment, TaskComment, TaskEvent } from "@/types/task";

const taskBase = (pId: string, tId: string) => `/projects/${pId}/tasks/${tId}`;

export const taskDetailsApi = {
  getAssessments: (pId: string, tId: string) =>
    api<TaskAssessment[]>(`${taskBase(pId, tId)}/assessments`),

  addAssessment: (pId: string, tId: string, data: Partial<TaskAssessment>) =>
    api<TaskAssessment>(`${taskBase(pId, tId)}/assessments`, {
      method: "POST", body: JSON.stringify(data)
    }),

  getDependencies: (pId: string, tId: string) =>
    api<{ dependencies: Array<{ id: string; dependsOnTaskId: string }>; dependents: Array<{ id: string; taskId: string }> }>(
      `${taskBase(pId, tId)}/dependencies`
    ),

  addDependency: (pId: string, tId: string, dependsOnTaskId: string) =>
    api<{ id: string }>(`${taskBase(pId, tId)}/dependencies`, {
      method: "POST", body: JSON.stringify({ dependsOnTaskId })
    }),

  removeDependency: (pId: string, tId: string, depId: string) =>
    api<{ success: boolean }>(`${taskBase(pId, tId)}/dependencies/${depId}`, {
      method: "DELETE"
    }),

  getComments: (pId: string, tId: string) =>
    api<TaskComment[]>(`${taskBase(pId, tId)}/comments`),

  addComment: (pId: string, tId: string, content: string) =>
    api<TaskComment>(`${taskBase(pId, tId)}/comments`, {
      method: "POST", body: JSON.stringify({ content })
    }),

  getEvents: (pId: string, tId: string) =>
    api<TaskEvent[]>(`${taskBase(pId, tId)}/events`)
};
