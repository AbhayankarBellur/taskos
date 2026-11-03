import { api, send } from "./api";
import type { Member, Role, Workspace } from "@/types/workspace";

const base = (id: string) => `/workspaces/${id}`;

export const workspaceApi = {
  list: () => api<Workspace[]>("/workspaces"),
  create: (name: string) => send<Workspace>("POST", "/workspaces", { name }),
  update: (id: string, name: string) => send<Workspace>("PATCH", base(id), { name }),
  members: (id: string) => api<Member[]>(`${base(id)}/members`),
  addMember: (id: string, email: string, role: Role) =>
    send<Member>("POST", `${base(id)}/members`, { email, role }),
  changeRole: (id: string, userId: string, role: Role) =>
    send<Member>("PATCH", `${base(id)}/members/${userId}`, { role }),
  removeMember: (id: string, userId: string) =>
    send<null>("DELETE", `${base(id)}/members/${userId}`)
};
