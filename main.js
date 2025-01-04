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
  const grassTexture = document.getElementById("grassTexture");
  const forestTexture = document.getElementById("forestTexture");
  const stoneTexture = document.getElementById("stoneTexture");

  // Draw the map
  map.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (tile.type === "grass") {
        ctx.drawImage(grassTexture, colIndex * 50, rowIndex * 50, 50, 50);
      } else if (tile.type === "forest") {
        ctx.drawImage(forestTexture, colIndex * 50, rowIndex * 50, 50, 50);
      } else if (tile.type === "stone") {
        ctx.drawImage(stoneTexture, colIndex * 50, rowIndex * 50, 50, 50);
      }
    });
  });

  // Draw the workers
  drawWorkers(ctx);
}

// Redraw the map with workers
drawMapWithWorkers();

// Assign tasks to workers
document.getElementById("gatherWood").addEventListener("click", () => {
  if (selectedWorker) {
    const nearestResource = findNearestResource(selectedWorker.x, selectedWorker.y, "forest");
    if (nearestResource) {
      moveWorkerToTile(selectedWorker, nearestResource.x, nearestResource.y, ctx, drawMapWithWorkers, () => {
        if (selectedWorker.inventory < selectedWorker.capacity) {
          collectWood(map, wood => {
            document.getElementById("woodCount").textContent = wood;
            selectedWorker.inventory++;
          });
          drawMapWithWorkers();
        }
      });
    }
  }
});

document.getElementById("gatherStone").addEventListener("click", () => {
  if (selectedWorker) {
    const nearestResource = findNearestResource(selectedWorker.x, selectedWorker.y, "stone");
    if (nearestResource) {
      moveWorkerToTile(selectedWorker, nearestResource.x, nearestResource.y, ctx, drawMapWithWorkers, () => {
        if (selectedWorker.inventory < selectedWorker.capacity) {
          collectStone(map, stone => {
            document.getElementById("stoneCount").textContent = stone;
            selectedWorker.inventory++;
          });
          drawMapWithWorkers();
        }
      });
    }
  }
});

// Find the nearest resource tile of a specific type
function findNearestResource(x, y, type) {
  let nearest = null;
  let minDistance = Infinity;

  map.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (tile.type === type) {
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

// Event listener to recruit new workers
document.getElementById("recruitWorker").addEventListener("click", () => {
  const x = Math.floor(Math.random() * cols);
  const y = Math.floor(Math.random() * rows);
  addWorker(x, y);
  console.log(`Recruited new worker at (${x}, ${y})`);
  drawMapWithWorkers();
});
