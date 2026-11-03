export function assertNotArchived(task) {
  if (task && task.archived) {
    const err = new Error("Cannot modify an archived task");
    err.statusCode = 409;
    throw err;
  }
}

export function validateStatusTransition(task, newStatus, unfinDeps = []) {
  if (newStatus === "done") {
    if (task.blocked) {
      const err = new Error("Cannot complete a blocked task");
      err.statusCode = 400;
      throw err;
    }
    if (unfinDeps.length > 0) {
      const err = new Error(
        "Cannot complete task with unfinished dependencies"
      );
      err.statusCode = 400;
      throw err;
    }
  }
}

export function computeCompletedAt(oldStatus, newStatus) {
  if (newStatus === "done" && oldStatus !== "done") return new Date();
  if (newStatus !== "done" && oldStatus === "done") return null;
  return undefined;
}
