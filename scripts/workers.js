import { textures } from './textures.js';
import { updateConstructionProgress } from './map.js';
import { deductResources } from './resources.js';

export const workers = [];

export function addWorker(x, y) {
    workers.push({ 
        x, 
        y, 
        task: null, 
        isMoving: false, 
        gatheringTask: null 
    });
}

export function drawWorkers(ctx) {
    workers.forEach(worker => {
        ctx.drawImage(textures.worker, worker.x * 50, worker.y * 50, 50, 50);
        
        // Draw task indicator if worker is constructing
        if (worker.task === 'constructing') {
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(worker.x * 50 + 25, worker.y * 50 - 5, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function isPassable(map, x, y) {
    return x >= 0 && x < map[0].length && y >= 0 && y < map.length && 
           (map[y][x].type === "grass" || 
            (map[y][x].designatedStructure && map[y][x].constructionProgress >= 100));
}

function findSimplePath(map, startX, startY, targetX, targetY) {
    let path = [];
    let currentX = startX;
    let currentY = startY;
    let visited = new Set();
    const maxIterations = 50; // Limit path length

    while ((currentX !== targetX || currentY !== targetY) && path.length < maxIterations) {
        visited.add(`${currentX},${currentY}`);
        
        let nextMove = null;
        let minDistance = Infinity;

        // Check all possible moves
        const moves = [
            { x: currentX + 1, y: currentY },
            { x: currentX - 1, y: currentY },
            { x: currentX, y: currentY + 1 },
            { x: currentX, y: currentY - 1 }
        ];

        for (const move of moves) {
            if (isPassable(map, move.x, move.y) && !visited.has(`${move.x},${move.y}`)) {
                const distance = Math.abs(move.x - targetX) + Math.abs(move.y - targetY);
                if (distance < minDistance) {
                    minDistance = distance;
                    nextMove = move;
                }
            }
        }

        if (!nextMove) {
            console.log("No valid moves found, stuck");
            break; // No valid moves
        }

        path.push(nextMove);
        currentX = nextMove.x;
        currentY = nextMove.y;
    }

    if (currentX !== targetX || currentY !== targetY) {
        console.log("Failed to reach target:", { startX, startY, targetX, targetY });
        return [];
    }

    return path;
}

export function moveWorkerToTile(worker, targetX, targetY, ctx, drawMapWithWorkers, onArrive) {
    if (worker.isMoving) return;
    
    const path = findSimplePath(window.gameMap, worker.x, worker.y, targetX, targetY);
    if (path.length === 0) {
        console.log("Cannot reach target");
        return;
    }
    
    worker.isMoving = true;
    let step = 0;
    
    const moveInterval = setInterval(() => {
        if (step >= path.length) {
            clearInterval(moveInterval);
            worker.isMoving = false;
            onArrive();
            return;
        }
        
        worker.x = path[step].x;
        worker.y = path[step].y;
        step++;
        
        drawMapWithWorkers();
    }, 200);
}

export function assignTask(worker, task, onComplete) {
    worker.task = task;
    if (task === 'constructing') {
        // Construction tasks don't auto-complete, they're managed by the construction system
        return;
    }
    setTimeout(() => {
        worker.task = null;
        onComplete();
    }, 1000);
}

function findNearestUnconstructedTile(worker) {
    let nearest = null;
    let minDistance = Infinity;

    window.gameMap.forEach((row, y) => {
        row.forEach((tile, x) => {
            if (tile.designatedStructure && tile.constructionProgress < 100) {
                const distance = Math.abs(worker.x - x) + Math.abs(worker.y - y);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = { x, y };
                }
            }
        });
    });

    return nearest;
}

export function assignWorkerToConstruction(worker) {
    if (worker.task || worker.isMoving) return;

    const constructionSite = findNearestUnconstructedTile(worker);
    if (!constructionSite) return;

    assignTask(worker, 'constructing', () => {});

    function continueConstruction() {
        const targetTile = window.gameMap[constructionSite.y][constructionSite.x];
        if (!targetTile.designatedStructure || targetTile.constructionProgress >= 100) {
            worker.task = null;
            return;
        }

        // Find adjacent tile to work from
        const adjacentTiles = [
            { x: constructionSite.x + 1, y: constructionSite.y },
            { x: constructionSite.x - 1, y: constructionSite.y },
            { x: constructionSite.x, y: constructionSite.y + 1 },
            { x: constructionSite.x, y: constructionSite.y - 1 }
        ];

        let workTile = adjacentTiles.find(tile => 
            tile.x >= 0 && tile.x < window.gameMap[0].length &&
            tile.y >= 0 && tile.y < window.gameMap.length &&
            window.gameMap[tile.y][tile.x].type === "grass"
        );

        if (!workTile) {
            worker.task = null;
            return;
        }

        moveWorkerToTile(worker, workTile.x, workTile.y, null, () => {}, () => {
            // Check if we have enough resources
            if (woodCount >= 2 && stoneCount >= 1) {
                deductResources(2, 1);
                if (updateConstructionProgress(constructionSite.x, constructionSite.y, 20)) {
                    // Construction completed
                    worker.task = null;
                } else {
                    // Continue construction
                    setTimeout(continueConstruction, 1000);
                }
            } else {
                // Not enough resources, but keep trying
                targetTile.constructionPaused = true;
                setTimeout(continueConstruction, 1000);
            }
        });
    }

    continueConstruction();
}