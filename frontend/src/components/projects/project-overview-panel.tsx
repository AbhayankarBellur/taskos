import { computeProjectStats } from "@/lib/project-stats";
import { Progress } from "../ui/progress";
import { Task } from "@/types/task";

export function ProjectOverviewPanel({ tasks }: { tasks: Task[] }) {
  const stats = computeProjectStats(tasks);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500 font-medium">Total Tasks</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500 font-medium">Completed ({stats.percent}%)</div>
          <div className="mt-1 text-2xl font-bold text-green-600">{stats.completed}</div>
          <Progress value={stats.percent} className="mt-2" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500 font-medium">In Progress</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">{stats.inProgress}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-500 font-medium">Blocked / Overdue</div>
          <div className="mt-1 text-2xl font-bold text-red-600">
            {stats.blocked} <span className="text-sm font-normal text-gray-400">/ {stats.overdue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
