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
    let iterations = 0;
    const maxIterations = 50; // Limit path length

    while ((currentX !== targetX || currentY !== targetY) && iterations < maxIterations) {
        let nextX = currentX;
        let nextY = currentY;
        
        // Try to move towards target
        if (currentX < targetX && isPassable(map, currentX + 1, currentY)) {
            nextX = currentX + 1;
        } else if (currentX > targetX && isPassable(map, currentX - 1, currentY)) {
            nextX = currentX - 1;
        } else if (currentY < targetY && isPassable(map, currentX, currentY + 1)) {
            nextY = currentY + 1;
        } else if (currentY > targetY && isPassable(map, currentX, currentY - 1)) {
            nextY = currentY - 1;
        } else {
            // If can't move directly towards target, try to move around obstacles
            const possibleMoves = [
                {x: currentX + 1, y: currentY},
                {x: currentX - 1, y: currentY},
                {x: currentX, y: currentY + 1},
                {x: currentX, y: currentY - 1}
            ];

            const validMove = possibleMoves.find(move => 
                isPassable(map, move.x, move.y) && 
                !path.some(p => p.x === move.x && p.y === move.y)
            );

            if (validMove) {
                nextX = validMove.x;
                nextY = validMove.y;
            } else {
                break; // No valid moves found
            }
        }

        if (nextX === currentX && nextY === currentY) {
            break; // Stuck
        }

        currentX = nextX;
        currentY = nextY;
        path.push({x: currentX, y: currentY});
        iterations++;
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
    setTimeout(() => {
        worker.task = null;
        onComplete();
    }, 1000);
}