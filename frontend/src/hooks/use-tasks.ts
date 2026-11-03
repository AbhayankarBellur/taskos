"use client";

import { useEffect, useState, useCallback } from "react";
import { Task } from "@/types/task";
import { taskApi } from "@/lib/task-api";

export function useTasks(projectId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    taskApi.list(projectId)
      .then(setTasks)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  const refresh = useCallback(() => {
    if (!projectId) return;
    taskApi.list(projectId).then(setTasks).catch((err: Error) => setError(err.message));
  }, [projectId]);

  return { tasks, loading, error, refresh, setTasks };
}
