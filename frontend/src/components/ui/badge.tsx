import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  color?: "green" | "blue" | "red" | "gray" | "yellow";
};

const colors = {
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-700",
  yellow: "bg-yellow-100 text-yellow-700"
};

export function Badge({ children, color = "gray" }: Props) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs", colors[color])}>
      {children}
    </span>
  );
}
