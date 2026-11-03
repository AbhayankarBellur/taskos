import { cn } from "@/lib/utils";

type Props = {
  value: number;
  className?: string;
};

export function Progress({ value, className }: Props) {
  const clamped = Math.min(100, Math.max(0, value || 0));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-gray-200", className)}>
      <div
        className="h-full bg-indigo-600 transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
