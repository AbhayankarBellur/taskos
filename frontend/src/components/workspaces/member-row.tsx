"use client";

import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { RoleSelect } from "./role-select";
import type { Member, Role } from "@/types/workspace";

type Props = {
  member: Member;
  isSelf: boolean;
  canManage: boolean;
  isOwner: boolean;
  onRole: (role: Role) => void;
  onRemove: () => void;
};

export function MemberRow({ member, isSelf, canManage, isOwner, onRole, onRemove }: Props) {
  const editable = canManage && (isOwner || member.role !== "owner");
  return (
    <li className="flex items-center gap-3 py-3">
      <Avatar name={member.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{member.name}{isSelf && " (you)"}</p>
        <p className="truncate text-xs text-gray-500">{member.email}</p>
      </div>
      <RoleSelect label={`Role for ${member.name}`} value={member.role} onChange={onRole}
        disabled={!editable} allowOwner={isOwner} />
      {editable && (
        <button onClick={onRemove} aria-label={`Remove ${member.name}`}
          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
          <Trash2 size={16} />
        </button>
      )}
    </li>
  );
}
