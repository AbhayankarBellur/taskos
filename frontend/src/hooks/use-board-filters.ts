import { useState, useMemo } from "react";
import { Task } from "@/types/task";

export function useBoardFilters(tasks: Task[]) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!showArchived && t.archived) return false;
      if (status !== "all" && t.status !== status) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchKey = t.key.toLowerCase().includes(q);
        if (!matchTitle && !matchKey) return false;
      }
      return true;
    });
  }, [tasks, search, status, priority, showArchived]);

  return {
    search, setSearch,
    status, setStatus,
    priority, setPriority,
    showArchived, setShowArchived,
    filteredTasks
  };
}
