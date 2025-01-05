export const workers = [];

/**
 * Add a worker to the game at a specific position.
 * @param {number} x - X-coordinate of the worker.
 * @param {number} y - Y-coordinate of the worker.
 */
export function addWorker(x, y) {
  workers.push({ x, y, task: null, isMoving: false });
}

/**
 * Draw all workers on the canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas context for drawing.
 */
export function drawWorkers(ctx) {
  const workerTexture = document.getElementById("workerTexture");

  workers.forEach(worker => {
    ctx.drawImage(workerTexture, worker.x * 50, worker.y * 50, 50, 50);
  });
}

/**
 * Move a worker to a specified tile on the map.
 * @param {object} worker - The worker object.
 * @param {number} targetX - X-coordinate of the target position.
 * @param {number} targetY - Y-coordinate of the target position.
 * @param {CanvasRenderingContext2D} ctx - The canvas context for redrawing.
 * @param {function} drawMapWithWorkers - Callback to redraw the map and workers.
 * @param {function} onArrive - Callback to execute when the worker reaches the target.
 */
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

/**
 * Assign a task to a worker.
 * @param {object} worker - The worker object.
 * @param {string} task - The task to assign.
 * @param {Array} map - The game map.
 * @param {function} onComplete - Callback to execute when the task is complete.
 */
export function assignTask(worker, task, map, onComplete) {
  console.log(`Assigning task '${task}' to worker at (${worker.x}, ${worker.y})`);
  setTimeout(() => {
    worker.task = null; // Clear the task
    onComplete();
  }, 1000); // Simulated delay of 1 second
}
