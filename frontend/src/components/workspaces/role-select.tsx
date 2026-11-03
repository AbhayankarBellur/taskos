import { ROLES } from "@/lib/roles";
import type { Role } from "@/types/workspace";

type Props = {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
  allowOwner: boolean;
  label: string;
};

export function RoleSelect({ value, onChange, disabled, allowOwner, label }: Props) {
  return (
    <select aria-label={label} value={value} disabled={disabled}
      onChange={(event) => onChange(event.target.value as Role)}
      className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm capitalize disabled:opacity-60">
      {ROLES.filter((role) => allowOwner || role !== "owner" || value === "owner")
        .map((role) => <option key={role} value={role}>{role}</option>)}
    </select>
  );
}
