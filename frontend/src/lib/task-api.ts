import { api } from "./api";
import { Task, TaskStatus } from "@/types/task";

const basePath = (pId: string) => `/projects/${pId}/tasks`;

export const taskApi = {
  list: (pId: string, q = "") =>
    api<{ items: Task[] }>(`${basePath(pId)}${q ? `?${q}` : ""}`).then((r) => r.items),

  get: (pId: string, id: string) => api<Task>(`${basePath(pId)}/${id}`),

  create: (pId: string, data: Partial<Task>) =>
    api<Task>(basePath(pId), { method: "POST", body: JSON.stringify(data) }),

  update: (pId: string, id: string, data: Partial<Task>) =>
    api<Task>(`${basePath(pId)}/${id}`, {
      method: "PATCH", body: JSON.stringify(data)
    }),

  transition: (pId: string, id: string, status: TaskStatus) =>
    api<Task>(`${basePath(pId)}/${id}/status`, {
      method: "PATCH", body: JSON.stringify({ status })
    }),

  block: (pId: string, id: string, reason: string) =>
    api<Task>(`${basePath(pId)}/${id}/block`, {
      method: "PATCH", body: JSON.stringify({ reason })
    }),

  unblock: (pId: string, id: string) =>
    api<Task>(`${basePath(pId)}/${id}/unblock`, { method: "PATCH" }),

  archive: (pId: string, id: string) =>
    api<Task>(`${basePath(pId)}/${id}`, { method: "DELETE" }),

  createSubtask: (pId: string, id: string, data: Partial<Task>) =>
    api<Task>(`${basePath(pId)}/${id}/subtasks`, {
      method: "POST", body: JSON.stringify(data)
    })
};
