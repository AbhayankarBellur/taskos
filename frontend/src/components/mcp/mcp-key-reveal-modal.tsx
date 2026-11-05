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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">MCP API Key Created</h3>
        <p className="mt-2 text-xs font-medium text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
          Make sure to copy your key now. You won&apos;t be able to see it again.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 p-2.5">
          <input readOnly value={apiKey} className="w-full bg-transparent font-mono text-xs text-gray-800 outline-none" />
          <button onClick={copy} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-200">
          I have saved my key
        </button>
      </div>
    </div>
  );
}
