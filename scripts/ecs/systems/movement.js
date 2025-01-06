// scripts/ecs/systems/movement.js
export class MovementSystem {
    constructor(spatialGrid) {
        this.spatialGrid = spatialGrid;
        this.movingEntities = new Map(); // entityId -> {path, callback}
        this.moveTimers = new Map(); // entityId -> accumulated time
        this.MOVE_TIME = 0.2; // seconds per tile
    }

    update(dt, world) {
        for (const entityId of this.movingEntities.keys()) {
            const moveData = this.movingEntities.get(entityId);
            const pos = world.getComponent(entityId, 'Position');
            const movement = world.getComponent(entityId, 'Movement');

            if (!movement.isMoving) {
                this.movingEntities.delete(entityId);
                this.moveTimers.delete(entityId);
                continue;
            }

            // Update move timer
            let timer = this.moveTimers.get(entityId) || 0;
            timer += dt;

            if (timer >= this.MOVE_TIME) {
                // Time to move to next tile
                timer = 0;
                const nextPos = moveData.path.shift();

                if (nextPos) {
                    // Update spatial grid first
                    this.spatialGrid.moveEntity(entityId, pos.x, pos.y, nextPos.x, nextPos.y);
                    
                    // Then update position
                    pos.x = nextPos.x;
                    pos.y = nextPos.y;
                }

                // Check if we're done moving
                if (moveData.path.length === 0) {
                    movement.isMoving = false;
                    this.movingEntities.delete(entityId);
                    this.moveTimers.delete(entityId);
                    if (moveData.callback) {
                        moveData.callback();
                    }
                }
            }

            this.moveTimers.set(entityId, timer);
        }
    }

    moveEntityTo(world, entityId, targetX, targetY, onArrive = null) {
        const pos = world.getComponent(entityId, 'Position');
        const movement = world.getComponent(entityId, 'Movement');

        if (!pos || !movement || movement.isMoving) return false;

        const path = this.findPath(world, pos.x, pos.y, targetX, targetY);
        
        if (path.length > 0) {
            movement.isMoving = true;
            this.movingEntities.set(entityId, {
                path: path,
                callback: onArrive
            });
            this.moveTimers.set(entityId, 0);
            return true;
        }

        return false;
    }

    findPath(world, startX, startY, targetX, targetY) {
        const queue = [{x: startX, y: startY, path: []}];
        const visited = new Set();
        const maxIterations = 100;
        let iterations = 0;

        while (queue.length > 0 && iterations < maxIterations) {
            iterations++;
            const current = queue.shift();
            const key = `${current.x},${current.y}`;

            if (current.x === targetX && current.y === targetY) {
                return current.path;
            }

            if (visited.has(key)) continue;
            visited.add(key);

            const adjacentTiles = [
                {x: current.x + 1, y: current.y},
                {x: current.x - 1, y: current.y},
                {x: current.x, y: current.y + 1},
                {x: current.x, y: current.y - 1}
            ];

            for (const tile of adjacentTiles) {
                const tileKey = `${tile.x},${tile.y}`;
                // Check both map passability AND entity occupation
                if (!visited.has(tileKey) && 
                    world.mapSystem.isPassable(tile.x, tile.y) &&
                    !this.spatialGrid.isTileOccupied(tile.x, tile.y, world)) {
                    queue.push({
                        x: tile.x,
                        y: tile.y,
                        path: [...current.path, {x: tile.x, y: tile.y}]
                    });
                }
            }
        }

        return []; // No path found
    }
}