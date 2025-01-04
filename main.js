import { generateMap, drawMap, map } from "./scripts/map.js";
import { collectWood, collectStone } from "./scripts/resources.js";
import { addWorker, drawWorkers, workers, moveWorkerToTile } from "./scripts/workers.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const rows = canvas.height / 50;
const cols = canvas.width / 50;

// Load textures
const grassTexture = new Image();
const forestTexture = new Image();
const stoneTexture = new Image();

grassTexture.src = "./textures/Grass.png";
forestTexture.src = "./textures/Forest.png";
stoneTexture.src = "./textures/Stone.png";

// Wait for all textures to load before rendering the map
const texturesLoaded = new Promise((resolve) => {
  let loadedCount = 0;
  const totalTextures = 3;

  const checkLoaded = () => {
    loadedCount++;
    if (loadedCount === totalTextures) resolve();
  };

  grassTexture.onload = checkLoaded;
  forestTexture.onload = checkLoaded;
  stoneTexture.onload = checkLoaded;
});

// Initialize the game
async function initializeGame() {
  await texturesLoaded; // Wait for textures to load
  generateMap(rows, cols);
  addWorker(0, 0); // Add the first worker
  drawMapWithWorkers();
  console.log("Game initialized:", workers, map);
}

function drawMapWithWorkers() {
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

  drawWorkers(ctx);
}

initializeGame();

// Assign tasks to workers
document.getElementById("gatherWood").addEventListener("click", () => {
  const selectedWorker = workers[0];
  if (selectedWorker) {
    const nearestResource = findNearestResource(selectedWorker.x, selectedWorker.y, "forest");
    if (nearestResource) {
      moveWorkerToTile(selectedWorker, nearestResource.x, nearestResource.y, ctx, drawMapWithWorkers, () => {
        if (selectedWorker.x === nearestResource.x && selectedWorker.y === nearestResource.y) {
          collectWood(map, nearestResource.x, nearestResource.y, wood => {
            document.getElementById("woodCount").textContent = wood;
            drawMapWithWorkers();
          });
        }
      });
    }
  }
});

document.getElementById("gatherStone").addEventListener("click", () => {
  const selectedWorker = workers[0];
  if (selectedWorker) {
    const nearestResource = findNearestResource(selectedWorker.x, selectedWorker.y, "stone");
    if (nearestResource) {
      moveWorkerToTile(selectedWorker, nearestResource.x, nearestResource.y, ctx, drawMapWithWorkers, () => {
        if (selectedWorker.x === nearestResource.x && selectedWorker.y === nearestResource.y) {
          collectStone(map, nearestResource.x, nearestResource.y, stone => {
            document.getElementById("stoneCount").textContent = stone;
            drawMapWithWorkers();
          });
        }
      });
    }
  }
});

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

// Recruit worker
document.getElementById("recruitWorker").addEventListener("click", () => {
  const x = Math.floor(Math.random() * cols);
  const y = Math.floor(Math.random() * rows);
  addWorker(x, y);
  drawMapWithWorkers();
});
