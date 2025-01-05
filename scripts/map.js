import { textures } from './textures.js';

export const map = [];

export function generateMap(rows, cols) {
    map.length = 0; // Clear the map for reloading
    for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
            let type = "grass"; // Default to grass

            // Randomly assign resource types
            const rand = Math.random();
            if (rand < 0.15) type = "forest";
            else if (rand < 0.25) type = "stone";

            row.push({ type, x, y, treeType: null });
        }
        map.push(row);
    }
}

export function preprocessTreeTypes() {
    // Process each column for vertical tree pairs
    for (let x = 0; x < map[0].length; x++) {
        for (let y = 0; y < map.length - 1; y++) {
            // Skip if current tile isn't a forest
            if (map[y][x].type !== "forest") {
                continue;
            }
            // Skip if current tile is already part of a pair
            if (map[y][x].treeType !== null) {
                continue;
            }
            // Look at next tile down
            if (map[y + 1][x].type === "forest" && map[y + 1][x].treeType === null) {
                // Create a pair
                map[y][x].treeType = "treeTop";
                map[y + 1][x].treeType = "treeBottom";
                // Skip the next tile since we've used it
                y++;
            }
        }
    }
}

export function drawMap(ctx) {
    const tileSize = 50;

    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            // Draw grass background for all tiles
            ctx.drawImage(textures.grass, x * tileSize, y * tileSize, tileSize, tileSize);

            // Draw resources on top
            if (tile.type === "forest") {
                const treeTexture = tile.treeType === "treeTop" ? textures.treeTop :
                                  tile.treeType === "treeBottom" ? textures.treeBottom :
                                  textures.forest;
                ctx.drawImage(treeTexture, x * tileSize, y * tileSize, tileSize, tileSize);
            } else if (tile.type === "stone") {
                ctx.drawImage(textures.stone, x * tileSize, y * tileSize, tileSize, tileSize);
            }
        });
    });
}