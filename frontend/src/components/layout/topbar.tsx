"use client";

import { usePathname } from "next/navigation";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { Badge } from "@/components/ui/badge";
import { pageTitle } from "./nav-links";

export function Topbar() {
  const { current } = useWorkspaces();
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">
      <div className="text-sm text-gray-500">
        {current?.name ?? "Workspace"} / {pageTitle(pathname)}
      </div>
      {current && <Badge color="blue">{current.role}</Badge>}
    </header>
  );
}
