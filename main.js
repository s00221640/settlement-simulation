import { generateMap, drawMap, map } from "./scripts/map.js";
import { collectWood, collectStone } from "./scripts/resources.js";
import { addWorker, drawWorkers, assignTask, workers, moveWorkerToTile } from "./scripts/workers.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const rows = canvas.height / 50;
const cols = canvas.width / 50;

// Initialize the game
generateMap(rows, cols);
addWorker(0, 0); // Add the first worker
let selectedWorker = workers[0]; // Default to the first worker

console.log("Workers at initialization:", workers);

function drawMapWithWorkers() {
  drawMap(ctx);
  drawWorkers(ctx); // Pass ctx to drawWorkers
}

// Redraw the map with workers
drawMapWithWorkers();

// Add AI for workers
function workerAI() {
  workers.forEach(worker => {
    if (!worker.task && !worker.isMoving) { // Prevent new tasks during movement
      const nearestResource = findNearestResource(worker.x, worker.y);
      if (nearestResource) {
        console.log(`Worker at (${worker.x}, ${worker.y}) moving to (${nearestResource.x}, ${nearestResource.y})`);
        worker.isMoving = true; // Mark worker as moving
        moveWorkerToTile(worker, nearestResource.x, nearestResource.y, () => {
          worker.isMoving = false; // Reset movement flag
          // Only assign the task if the worker is now on the resource tile
          if (worker.x === nearestResource.x && worker.y === nearestResource.y) {
            if (nearestResource.type === "forest") {
              assignTask(worker, "gatherWood", map, () => {
                collectWood(map, wood => {
                  document.getElementById("woodCount").textContent = wood;
                });
                drawMapWithWorkers();
              });
            } else if (nearestResource.type === "stone") {
              assignTask(worker, "gatherStone", map, () => {
                collectStone(map, stone => {
                  document.getElementById("stoneCount").textContent = stone;
                });
                drawMapWithWorkers();
              });
            }
          }
        });
      }
    }
  });
}

// Find the nearest resource tile (wood or stone)
function findNearestResource(x, y) {
  let nearest = null;
  let minDistance = Infinity;

  map.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (tile.type === "forest" || tile.type === "stone") {
        const distance = Math.abs(x - colIndex) + Math.abs(y - rowIndex);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = { ...tile, x: colIndex, y: rowIndex };
        }
      }
    });
  });

  return nearest;
}

// Run the worker AI every second
setInterval(workerAI, 1000);

// Event listener to recruit new workers
document.getElementById("recruitWorker").addEventListener("click", () => {
  const x = Math.floor(Math.random() * cols);
  const y = Math.floor(Math.random() * rows);
  addWorker(x, y);
  console.log(`Recruited new worker at (${x}, ${y})`);
  drawMapWithWorkers();
});
