"use client";

import { useState } from "react";
import { send } from "@/lib/api";
import type { CreatedMcpKey } from "@/types/mcp";
import { McpScopeSelector, READ_SCOPES } from "./mcp-scope-selector";

export function McpKeyCreateModal({
  workspaceId, onCreated, onClose
}: { workspaceId: string; onCreated: (k: CreatedMcpKey) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(READ_SCOPES.map((s) => s.id));
  const [loading, setLoading] = useState(false);

  const toggle = (s: string) => setScopes((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || scopes.length === 0) return;
    setLoading(true);
    try { onCreated(await send<CreatedMcpKey>("POST", "/mcp-keys", { name: name.trim(), workspaceId, scopes })); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">New MCP API Key</h3>
        <p className="mt-1 text-xs text-gray-500">Create an authenticated token for your AI workspace connection.</p>
        <input placeholder="Connection Name (e.g. Claude Desktop)" value={name} onChange={(e) => setName(e.target.value)}
          className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" required />
        <McpScopeSelector scopes={scopes} onToggle={toggle} />
        <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-3">
          <button type="button" onClick={onClose} className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
          <button type="submit" disabled={loading || scopes.length === 0} className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">Create</button>
        </div>
      </form>
    </div>
  );
}
