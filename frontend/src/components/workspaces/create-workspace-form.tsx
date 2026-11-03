"use client";

import { FormEvent } from "react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useAsyncAction } from "@/hooks/use-async-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";

export function CreateWorkspaceForm() {
  const { create } = useWorkspaces();
  const { run, pending, error } = useAsyncAction();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get("name"));
    if (await run(() => create(name))) form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <FormError message={error} />
      <div className="flex items-end gap-2">
        <Input label="New workspace" name="name" required minLength={2} maxLength={80}
          placeholder="Design Team" className="flex-1" />
        <Button type="submit" disabled={pending}>Create</Button>
      </div>
    </form>
  );
}
