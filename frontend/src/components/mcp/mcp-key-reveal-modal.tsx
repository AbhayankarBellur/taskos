"use client";

import { useState } from "react";

export function McpKeyRevealModal({ apiKey, onClose }: { apiKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">MCP API Key Created</h3>
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
          Copy this key now. It will never be shown again.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
          <input readOnly value={apiKey} className="w-full bg-transparent font-mono text-xs outline-none" />
          <button onClick={copy} className="rounded bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-700">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-lg bg-zinc-200 py-2 text-sm font-semibold hover:bg-zinc-300 dark:bg-zinc-800">
          I have saved my key
        </button>
      </div>
    </div>
  );
}
