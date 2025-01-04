export const workers = [];

export function addWorker() {
  workers.push({ id: workers.length + 1, task: null });
}
