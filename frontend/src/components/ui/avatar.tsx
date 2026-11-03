import { cn } from "@/lib/utils";

type Props = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Avatar({ name, size = "md", className }: Props) {
  const initials = (name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base"
  };

  return (
    <div
      aria-hidden
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700",
        sizeClasses[size],
        className
      )}
    >
      {initials || "?"}
    </div>
  );
}
