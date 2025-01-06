// main.js
import { World } from './scripts/ecs/core.js';
import { SpatialGrid } from './scripts/ecs/spatial.js';
import { MovementSystem } from './scripts/ecs/systems/movement.js';
import { CombatSystem } from './scripts/ecs/systems/combat.js';
import { MapSystem } from './scripts/ecs/systems/map.js';
import { createWorker, createWarrior, createBear, createTree, createStone } from './scripts/ecs/components.js';
import * as textures from './scripts/textures.js';
import { JobSystem } from './scripts/ecs/systems/job.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const TILE_SIZE = 50;

const world = new World();
const spatialGrid = new SpatialGrid(4);
const mapSystem = new MapSystem(canvas.width / TILE_SIZE, canvas.height / TILE_SIZE, TILE_SIZE);
const movementSystem = new MovementSystem(spatialGrid);
const combatSystem = new CombatSystem(spatialGrid);
const jobSystem = new JobSystem(movementSystem, mapSystem);

// Add systems
world.addSystem(movementSystem);
world.addSystem(combatSystem);
world.addSystem(jobSystem);

let gameTexturesLoaded = false;

async function startGame() {
    try {
        // Load textures first
        await textures.loadTextures();
        gameTexturesLoaded = true;

        // Generate terrain
        mapSystem.generateMap();

        // Spawn initial entities
        spawnEntityAtRandomLocation(createWorker);
        for (let i = 0; i < 3; i++) {
            spawnEntityAtRandomLocation(createBear);
        }

        // Start game loop
        let lastTime = 0;
        function gameLoop(timestamp) {
            const dt = (timestamp - lastTime) / 1000;
            lastTime = timestamp;

            world.update(dt);
            drawGame();
            requestAnimationFrame(gameLoop);
        }
        requestAnimationFrame(gameLoop);

    } catch (error) {
        console.error("Failed to start game:", error);
    }
}

function drawGame() {
    if (!gameTexturesLoaded) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map
    mapSystem.draw(ctx, textures.textures);

    // Draw each entity with Position and Sprite
    const renderableEntities = world.query('Position', 'Sprite');
    for (const entityId of renderableEntities) {
        const pos = world.getComponent(entityId, 'Position');
        const sprite = world.getComponent(entityId, 'Sprite');
        const health = world.getComponent(entityId, 'Health');

        const texture = textures.textures[sprite.texture];
        if (texture) {
            ctx.drawImage(texture, pos.x * TILE_SIZE, pos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            
            // Draw health bar if entity has health
            if (health) {
                const healthPercent = health.current / health.max;
                const barWidth = 40;
                const barHeight = 4;
                const barX = pos.x * TILE_SIZE + (TILE_SIZE - barWidth) / 2;
                const barY = pos.y * TILE_SIZE - 8;

                ctx.fillStyle = '#ff0000';
                ctx.fillRect(barX, barY, barWidth, barHeight);
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
            }
        }
    }
}

function createEntity(components) {
    const entityId = world.createEntity();
    for (const [componentName, data] of Object.entries(components)) {
        world.addComponent(entityId, componentName, data);
    }
    
    // Add to spatial grid if entity has position
    if (components.Position) {
        spatialGrid.addEntity(entityId, components.Position.x, components.Position.y);
    }
    
    return entityId;
}

function spawnEntityAtRandomLocation(entityCreator) {
    for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * (canvas.width / TILE_SIZE));
        const y = Math.floor(Math.random() * (canvas.height / TILE_SIZE));
        
        if (mapSystem.isPassable(x, y) && !spatialGrid.isTileOccupied(x, y, world)) {
            return createEntity(entityCreator(x, y));
        }
    }
    return null;
}

// Event handler for clicking on the canvas
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);

    // Get clicked tile info from map
    const tile = mapSystem.getTile(x, y);
    if (tile) {
        console.log(`Clicked tile at (${x}, ${y}): ${tile.type}`);
    }
});

// UI Event Handlers
document.getElementById("recruitWorker").addEventListener("click", () => {
    spawnEntityAtRandomLocation(createWorker);
});

document.getElementById("recruitWarrior").addEventListener("click", () => {
    spawnEntityAtRandomLocation(createWarrior);
});

document.getElementById("gatherWood").addEventListener("click", () => {
    const workers = world.query('Position', 'Job');
    if (workers.length > 0) {
        const workerId = workers[0]; // Use first available worker
        jobSystem.assignGatheringJob(world, workerId, 'forest');
    }
});

document.getElementById("gatherStone").addEventListener("click", () => {
    const workers = world.query('Position', 'Job');
    if (workers.length > 0) {
        const workerId = workers[0]; // Use first available worker
        jobSystem.assignGatheringJob(world, workerId, 'stone');
    }
});

startGame();