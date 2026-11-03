"use client";

import { workspaceApi } from "@/lib/workspace-api";
import { useResource } from "./use-resource";
import type { Member, Role } from "@/types/workspace";

export function useMembers(workspaceId?: string) {
  const { data, loading, error, update } = useResource(workspaceId ?? null, workspaceApi.members);
  const id = workspaceId ?? "";
  const replace = (member: Member) =>
    update((list) => list.map((m) => (m.userId === member.userId ? member : m)));

  return {
    members: data ?? [],
    loading,
    error,
    add: async (email: string, role: Role) => {
      const member = await workspaceApi.addMember(id, email, role);
      update((list) => [...list, member]);
    },
    changeRole: async (userId: string, role: Role) =>
      replace(await workspaceApi.changeRole(id, userId, role)),
    remove: async (userId: string) => {
      await workspaceApi.removeMember(id, userId);
      update((list) => list.filter((m) => m.userId !== userId));
    }
  };
}
