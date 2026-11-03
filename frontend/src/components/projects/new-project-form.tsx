"use client";

import { FormEvent } from "react";
import { useAsyncAction } from "@/hooks/use-async-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";
import type { NewProject } from "@/types/project";

type Props = { onCreate: (input: NewProject) => Promise<void>; onDone: () => void };

export function NewProjectForm({ onCreate, onDone }: Props) {
  const { run, pending, error } = useAsyncAction();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await run(() => onCreate({
      name: String(form.get("name")),
      description: String(form.get("description") ?? ""),
      color: String(form.get("color")).toUpperCase()
    }));
    if (ok) onDone();
  }

  return (
    <Card className="mb-6">
      <form onSubmit={onSubmit} className="space-y-3">
        <FormError message={error} />
        <div className="flex items-end gap-3">
          <Input label="Project name" name="name" required minLength={2} maxLength={80} className="flex-1" />
          <Input label="Colour" name="color" type="color" defaultValue="#6366f1" className="h-10 w-16 p-1" />
        </div>
        <Input label="Description" name="description" maxLength={1000} />
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create project"}</Button>
          <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
