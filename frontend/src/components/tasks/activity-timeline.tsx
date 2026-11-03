import { TaskEvent } from "@/types/task";

type Props = {
  events: TaskEvent[];
};

export function ActivityTimeline({ events }: Props) {
  return (
    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
      {events.map((e) => (
        <div key={e.id} className="flex items-center justify-between border-l-2 border-indigo-500 pl-2 text-xs">
          <span className="font-mono text-gray-800">{e.action}</span>
          <span className="text-gray-400 text-[10px]">
            {new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      ))}
      {events.length === 0 && <span className="text-xs text-gray-400">No events yet</span>}
    </div>
  );
}
