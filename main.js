// main.js
import { generateMap, preprocessTreeTypes, drawMap, map, designateBuilding } from "./scripts/map.js";
import { collectWood, collectStone, woodCount, stoneCount, deductResources } from "./scripts/resources.js";
import { addWorker, drawWorkers, workers, moveWorkerToTile, assignWorkerToConstruction } from "./scripts/workers.js";
import { addWarrior, drawWarriors, warriors, moveWarriorToTile } from "./scripts/warriors.js";
import { addBear, drawBears, bears, moveBears, removeBear } from "./scripts/bears.js";
import { loadTextures } from "./scripts/textures.js";
import { isTileOccupied } from './scripts/utils.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const rows = canvas.height / 50;
const cols = canvas.width / 50;

window.gameMap = map;

let buildingMode = false;
let buildingStart = null;
let selectedBuildingType = 'house';

// Create building type dropdown
const buildingTypeSelect = document.createElement('select');
buildingTypeSelect.id = 'buildingType';
const buildingTypes = ['house', 'storage', 'barracks', 'workshop'];
buildingTypes.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    buildingTypeSelect.appendChild(option);
});
document.getElementById('ui').insertBefore(buildingTypeSelect, document.getElementById('startBuilding'));

// Function to draw all entities on the map
function drawMapWithEntities() {
    drawMap(ctx);
    drawWorkers(ctx);
    drawWarriors(ctx);
    drawBears(ctx);
}

// Find a random valid spawn location on grass
function findValidSpawnLocation() {
    for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * cols);
        const y = Math.floor(Math.random() * rows);
        if (map[y][x].type === "grass" && !isTileOccupied(x, y, workers, warriors, bears)) {
            return { x, y };
        }
    }
    return null;
}

// Start the game
async function startGame() {
    try {
        await loadTextures();
        generateMap(rows, cols);
        preprocessTreeTypes();

        // Spawn initial worker
        const workerSpawn = findValidSpawnLocation();
        if (workerSpawn) {
            addWorker(workerSpawn.x, workerSpawn.y);
        }

        // Spawn initial bears
        for (let i = 0; i < 3; i++) {
            const bearSpawn = findValidSpawnLocation();
            if (bearSpawn) {
                addBear(bearSpawn.x, bearSpawn.y);
            }
        }

        drawMapWithEntities();
    } catch (error) {
        console.error("Failed to start game:", error);
    }
}

startGame();

// Handle worker recruitment
document.getElementById("recruitWorker").addEventListener("click", () => {
    const spawnPoint = findValidSpawnLocation();
    if (spawnPoint) {
        addWorker(spawnPoint.x, spawnPoint.y);
        drawMapWithEntities();
    }
});

// Handle warrior recruitment
document.getElementById("recruitWarrior").addEventListener("click", () => {
    const spawnPoint = findValidSpawnLocation();
    if (spawnPoint) {
        addWarrior(spawnPoint.x, spawnPoint.y);
        drawMapWithEntities();
    }
});

// Handle resource gathering
document.getElementById("gatherWood").addEventListener("click", () => {
    const selectedWorker = workers[0];
    if (selectedWorker && !selectedWorker.isMoving) {
        const nearestResource = findNearestResource(selectedWorker.x, selectedWorker.y, "forest");
        if (nearestResource) {
            const adjacentTile = findAdjacentGrassTile(nearestResource.x, nearestResource.y);
            if (adjacentTile) {
                moveWorkerToTile(selectedWorker, adjacentTile.x, adjacentTile.y, ctx, drawMapWithEntities, () => {
                    collectWood(map, nearestResource.x, nearestResource.y, wood => {
                        document.getElementById("woodCount").textContent = wood;
                        drawMapWithEntities();
                    });
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
                moveWorkerToTile(selectedWorker, adjacentTile.x, adjacentTile.y, ctx, drawMapWithEntities, () => {
                    collectStone(map, nearestResource.x, nearestResource.y, stone => {
                        document.getElementById("stoneCount").textContent = stone;
                        drawMapWithEntities();
                    });
                });
            }
        }
    }
});

// Bears movement and combat interval
setInterval(() => {
    bears.forEach(bear => {
        moveBears(bear, ctx, drawMapWithEntities);
    });
}, 1000);

// Warriors combat interval
setInterval(() => {
    warriors.forEach(warrior => {
        if (warrior.health <= 0) return;

        // Look for bears in attack range
        const nearbyBears = bears.filter(bear =>
            bear.health > 0 &&
            Math.abs(bear.x - warrior.x) <= 1 &&
            Math.abs(bear.y - warrior.y) <= 1
        );

        if (nearbyBears.length > 0) {
            const target = nearbyBears[0];
            target.health -= warrior.damage;
            console.log(`Warrior attacked bear for ${warrior.damage} damage. Bear health: ${target.health}`);
            if (target.health <= 0) {
                removeBear(target);
            }
        }
    });

    drawMapWithEntities();
}, 1000);

// Helper function to find nearest resource
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

// Helper function to find adjacent grass tile
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

// Building mode logic
document.getElementById("startBuilding").addEventListener("click", () => {
    buildingMode = !buildingMode;
    selectedBuildingType = document.getElementById('buildingType').value;
    console.log(`Building mode: ${buildingMode ? "ON" : "OFF"}, Type: ${selectedBuildingType}`);
});

canvas.addEventListener("mousedown", (event) => {
    if (!buildingMode) return;

    const startX = Math.floor(event.offsetX / 50);
    const startY = Math.floor(event.offsetY / 50);
    buildingStart = { x: startX, y: startY };
});

canvas.addEventListener("mousemove", (event) => {
    if (!buildingMode || !buildingStart) return;
    
    const currentX = Math.floor(event.offsetX / 50);
    const currentY = Math.floor(event.offsetY / 50);
    
    // Redraw the map with preview
    drawMapWithEntities();
    
    // Draw preview rectangle
    const startX = Math.min(buildingStart.x, currentX);
    const startY = Math.min(buildingStart.y, currentY);
    const width = Math.abs(buildingStart.x - currentX) + 1;
    const height = Math.abs(buildingStart.y - currentY) + 1;
    
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = 'blue';
    ctx.fillRect(startX * 50, startY * 50, width * 50, height * 50);
    ctx.globalAlpha = 1.0;
});

canvas.addEventListener("mouseup", (event) => {
    if (!buildingMode || !buildingStart) return;

    const endX = Math.floor(event.offsetX / 50);
    const endY = Math.floor(event.offsetY / 50);

    const startX = Math.min(buildingStart.x, endX);
    const startY = Math.min(buildingStart.y, endY);
    const width = Math.abs(buildingStart.x - endX) + 1;
    const height = Math.abs(buildingStart.y - endY) + 1;

    if (designateBuilding(startX, startY, width, height, selectedBuildingType)) {
        console.log(`Designated ${selectedBuildingType} from (${startX}, ${startY}) with dimensions ${width}x${height}`);
        // Assign available workers to start construction
        workers.forEach(worker => {
            if (!worker.task) {
                assignWorkerToConstruction(worker);
            }
        });
    }

    buildingStart = null;
    drawMapWithEntities();
});
