"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";

export function UserMenu() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="flex items-center gap-3 border-t pt-4">
      <Avatar name={user.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-gray-500">{user.email}</p>
      </div>
      <button onClick={logout} aria-label="Log out" title="Log out"
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
        <LogOut size={16} />
      </button>
    </div>
  );
}
