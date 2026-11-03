"use client";

import { useAuth } from "@/hooks/use-auth";
import { useMembers } from "@/hooks/use-members";
import { useAsyncAction } from "@/hooks/use-async-action";
import { hasRole } from "@/lib/roles";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { AddMemberForm } from "./add-member-form";
import { MemberRow } from "./member-row";
import type { Workspace } from "@/types/workspace";

export function MemberList({ workspace }: { workspace: Workspace }) {
  const { user } = useAuth();
  const { members, loading, error, add, changeRole, remove } = useMembers(workspace.id);
  const action = useAsyncAction();
  const canManage = hasRole(workspace.role, "admin");
  const isOwner = workspace.role === "owner";

  return (
    <Card className="space-y-4">
      <h3 className="font-semibold">Members</h3>
      {canManage && <AddMemberForm onAdd={add} allowOwner={isOwner} />}
      <FormError message={error ?? action.error} />
      {loading ? <p className="text-sm text-gray-500">Loading members…</p> : (
        <ul className="divide-y">
          {members.map((member) => (
            <MemberRow key={member.userId} member={member} isSelf={member.userId === user?.id}
              canManage={canManage} isOwner={isOwner}
              onRole={(role) => action.run(() => changeRole(member.userId, role))}
              onRemove={() => action.run(() => remove(member.userId))} />
          ))}
        </ul>
      )}
    </Card>
  );
}
