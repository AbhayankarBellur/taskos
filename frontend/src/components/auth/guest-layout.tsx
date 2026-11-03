"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { FullPageMessage } from "@/components/ui/full-page-message";

export function GuestLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  if (status !== "unauthenticated") return <FullPageMessage text="Loading…" />;

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">TaskOS</h1>
        <Card className="p-6">{children}</Card>
      </div>
    </div>
  );
}
