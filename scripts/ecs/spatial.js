// scripts/ecs/spatial.js
export class SpatialGrid {
    constructor(cellSize = 4) { // 4x4 tile chunks by default
        this.cellSize = cellSize;
        this.cells = new Map(); // Map<"x,y", Set<entityId>>
    }

    _getCellKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }

    _getCell(key, create = false) {
        if (!this.cells.has(key) && create) {
            this.cells.set(key, new Set());
        }
        return this.cells.get(key);
    }

    addEntity(entityId, x, y) {
        const key = this._getCellKey(x, y);
        const cell = this._getCell(key, true);
        cell.add(entityId);
    }

    removeEntity(entityId, x, y) {
        const key = this._getCellKey(x, y);
        const cell = this._getCell(key);
        if (cell) {
            cell.delete(entityId);
            if (cell.size === 0) {
                this.cells.delete(key);
            }
        }
    }

    moveEntity(entityId, oldX, oldY, newX, newY) {
        const oldKey = this._getCellKey(oldX, oldY);
        const newKey = this._getCellKey(newX, newY);

        if (oldKey !== newKey) {
            this.removeEntity(entityId, oldX, oldY);
            this.addEntity(entityId, newX, newY);
        }
    }

    getNearbyEntities(x, y, range) {
        const minCellX = Math.floor((x - range) / this.cellSize);
        const maxCellX = Math.floor((x + range) / this.cellSize);
        const minCellY = Math.floor((y - range) / this.cellSize);
        const maxCellY = Math.floor((y + range) / this.cellSize);

        const entities = new Set();

        for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
            for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
                const key = `${cellX},${cellY}`;
                const cell = this._getCell(key);
                if (cell) {
                    for (const entityId of cell) {
                        entities.add(entityId);
                    }
                }
            }
        }

        return entities;
    }

    isTileOccupied(x, y, world) {
        const entities = this.getNearbyEntities(x, y, 1);
        for (const entityId of entities) {
            const pos = world.getComponent(entityId, 'Position');
            if (pos && pos.x === x && pos.y === y) {
                return true;
            }
        }
        return false;
    }
}