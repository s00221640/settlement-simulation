export const workers = [];

export function addWorker(x, y) {
  workers.push({ x, y, task: null, isMoving: false, inventory: 0, capacity: 10 });
}

export function drawWorkers(ctx) {
  const workerTexture = document.getElementById("workerTexture");

  workers.forEach(worker => {
    ctx.drawImage(workerTexture, worker.x * 50, worker.y * 50, 50, 50);
  });
}

export function assignTask(worker, task, map, onComplete) {
  if (!worker) return;
  console.log(`Assigning task '${task}' to worker at (${worker.x}, ${worker.y})`);
  worker.task = task;

  setTimeout(() => {
    if (task === "gatherWood" || task === "gatherStone") {
      onComplete();
    }
    worker.task = null;
  }, 1000); // Simulated delay of 1 second
}

export function moveWorkerToTile(worker, targetX, targetY, ctx, drawMapWithWorkers, onArrive) {
  console.log(`Moving worker from (${worker.x}, ${worker.y}) to (${targetX}, ${targetY})`);

  const movementInterval = 200; // Adjust for smoother movement (in ms)
  const interval = setInterval(() => {
    if (worker.x < targetX) worker.x++;
    else if (worker.x > targetX) worker.x--;
    else if (worker.y < targetY) worker.y++;
    else if (worker.y > targetY) worker.y--;

    drawMapWithWorkers(); // Redraw map and workers at every step

    if (worker.x === targetX && worker.y === targetY) {
      clearInterval(interval);
      onArrive();
    }
  }, movementInterval); // Delay between movement steps
}
