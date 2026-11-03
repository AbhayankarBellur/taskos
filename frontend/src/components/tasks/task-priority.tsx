import { TaskPriority as PriorityType } from "@/types/task";

const styles: Record<PriorityType, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-gray-100 text-gray-700 border-gray-200"
};

export function TaskPriority({ priority }: { priority: PriorityType }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium capitalize ${styles[priority] || styles.medium}`}
    >
      {priority}
    </span>
  );
}
