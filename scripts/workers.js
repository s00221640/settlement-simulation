export const workers = [];

export function addWorker(x, y) {
  workers.push({ x, y, task: null, isMoving: false });
}

export function drawWorkers(ctx) {
  workers.forEach(worker => {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(
      worker.x * 50 + 25, // Center of the tile
      worker.y * 50 + 25,
      10, // Worker size
      0,
      Math.PI * 2
    );
    ctx.fill();
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

export function moveWorkerToTile(worker, targetX, targetY, onArrive) {
  console.log(`Moving worker from (${worker.x}, ${worker.y}) to (${targetX}, ${targetY})`);

  // Simulate worker movement (tile by tile)
  const interval = setInterval(() => {
    if (worker.x < targetX) worker.x++;
    else if (worker.x > targetX) worker.x--;
    else if (worker.y < targetY) worker.y++;
    else if (worker.y > targetY) worker.y--;

    drawWorkers(ctx); // Redraw workers as they move

    if (worker.x === targetX && worker.y === targetY) {
      clearInterval(interval);
      onArrive();
    }
  }, 300); // Simulate movement delay per step
}
