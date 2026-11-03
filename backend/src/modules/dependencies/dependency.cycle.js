import { dependencyRepository } from "./dependency.repository.js";

export async function wouldCreateCycle(wsId, taskId, depId) {
  const tStr = taskId.toString();
  const dStr = depId.toString();
  if (tStr === dStr) return true;

  const queue = [depId];
  const visited = new Set([dStr]);

  while (queue.length > 0) {
    const current = queue.shift();
    const deps = await dependencyRepository.findByTaskId(wsId, current);
    for (const d of deps) {
      const nextStr = d.dependsOnTaskId.toString();
      if (nextStr === tStr) return true;
      if (!visited.has(nextStr)) {
        visited.add(nextStr);
        queue.push(d.dependsOnTaskId);
      }
    }
  }
  return false;
}
