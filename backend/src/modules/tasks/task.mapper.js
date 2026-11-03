export function toTaskDTO(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    workspaceId: doc.workspaceId?.toString(),
    projectId: doc.projectId?.toString(),
    key: doc.key,
    title: doc.title,
    description: doc.description || "",
    status: doc.status,
    priority: doc.priority,
    assigneeId: doc.assigneeId ? doc.assigneeId.toString() : null,
    reporterId: doc.reporterId ? doc.reporterId.toString() : null,
    parentTaskId: doc.parentTaskId ? doc.parentTaskId.toString() : null,
    blocked: Boolean(doc.blocked),
    blockerReason: doc.blockerReason || null,
    dueDate: doc.dueDate || null,
    labels: doc.labels || [],
    archived: Boolean(doc.archived),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    completedAt: doc.completedAt || null
  };
}
