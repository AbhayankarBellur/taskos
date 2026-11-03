import { computeProjectStats } from "@/lib/project-stats";
import { Task } from "@/types/task";
import { Avatar } from "../ui/avatar";

export function ProjectWorkload({ tasks }: { tasks: Task[] }) {
  const { priorities, assignees } = computeProjectStats(tasks);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Priority Breakdown</h4>
        <div className="flex flex-col gap-2">
          {Object.entries(priorities).map(([p, count]) => (
            <div key={p} className="flex justify-between items-center text-xs">
              <span className="capitalize font-medium text-gray-700">{p}</span>
              <span className="rounded bg-gray-100 px-2 py-0.5 font-bold text-gray-800">{count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Assignee Workload</h4>
        <div className="flex flex-col gap-2">
          {Object.entries(assignees).map(([a, count]) => (
            <div key={a} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <Avatar name={a} size="sm" />
                <span className="font-mono text-gray-700">{a}</span>
              </div>
              <span className="rounded bg-gray-100 px-2 py-0.5 font-bold text-gray-800">{count} tasks</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
