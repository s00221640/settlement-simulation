// buildings.js
import { map } from './map.js';
import { textures } from './textures.js';

export const BUILDING_STATES = {
    BLUEPRINT: 'blueprint',
    BUILDING: 'building',
    COMPLETE: 'complete'
};

export let currentBuilding = null;

// Building configuration
const MIN_SIZE = 3; // Minimum 3x3
const MAX_SIZE = 8; // Maximum 8x8
const WALL_COST = 5; // Wood cost per wall tile
const FLOOR_COST = 2; // Wood cost per floor tile

export function startPlacingBuilding() {
    if (currentBuilding) {
        console.log("Already have an unfinished building!");
        return false;
    }
    
    currentBuilding = {
        state: BUILDING_STATES.BLUEPRINT,
        startX: null,
        startY: null,
        endX: null,
        endY: null,
        tiles: [], // Will hold all building tiles
        walls: [], // Will hold wall tiles
        floors: [], // Will hold floor tiles
        door: null, // Will hold door position
        remainingWork: 0
    };
    return true;
}

export function isValidBuildingArea(startX, startY, endX, endY) {
    const width = Math.abs(endX - startX) + 1;
    const height = Math.abs(endY - startY) + 1;
    
    // Check size constraints
    if (width < MIN_SIZE || height < MIN_SIZE || width > MAX_SIZE || height > MAX_SIZE) {
        return false;
    }

    // Check if area is clear (only grass)
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            if (!map[y] || !map[y][x] || map[y][x].type !== 'grass') {
                return false;
            }
        }
    }
    
    return true;
}

export function confirmBuilding(startX, startY, endX, endY) {
    if (!currentBuilding || !isValidBuildingArea(startX, startY, endX, endY)) {
        return false;
    }

    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    // Calculate walls (perimeter)
    currentBuilding.walls = [];
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            if (y === minY || y === maxY || x === minX || x === maxX) {
                currentBuilding.walls.push({x, y, built: false});
            } else {
                currentBuilding.floors.push({x, y, built: false});
            }
        }
    }

    // Automatically set door in middle of one wall
    const doorX = minX + Math.floor((maxX - minX) / 2);
    currentBuilding.door = {x: doorX, y: maxY};
    
    // Remove door position from walls
    currentBuilding.walls = currentBuilding.walls.filter(
        wall => !(wall.x === currentBuilding.door.x && wall.y === currentBuilding.door.y)
    );

    // Calculate total work needed
    currentBuilding.remainingWork = 
        (currentBuilding.walls.length * WALL_COST) +
        (currentBuilding.floors.length * FLOOR_COST);

    currentBuilding.state = BUILDING_STATES.BUILDING;
    return true;
}

export function drawBuilding(ctx) {
    if (!currentBuilding) return;

    if (currentBuilding.state === BUILDING_STATES.BLUEPRINT) {
        // Draw blue transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
        currentBuilding.tiles.forEach(tile => {
            ctx.fillRect(tile.x * 50, tile.y * 50, 50, 50);
        });
    } else {
        // Draw walls (darker brown)
        ctx.fillStyle = '#654321';
        currentBuilding.walls.forEach(wall => {
            if (wall.built) {
                ctx.fillRect(wall.x * 50, wall.y * 50, 50, 50);
            }
        });

        // Draw floors (lighter brown)
        ctx.fillStyle = '#8B4513';
        currentBuilding.floors.forEach(floor => {
            if (floor.built) {
                ctx.fillRect(floor.x * 50, floor.y * 50, 50, 50);
            }
        });

        // Draw door (green)
        ctx.fillStyle = '#228B22';
        ctx.fillRect(currentBuilding.door.x * 50, currentBuilding.door.y * 50, 50, 50);
    }
}

export function workOnBuilding(worker, woodCount, updateWood) {
    if (!currentBuilding || currentBuilding.state !== BUILDING_STATES.BUILDING) return false;
    
    // Find nearest unbuilt tile
    const allTiles = [...currentBuilding.walls, ...currentBuilding.floors]
        .filter(tile => !tile.built);
    
    if (allTiles.length === 0) {
        currentBuilding.state = BUILDING_STATES.COMPLETE;
        currentBuilding = null;
        return false;
    }

    // Find closest unbuilt tile
    const nearest = allTiles.reduce((closest, tile) => {
        const dist = Math.abs(tile.x - worker.x) + Math.abs(tile.y - worker.y);
        if (!closest || dist < closest.dist) {
            return { tile, dist };
        }
        return closest;
    }, null);

    if (!nearest) return false;

    const cost = currentBuilding.walls.includes(nearest.tile) ? WALL_COST : FLOOR_COST;
    
    if (woodCount >= cost) {
        nearest.tile.built = true;
        currentBuilding.remainingWork -= cost;
        updateWood(woodCount - cost);
        return true;
    }

    return false;
}