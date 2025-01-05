import { textures } from './textures.js';

export const workers = [];

export function addWorker(x, y) {
    workers.push({ x, y, task: null, isMoving: false, gatheringTask: null });
}

export function drawWorkers(ctx) {
    workers.forEach(worker => {
        ctx.drawImage(textures.worker, worker.x * 50, worker.y * 50, 50, 50);
    });
}

function isPassable(map, x, y) {
    return x >= 0 && x < map[0].length && y >= 0 && y < map.length && map[y][x].type === "grass";
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

    console.log("Path found:", path);
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
    setTimeout(() => {
        worker.task = null;
        onComplete();
    }, 1000);
}