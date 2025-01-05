// scripts/bears.js
import { isTileOccupied } from './utils.js';
import { workers } from './workers.js';
import { warriors } from './warriors.js';
import { map } from './map.js';
import { textures } from './textures.js';
import { initializeHealth, drawHealthBar, attack } from './combat.js';

export const bears = [];

export function addBear(x, y) {
    const bear = { x, y, type: 'bear' };
    initializeHealth(bear, 'bear');
    bears.push(bear);
}

export function drawBears(ctx) {
    if (!textures.bear) return;
    bears.forEach(bear => {
        if (bear.health <= 0) return;
        ctx.drawImage(textures.bear, bear.x * 50, bear.y * 50, 50, 50);
        drawHealthBar(ctx, bear);
    });
}

export function removeBear(bear) {
    const index = bears.indexOf(bear);
    if (index > -1) {
        bears.splice(index, 1);
    }
}

export function moveBears(bear, ctx, drawMapWithEntities) {
    if (!bear || bear.health <= 0) return;
    
    // Check for nearby targets first
    const targets = [...workers, ...warriors].filter(target => 
        target.health > 0 && 
        Math.abs(target.x - bear.x) <= 1 && 
        Math.abs(target.y - bear.y) <= 1
    );
    
    if (targets.length > 0) {
        // Attack nearest target
        const target = targets[0];
        if (attack(bear, target)) {
            // Target died
            if (target.type === 'worker') {
                const index = workers.indexOf(target);
                if (index > -1) workers.splice(index, 1);
            } else {
                const index = warriors.indexOf(target);
                if (index > -1) warriors.splice(index, 1);
            }
        }
        return; // Don't move after attacking
    }

    // If no targets in range, move normally
    const adjacentTiles = [
        { x: bear.x + 1, y: bear.y },
        { x: bear.x - 1, y: bear.y },
        { x: bear.x, y: bear.y + 1 },
        { x: bear.x, y: bear.y - 1 }
    ];

    const validMoves = adjacentTiles.filter(tile =>
        tile.x >= 0 && tile.x < map[0].length &&
        tile.y >= 0 && tile.y < map.length &&
        map[tile.y][tile.x].type === "grass" &&
        !isTileOccupied(tile.x, tile.y, workers, warriors, bears)
    );

    if (validMoves.length > 0) {
        const moveTo = validMoves[Math.floor(Math.random() * validMoves.length)];
        bear.x = moveTo.x;
        bear.y = moveTo.y;
    }
}