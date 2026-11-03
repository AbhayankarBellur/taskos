"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { workspaceApi } from "@/lib/workspace-api";
import type { Workspace } from "@/types/workspace";

const STORAGE_KEY = "taskos.workspaceId";
type WorkspaceValue = {
  workspaces: Workspace[]; current: Workspace | null; loading: boolean; error: string | null;
  select: (id: string) => void; create: (name: string) => Promise<Workspace>;
  rename: (name: string) => Promise<void>; refresh: () => Promise<void>;
};
export const WorkspaceContext = createContext<WorkspaceValue | null>(null);
const storedId = () => (typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEY));

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(storedId);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => workspaceApi.list().then(setWorkspaces)
    .then(() => setError(null), (err: Error) => setError(err.message)), []);
  useEffect(() => { refresh(); }, [refresh]);

  const value = useMemo<WorkspaceValue>(() => {
    const list = workspaces ?? [];
    const current = list.find((w) => w.id === selectedId) ?? list[0] ?? null;
    const select = (id: string) => { localStorage.setItem(STORAGE_KEY, id); setSelectedId(id); };
    const replace = (ws: Workspace) => setWorkspaces((l) => (l ?? []).map((w) => (w.id === ws.id ? ws : w)));
    return {
      workspaces: list, current, error, select, refresh,
      loading: workspaces === null && !error,
      create: async (name) => {
        const ws = await workspaceApi.create(name);
        setWorkspaces((l) => [...(l ?? []), ws]);
        select(ws.id);
        return ws;
      },
      rename: async (name) => { if (current) replace(await workspaceApi.update(current.id, name)); }
    };
  }, [workspaces, selectedId, error, refresh]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
