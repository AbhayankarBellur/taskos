"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAsyncAction } from "@/hooks/use-async-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";

export function LoginForm({ expired }: { expired?: boolean }) {
  const { login } = useAuth();
  const router = useRouter();
  const { run, pending, error } = useAsyncAction();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await run(() => login({
      email: String(form.get("email")),
      password: String(form.get("password"))
    }));
    if (ok) router.replace("/");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Sign in to TaskOS</h2>
      {expired && !error && <FormError message="Your session expired. Please sign in again." />}
      <FormError message={error} />
      <Input label="Email" name="email" type="email" autoComplete="email" required />
      <Input label="Password" name="password" type="password" autoComplete="current-password" required />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-gray-500">
        No account? <Link href="/register" className="text-indigo-600 hover:underline">Create one</Link>
      </p>
    </form>
  );
}
