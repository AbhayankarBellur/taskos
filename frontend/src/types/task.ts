export type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "critical" | "high" | "medium" | "low";

export type Task = {
  id: string; workspaceId: string; projectId: string; key: string;
  title: string; description: string; status: TaskStatus; priority: TaskPriority;
  assigneeId: string | null; reporterId: string | null; parentTaskId: string | null;
  blocked: boolean; blockerReason: string | null; dueDate: string | null;
  labels: string[]; archived: boolean; createdAt: string; updatedAt: string;
  completedAt: string | null;
};

export type TaskAssessment = {
  id: string; taskId: string; complexity: "low" | "medium" | "high";
  storyPoints: number; estimatedHours: number; risk: "low" | "medium" | "high";
  confidence: number; notes: string; assessedBy: string; createdAt: string;
};

export type TaskComment = {
  id: string; taskId: string; authorId: string; content: string; createdAt: string;
};

export type TaskEvent = {
  id: string; taskId: string; action: string;
  changes: Record<string, unknown>; createdAt: string;
};
