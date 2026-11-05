"use client";

import type { McpKey } from "@/types/mcp";

export function McpKeyList({ keys, onRevoke }: { keys: McpKey[]; onRevoke: (id: string) => void }) {
  if (keys.length === 0) return <p className="text-sm text-gray-500">No MCP keys created yet.</p>;

  return (
    <div className="space-y-3">
      {keys.map((k) => (
        <div key={k.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-3 text-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{k.name}</span>
              <code className="text-xs text-gray-500">{k.keyPrefix}...</code>
              {k.revokedAt ? (
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">Revoked</span>
              ) : (
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">Active</span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Scopes: {k.scopes?.join(", ")}</p>
          </div>
          {!k.revokedAt && (
            <button
              onClick={() => confirm("Revoke this MCP key immediately?") && onRevoke(k.id)}
              className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
            >
              Revoke
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
