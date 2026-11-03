import { TaskStatus as StatusType } from "@/types/task";

const styles: Record<StatusType, string> = {
  backlog: "bg-gray-100 text-gray-700",
  todo: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  in_review: "bg-purple-100 text-purple-700",
  done: "bg-green-100 text-green-700"
};

const labels: Record<StatusType, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done"
};

export function TaskStatus({ status }: { status: StatusType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || styles.backlog}`}
    >
      {labels[status] || status}
    </span>
  );
}
