"use client";

import { useEffect, useState, useCallback } from "react";
import { send } from "@/lib/api";
import type { McpKey, CreatedMcpKey } from "@/types/mcp";
import { McpKeyList } from "./mcp-key-list";
import { McpKeyCreateModal } from "./mcp-key-create-modal";
import { McpKeyRevealModal } from "./mcp-key-reveal-modal";

export function McpKeyManager({ workspaceId }: { workspaceId: string }) {
  const [keys, setKeys] = useState<McpKey[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const load = useCallback(() => {
    send<McpKey[]>("GET", `/mcp-keys?workspaceId=${workspaceId}`)
      .then((res) => setKeys(res || []))
      .catch(() => {});
  }, [workspaceId]);

  useEffect(() => { load(); }, [load]);

  const handleRevoke = async (id: string) => {
    await send("DELETE", `/mcp-keys/${id}`);
    load();
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">MCP API Keys</h3>
          <p className="text-xs text-zinc-500">Connect AI clients (Claude Desktop, Cursor) to this workspace.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="rounded bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700">
          Create Key
        </button>
      </div>
      <McpKeyList keys={keys} onRevoke={handleRevoke} />
      {showCreate && (
        <McpKeyCreateModal workspaceId={workspaceId} onClose={() => setShowCreate(false)}
          onCreated={(k: CreatedMcpKey) => { setShowCreate(false); setRevealedKey(k.apiKey); load(); }} />
      )}
      {revealedKey && <McpKeyRevealModal apiKey={revealedKey} onClose={() => setRevealedKey(null)} />}
    </div>
  );
}
