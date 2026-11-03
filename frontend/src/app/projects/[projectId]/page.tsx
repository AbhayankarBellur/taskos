"use client";

import { use, Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { TaskManager } from "@/components/tasks/task-manager";
import { useTasks } from "@/hooks/use-tasks";

function ProjectContent({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { tasks, loading, error, refresh } = useTasks(projectId);

  return (
    <div className="flex flex-col gap-6">
      {loading && <div className="text-sm text-gray-500">Loading tasks...</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <TaskManager tasks={tasks} projectId={projectId} onRefresh={refresh} />
      )}
    </div>
  );
}

export default function ProjectTasksPage({
  params
}: { params: Promise<{ projectId: string }> }) {
  return (
    <AppShell>
      <Suspense fallback={<div className="text-sm text-gray-500">Loading project...</div>}>
        <ProjectContent params={params} />
      </Suspense>
    </AppShell>
  );
}
