"use client";

import { useState } from "react";
import { send } from "@/lib/api";
import type { CreatedMcpKey } from "@/types/mcp";

const ALL_SCOPES = ["projects:read", "tasks:read", "reports:read"];

export function McpKeyCreateModal({
  workspaceId, onCreated, onClose
}: { workspaceId: string; onCreated: (key: CreatedMcpKey) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(ALL_SCOPES);
  const [loading, setLoading] = useState(false);

  const toggle = (s: string) => setScopes((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || scopes.length === 0) return;
    setLoading(true);
    try {
      onCreated(await send<CreatedMcpKey>("POST", "/mcp-keys", { name: name.trim(), workspaceId, scopes }));
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-lg font-bold">New MCP API Key</h3>
        <input placeholder="Connection Name" value={name} onChange={(e) => setName(e.target.value)}
          className="mt-3 w-full rounded border p-2 text-sm dark:bg-zinc-800" required />
        <div className="mt-3 space-y-1">
          {ALL_SCOPES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={scopes.includes(s)} onChange={() => toggle(s)} /> {s}
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="rounded bg-indigo-600 px-3 py-1 text-sm text-white">Create</button>
        </div>
      </form>
    </div>
  );
}
