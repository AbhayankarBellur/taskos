import { cn } from "@/lib/utils";

type Props = { name: string; className?: string };

export function Avatar({ name, className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-100",
        "text-sm font-semibold text-indigo-700",
        className
      )}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </div>
  );
}
