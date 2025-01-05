import { generateMap, preprocessTreeTypes, drawMap, map } from "./scripts/map.js";
import { collectWood, collectStone } from "./scripts/resources.js";
import { addWorker, drawWorkers, workers, moveWorkerToTile } from "./scripts/workers.js";
import { loadTextures } from "./scripts/textures.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const rows = canvas.height / 50;
const cols = canvas.width / 50;

window.gameMap = map;

function drawMapWithWorkers() {
    drawMap(ctx);
    drawWorkers(ctx);
}

function findValidSpawnLocation() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (map[y][x].type === "grass") {
                return { x, y };
            }
        }
    }
    return { x: 0, y: 0 };
}

async function startGame() {
    try {
        await loadTextures();
        generateMap(rows, cols);
        preprocessTreeTypes();
        const spawnPoint = findValidSpawnLocation();
        addWorker(spawnPoint.x, spawnPoint.y);
        drawMapWithWorkers();
    } catch (error) {
        console.error('Failed to start game:', error);
    }
}

// Start the game
startGame();

// Helper functions
function isAdjacentToResource(workerX, workerY, resourceX, resourceY) {
    return (Math.abs(workerX - resourceX) === 1 && workerY === resourceY) ||
           (Math.abs(workerY - resourceY) === 1 && workerX === resourceX);
}

function createGatheringTask(resource, type) {
    return {
        resource: resource,
        type: type
    };
}

// Handle worker recruitment
document.getElementById("recruitWorker").addEventListener("click", () => {
    const spawnPoint = findValidSpawnLocation();
    addWorker(spawnPoint.x, spawnPoint.y);
    drawMapWithWorkers();
});

// Handle resource gathering
document.getElementById("gatherWood").addEventListener("click", () => {
    const selectedWorker = workers[0];
    if (selectedWorker && !selectedWorker.isMoving) {
        const nearestResource = findNearestResource(selectedWorker.x, selectedWorker.y, "forest");
        if (nearestResource) {
            const adjacentTile = findAdjacentGrassTile(nearestResource.x, nearestResource.y);
            if (adjacentTile) {
                selectedWorker.gatheringTask = createGatheringTask(nearestResource, "forest");
                
                moveWorkerToTile(selectedWorker, adjacentTile.x, adjacentTile.y, ctx, drawMapWithWorkers, () => {
                    if (selectedWorker.gatheringTask && 
                        isAdjacentToResource(selectedWorker.x, selectedWorker.y, 
                                          selectedWorker.gatheringTask.resource.x, 
                                          selectedWorker.gatheringTask.resource.y) &&
                        map[selectedWorker.gatheringTask.resource.y][selectedWorker.gatheringTask.resource.x].type === "forest") {
                        
                        collectWood(map, selectedWorker.gatheringTask.resource.x, selectedWorker.gatheringTask.resource.y, wood => {
                            document.getElementById("woodCount").textContent = wood;
                            drawMapWithWorkers();
                        });
                    } else {
                        console.log("Worker not properly positioned to gather resource");
                    }
                    selectedWorker.gatheringTask = null;
                });
            }
        }
    }
});

document.getElementById("gatherStone").addEventListener("click", () => {
    const selectedWorker = workers[0];
    if (selectedWorker && !selectedWorker.isMoving) {
        const nearestResource = findNearestResource(selectedWorker.x, selectedWorker.y, "stone");
        if (nearestResource) {
            const adjacentTile = findAdjacentGrassTile(nearestResource.x, nearestResource.y);
            if (adjacentTile) {
                selectedWorker.gatheringTask = createGatheringTask(nearestResource, "stone");
                
                moveWorkerToTile(selectedWorker, adjacentTile.x, adjacentTile.y, ctx, drawMapWithWorkers, () => {
                    if (selectedWorker.gatheringTask && 
                        isAdjacentToResource(selectedWorker.x, selectedWorker.y, 
                                          selectedWorker.gatheringTask.resource.x, 
                                          selectedWorker.gatheringTask.resource.y) &&
                        map[selectedWorker.gatheringTask.resource.y][selectedWorker.gatheringTask.resource.x].type === "stone") {
                        
                        collectStone(map, selectedWorker.gatheringTask.resource.x, selectedWorker.gatheringTask.resource.y, stone => {
                            document.getElementById("stoneCount").textContent = stone;
                            drawMapWithWorkers();
                        });
                    } else {
                        console.log("Worker not properly positioned to gather resource");
                    }
                    selectedWorker.gatheringTask = null;
                });
            }
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

function findAdjacentGrassTile(x, y) {
    const adjacentTiles = [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 }
    ];

    for (const tile of adjacentTiles) {
        if (tile.x >= 0 && tile.x < cols && tile.y >= 0 && tile.y < rows &&
            map[tile.y][tile.x].type === "grass") {
            return tile;
        }
    }

    return null;
}