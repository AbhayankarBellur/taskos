import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Task, TaskStatus } from "@/types/task";
import { SwimlaneMode, groupTasksBySwimlane } from "@/lib/board-utils";
import { SwimlaneRow } from "./swimlane-row";

type Props = {
  tasks: Task[];
  swimlane: SwimlaneMode;
  onSelect: (t: Task) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
};

export function KanbanBoard({ tasks, swimlane, onSelect, onStatusChange }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const groups = groupTasksBySwimlane(tasks, swimlane);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const task = active.data?.current?.task as Task;
    const newStatus = String(over.id) as TaskStatus;
    if (task && task.status !== newStatus) {
      onStatusChange(task, newStatus);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <SwimlaneRow
            key={group.id}
            title={group.title}
            tasks={group.tasks}
            onSelect={onSelect}
            columnPrefix={`${group.id}-`}
          />
        ))}
      </div>
    </DndContext>
  );
}
