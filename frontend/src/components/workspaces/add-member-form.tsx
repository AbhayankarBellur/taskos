"use client";

import { FormEvent, useState } from "react";
import { useAsyncAction } from "@/hooks/use-async-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";
import { RoleSelect } from "./role-select";
import type { Role } from "@/types/workspace";

type Props = { onAdd: (email: string, role: Role) => Promise<void>; allowOwner: boolean };

export function AddMemberForm({ onAdd, allowOwner }: Props) {
  const [role, setRole] = useState<Role>("member");
  const { run, pending, error } = useAsyncAction();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email"));
    if (await run(() => onAdd(email, role))) form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <FormError message={error} />
      <div className="flex items-end gap-2">
        <Input label="Add an existing user by email" name="email" type="email" required
          placeholder="teammate@example.com" />
        <RoleSelect label="Role for new member" value={role} onChange={setRole} allowOwner={allowOwner} />
        <Button type="submit" disabled={pending}>Add</Button>
      </div>
    </form>
  );
}
