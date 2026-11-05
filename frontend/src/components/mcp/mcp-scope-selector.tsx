"use client";

export const READ_SCOPES = [
  { id: "projects:read", label: "projects:read (View projects)" },
  { id: "tasks:read", label: "tasks:read (View tasks)" },
  { id: "reports:read", label: "reports:read (View blockers)" }
];

export const WRITE_SCOPES = [
  { id: "tasks:write", label: "tasks:write (Create/modify tasks)" },
  { id: "comments:write", label: "comments:write (Add task comments)" },
  { id: "dependencies:write", label: "dependencies:write (Add dependencies)" }
];

export function McpScopeSelector({ scopes, onToggle }: { scopes: string[]; onToggle: (s: string) => void }) {
  return (
    <div className="mt-3 space-y-3">
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-1">Read Permissions</p>
        <div className="space-y-1">
          {READ_SCOPES.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input type="checkbox" checked={scopes.includes(s.id)} onChange={() => onToggle(s.id)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span>{s.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-xs font-semibold text-gray-700">Write Permissions</p>
          <span className="text-[10px] text-amber-600 font-medium">Allows AI mutations</span>
        </div>
        <p className="text-[11px] text-gray-500 mb-1">Enables external AI clients to create and modify tasks, comments, and dependencies.</p>
        <div className="space-y-1">
          {WRITE_SCOPES.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input type="checkbox" checked={scopes.includes(s.id)} onChange={() => onToggle(s.id)} className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
              <span>{s.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
