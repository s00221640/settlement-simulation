export const workers = [];

export function addWorker(x, y) {
  workers.push({ x, y, task: null, isMoving: false });
}

export function drawWorkers(ctx) {
  if (!ctx) {
    console.error("Context (ctx) is not defined in drawWorkers");
    return;
  }
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

export function moveWorkerToTile(worker, targetX, targetY, ctx, onArrive) {
  console.log(`Moving worker from (${worker.x}, ${worker.y}) to (${targetX}, ${targetY})`);

  const movementInterval = 500; // Adjust the interval for smoother movement (in ms)
  const interval = setInterval(() => {
    if (worker.x < targetX) worker.x++;
    else if (worker.x > targetX) worker.x--;
    else if (worker.y < targetY) worker.y++;
    else if (worker.y > targetY) worker.y--;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas
    drawWorkers(ctx); // Redraw workers as they move

    if (worker.x === targetX && worker.y === targetY) {
      clearInterval(interval);
      onArrive();
    }
  }, movementInterval); // Delay between movement steps
}
