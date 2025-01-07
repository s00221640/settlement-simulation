import { textures } from './textures.js';

export const map = [];

/**
 * Generates the map with grass, forests, stones, and streams.
 * @param {number} rows - Number of rows in the map.
 * @param {number} cols - Number of columns in the map.
 */
export function generateMap(rows, cols) {
    map.length = 0; // Clear the map for reloading
    for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
            row.push({ type: "grass", baseType: "grass", x, y, treeType: null });
        }
        map.push(row);
    }

    // Add resources (forests, stones)
    addResources(rows, cols);

    // Add streams with natural flow
    addStreams(rows, cols, 3); // Adjust the number of streams as needed
}

/**
 * Adds forests and stones to the map.
 * @param {number} rows - Number of rows in the map.
 * @param {number} cols - Number of columns in the map.
 */
function addResources(rows, cols) {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (map[y][x].type === "grass" || map[y][x].baseType === "stream") {
                const rand = Math.random();
                if (rand < 0.15) {
                    map[y][x].type = "forest";
                } else if (rand < 0.25) {
                    map[y][x].type = "stone";
                }
                // Preserve the base type for streams
                if (map[y][x].baseType === "stream") {
                    map[y][x].baseType = map[y][x].type.startsWith("stream") ? map[y][x].type : "stream";
                }
            }
        }
    }
}

/**
 * Adds flowing streams to the map.
 * @param {number} rows - Number of rows in the map.
 * @param {number} cols - Number of columns in the map.
 * @param {number} streamCount - Number of streams to generate.
 */
function addStreams(rows, cols, streamCount) {
    for (let i = 0; i < streamCount; i++) {
        let x = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * cols); // Start at an edge
        let y = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * rows);

        let direction = Math.random() < 0.5 ? "horizontal" : "vertical"; // Initial direction

        for (let j = 0; j < Math.floor(rows / 2); j++) {
            if (x >= 0 && x < cols && y >= 0 && y < rows && map[y][x].type === "grass") {
                map[y][x].type = direction === "horizontal" ? "stream_horizontal" : "stream_vertical";
                map[y][x].baseType = "stream";
            }

            if (Math.random() < 0.3 && j > 0) {
                const previousDirection = direction;
                direction = direction === "horizontal" ? "vertical" : "horizontal";

                if (x >= 0 && x < cols && y >= 0 && y < rows) {
                    if (previousDirection === "horizontal" && direction === "vertical") {
                        map[y][x].type = map[y - 1]?.[x]?.type === "stream_horizontal"
                            ? "streamCornerTopRight"
                            : "streamCornerBottomLeft";
                    } else if (previousDirection === "vertical" && direction === "horizontal") {
                        map[y][x].type = map[y][x - 1]?.type === "stream_vertical"
                            ? "streamCornerBottomRight"
                            : "streamCornerTopLeft";
                    }
                }
            }

            if (direction === "horizontal") {
                x++;
            } else {
                y++;
            }

            if (x >= cols || y >= rows) break;
        }
    }
}

/**
 * Processes forest tree types to generate vertical tree pairs.
 */
export function preprocessTreeTypes() {
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
                y++; // Skip the next tile since we've used it
            }
        }
    }
}

/**
 * Draws the map on the canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 */
export function drawMap(ctx) {
    const tileSize = 50;

    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            // Draw base terrain (grass, stream, etc.)
            if (tile.baseType && textures[tile.baseType]) {
                ctx.drawImage(textures[tile.baseType], x * tileSize, y * tileSize, tileSize, tileSize);
            } else {
                ctx.drawImage(textures.grass, x * tileSize, y * tileSize, tileSize, tileSize);
            }

            // Draw resources or special features
            if (tile.type === "forest") {
                const treeTexture = tile.treeType === "treeTop" ? textures.treeTop :
                                    tile.treeType === "treeBottom" ? textures.treeBottom :
                                    textures.forest;
                ctx.drawImage(treeTexture, x * tileSize, y * tileSize, tileSize, tileSize);
            } else if (tile.type === "stone") {
                ctx.drawImage(textures.stone, x * tileSize, y * tileSize, tileSize, tileSize);
            } else if (tile.type.startsWith("stream")) {
                ctx.drawImage(textures[tile.type], x * tileSize, y * tileSize, tileSize, tileSize);
            }
        });
    });
}
