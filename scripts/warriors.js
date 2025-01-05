import { textures } from './textures.js';
import { initializeHealth, drawHealthBar } from './combat.js';

export const warriors = [];

/**
 * Adds a warrior to the game at a specified position.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 */
export function addWarrior(x, y) {
    const warrior = { x, y, type: 'warrior', isMoving: false };
    initializeHealth(warrior, 'warrior');
    warriors.push(warrior);
}

/**
 * Draws all warriors on the game canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 */
export function drawWarriors(ctx) {
    warriors.forEach(warrior => {
        if (warrior.health <= 0) return; // Don't draw dead warriors
        ctx.drawImage(textures.warrior, warrior.x * 50, warrior.y * 50, 50, 50);
        drawHealthBar(ctx, warrior);
    });
}

/**
 * Moves a warrior to a specified tile using simple pathfinding.
 * @param {Object} warrior - The warrior object.
 * @param {number} targetX - The target x-coordinate.
 * @param {number} targetY - The target y-coordinate.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {Function} drawMapWithEntities - A function to redraw the map and entities.
 * @param {Function} onArrive - A callback function executed when the warrior reaches the target.
 */
export function moveWarriorToTile(warrior, targetX, targetY, ctx, drawMapWithEntities, onArrive) {
    if (warrior.isMoving || warrior.health <= 0) return;

    const path = findSimplePath(window.gameMap, warrior.x, warrior.y, targetX, targetY);
    if (path.length === 0) {
        console.log("Cannot reach target");
        return;
    }

    warrior.isMoving = true;
    let step = 0;

    const moveInterval = setInterval(() => {
        if (step >= path.length) {
            clearInterval(moveInterval);
            warrior.isMoving = false;
            onArrive();
            return;
        }

        warrior.x = path[step].x;
        warrior.y = path[step].y;
        step++;

        drawMapWithEntities();
    }, 200); // Move every 200ms
}

/**
 * Determines if a tile is passable for movement.
 * @param {Array} map - The game map.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {boolean} True if the tile is passable; otherwise, false.
 */
function isPassable(map, x, y) {
    return x >= 0 && x < map[0].length && y >= 0 && y < map.length && map[y][x].type === "grass";
}

/**
 * Finds a simple path from a start position to a target position.
 * @param {Array} map - The game map.
 * @param {number} startX - The start x-coordinate.
 * @param {number} startY - The start y-coordinate.
 * @param {number} targetX - The target x-coordinate.
 * @param {number} targetY - The target y-coordinate.
 * @returns {Array} The path as an array of coordinates.
 */
function findSimplePath(map, startX, startY, targetX, targetY) {
    let path = [];
    let currentX = startX;
    let currentY = startY;
    let iterations = 0;
    const maxIterations = 50;

    while ((currentX !== targetX || currentY !== targetY) && iterations < maxIterations) {
        let nextX = currentX;
        let nextY = currentY;

        // Move toward the target
        if (currentX < targetX && isPassable(map, currentX + 1, currentY)) {
            nextX = currentX + 1;
        } else if (currentX > targetX && isPassable(map, currentX - 1, currentY)) {
            nextX = currentX - 1;
        } else if (currentY < targetY && isPassable(map, currentX, currentY + 1)) {
            nextY = currentY + 1;
        } else if (currentY > targetY && isPassable(map, currentX, currentY - 1)) {
            nextY = currentY - 1;
        } else {
            // No direct path, break to avoid infinite loop
            break;
        }

        currentX = nextX;
        currentY = nextY;
        path.push({ x: currentX, y: currentY });
        iterations++;
    }

    return path;
}