import { isTileOccupied } from './utils.js'; // Ensure this exists and is correctly implemented.
import { workers } from './workers.js';
import { warriors } from './warriors.js';

export const bears = []; // Keep the list of bears within this file.

export function addBear(x, y) {
    bears.push({ x, y });
}

export function drawBears(ctx) {
    bears.forEach(bear => {
        ctx.drawImage(textures.bear, bear.x * 50, bear.y * 50, 50, 50);
    });
}

export function moveBears(map, ctx, drawMapWithEntities) {
    bears.forEach(bear => {
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
    });

    drawMapWithEntities();
}
