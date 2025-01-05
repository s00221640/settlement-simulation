// bears.js
import { isTileOccupied } from './utils.js';
import { workers } from './workers.js';
import { warriors } from './warriors.js';
import { map } from './map.js';
import { textures } from './textures.js';

export const bears = [];

export function addBear(x, y) {
    const bear = { 
        x, 
        y, 
        health: 150,
        damage: 30,
        type: 'bear'
    };
    bears.push(bear);
}

export function removeBear(bear) {
    const index = bears.indexOf(bear);
    if (index > -1) {
        bears.splice(index, 1);
    }
}

export function drawBears(ctx) {
    if (!textures.bear) return;
    bears.forEach(bear => {
        if (bear.health <= 0) {
            removeBear(bear);
            return;
        }
        ctx.drawImage(textures.bear, bear.x * 50, bear.y * 50, 50, 50);
        
        // Draw health bar
        const healthBarWidth = 40;
        const healthPercent = bear.health / 150;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(bear.x * 50 + 5, bear.y * 50 - 5, healthBarWidth, 3);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(bear.x * 50 + 5, bear.y * 50 - 5, healthBarWidth * healthPercent, 3);
    });
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
        target.health -= bear.damage;
        console.log(`Bear attacked ${target.type} for ${bear.damage} damage. Target health: ${target.health}`);
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