// main.js
import { generateMap, preprocessTreeTypes, drawMap, map } from "./scripts/map.js";
import { collectWood, collectStone, woodCount, stoneCount } from "./scripts/resources.js";
import { addWorker, drawWorkers, workers, moveWorkerToTile } from "./scripts/workers.js";
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
    console.log(`Building mode: ${buildingMode ? "ON" : "OFF"}`);
});

canvas.addEventListener("mousedown", (event) => {
    if (!buildingMode) return;

    const startX = Math.floor(event.offsetX / 50);
    const startY = Math.floor(event.offsetY / 50);
    buildingStart = { x: startX, y: startY };
});

canvas.addEventListener("mouseup", (event) => {
    if (!buildingMode || !buildingStart) return;

    const endX = Math.floor(event.offsetX / 50);
    const endY = Math.floor(event.offsetY / 50);

    const startX = Math.min(buildingStart.x, endX);
    const startY = Math.min(buildingStart.y, endY);
    const width = Math.abs(buildingStart.x - endX) + 1;
    const height = Math.abs(buildingStart.y - endY) + 1;

    constructBuilding(startX, startY, width, height);
    buildingStart = null;
    drawMapWithEntities();
});

/**
 * Constructs a building on the map.
 * @param {number} startX - The starting X coordinate.
 * @param {number} startY - The starting Y coordinate.
 * @param {number} width - The width of the building.
 * @param {number} height - The height of the building.
 */
function constructBuilding(startX, startY, width, height) {
    let cost = { wood: 0, stone: 0 };
    const woodCostPerTile = 2;
    const stoneCostPerTile = 1;

    for (let y = startY; y < startY + height; y++) {
        for (let x = startX; x < startX + width; x++) {
            if (y >= 0 && y < rows && x >= 0 && x < cols) {
                if (map[y][x].type === "grass") {
                    cost.wood += woodCostPerTile;
                    cost.stone += stoneCostPerTile;

                    if (cost.wood > woodCount || cost.stone > stoneCount) {
                        console.log("Not enough resources to construct the building.");
                        return;
                    }

                    map[y][x].type = "building";
                }
            }
        }
    }

    woodCount -= cost.wood;
    stoneCount -= cost.stone;

    document.getElementById("woodCount").textContent = woodCount;
    document.getElementById("stoneCount").textContent = stoneCount;

    console.log(`Constructed building from (${startX}, ${startY}) with dimensions ${width}x${height}`);
}
