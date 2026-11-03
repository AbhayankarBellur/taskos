"use client";

import { FormEvent } from "react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useAsyncAction } from "@/hooks/use-async-action";
import { hasRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";
import type { Workspace } from "@/types/workspace";

export function WorkspaceSettingsForm({ workspace }: { workspace: Workspace }) {
  const { rename } = useWorkspaces();
  const { run, pending, error } = useAsyncAction();
  const canEdit = hasRole(workspace.role, "admin");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name"));
    run(() => rename(name));
  }

  return (
    <Card>
      <form key={workspace.id} onSubmit={onSubmit} className="space-y-3">
        <h3 className="font-semibold">General</h3>
        <FormError message={error} />
        <Input label="Workspace name" name="name" defaultValue={workspace.name}
          required minLength={2} maxLength={80} disabled={!canEdit} />
        <p className="text-xs text-gray-500">Slug: {workspace.slug}</p>
        {canEdit
          ? <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          : <p className="text-xs text-gray-500">Only admins and owners can edit settings.</p>}
      </form>
    </Card>
  );
}
