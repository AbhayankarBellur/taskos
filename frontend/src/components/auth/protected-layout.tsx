"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { WorkspaceProvider } from "@/contexts/workspace-context";
import { AppShell } from "@/components/layout/app-shell";
import { FullPageMessage } from "@/components/ui/full-page-message";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { status, expired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace(expired ? "/login?expired=1" : "/login");
  }, [status, expired, router]);

  if (status !== "authenticated") return <FullPageMessage text="Loading…" />;

  return (
    <WorkspaceProvider>
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}
