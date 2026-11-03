"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAsyncAction } from "@/hooks/use-async-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const { run, pending, error } = useAsyncAction();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const workspaceName = String(form.get("workspaceName") || "").trim();
    const ok = await run(() => register({
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
      ...(workspaceName && { workspaceName })
    }));
    if (ok) router.replace("/");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Create your account</h2>
      <FormError message={error} />
      <Input label="Name" name="name" autoComplete="name" required maxLength={80} />
      <Input label="Email" name="email" type="email" autoComplete="email" required />
      <Input label="Password" name="password" type="password" autoComplete="new-password"
        required minLength={8} maxLength={72} placeholder="At least 8 characters" />
      <Input label="Workspace name (optional)" name="workspaceName" maxLength={80} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-gray-500">
        Already registered? <Link href="/login" className="text-indigo-600 hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
