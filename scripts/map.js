import { textures } from './textures.js';
import { woodCount, stoneCount } from './resources.js';

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
            row.push({ 
                type: "grass", 
                baseType: "grass", 
                x, 
                y, 
                designatedStructure: null,
                constructionProgress: 0
            });
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

            // Draw designated structures (blueprints)
            if (tile.designatedStructure && tile.constructionProgress < 100) {
                ctx.globalAlpha = 0.5;
                
                // Draw blueprint background (red if paused, blue if constructible)
                if (tile.constructionPaused) {
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                } else {
                    ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
                }
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            
                // Draw blueprint grid lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1;
                
                // Only draw grid lines for interior tiles
                const buildingInfo = tile.buildingInfo;
                if (buildingInfo) {
                    // Draw edge highlights for walls
                    if (buildingInfo.isWall) {
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    } else {
                        // Interior grid pattern
                        ctx.beginPath();
                        // Vertical lines
                        for (let i = 1; i < 4; i++) {
                            const xPos = x * tileSize + (tileSize * i / 4);
                            ctx.moveTo(xPos, y * tileSize);
                            ctx.lineTo(xPos, (y + 1) * tileSize);
                        }
                        // Horizontal lines
                        for (let i = 1; i < 4; i++) {
                            const yPos = y * tileSize + (tileSize * i / 4);
                            ctx.moveTo(x * tileSize, yPos);
                            ctx.lineTo((x + 1) * tileSize, yPos);
                        }
                        ctx.stroke();
                    }
                }
                
                // Draw construction progress
                if (tile.constructionProgress > 0) {
                    const progressHeight = (tile.constructionProgress / 100) * tileSize;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.fillRect(x * tileSize, y * tileSize + (tileSize - progressHeight), tileSize, progressHeight);
                }
                
                ctx.globalAlpha = 1.0;
            }

            // Draw completed buildings
            if (tile.designatedStructure && tile.constructionProgress >= 100) {
                const texture = textures[tile.structurePartType];  // Use the specific part texture
                if (texture) {
                    ctx.drawImage(texture, x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        });
    });
}

/**
 * Designates an area for building construction.
 * @param {number} startX - The starting x-coordinate.
 * @param {number} startY - The starting y-coordinate.
 * @param {number} width - The width of the building area.
 * @param {number} height - The height of the building area.
 * @param {string} buildingType - The type of building to construct.
 * @returns {boolean} - True if designation was successful, false otherwise.
 */
// In map.js, modify the designateBuilding function:

export function designateBuilding(startX, startY, width, height, buildingType) {
    let validTiles = 0;
    let allTilesValid = true;
    
    // First pass: validate the entire area
    for (let y = startY; y < startY + height; y++) {
        for (let x = startX; x < startX + width; x++) {
            if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
                if (map[y][x].type === "grass" && !map[y][x].designatedStructure) {
                    validTiles++;
                } else {
                    allTilesValid = false;
                }
            } else {
                allTilesValid = false;
            }
        }
    }

    // If not all tiles are valid, don't designate anything
    if (!allTilesValid || validTiles !== width * height) {
        console.log("Cannot place building here - area contains invalid tiles");
        return false;
    }

    // All tiles are valid, proceed with designation
    for (let y = startY; y < startY + height; y++) {
        for (let x = startX; x < startX + width; x++) {
            const isEdge = x === startX || x === startX + width - 1 || 
                          y === startY || y === startY + height - 1;
            const isCenterFront = y === startY + height - 1 && 
                                x === startX + Math.floor(width / 2);
            
            const structurePartType = isCenterFront ? "doorWood" : 
                                    isEdge ? "wallWood" : "floorWood";

            map[y][x].designatedStructure = buildingType;
            map[y][x].structurePartType = structurePartType;  // Store what kind of part this is
            map[y][x].constructionProgress = 0;
            map[y][x].constructionPaused = true;
            
            map[y][x].buildingInfo = {
                startX: startX,
                startY: startY,
                width: width,
                height: height,
                type: buildingType,
                isWall: isEdge,
                isDoor: isCenterFront
            };
        }
    }

    return true;
}

/**
 * Gets the building type at a specific tile.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {string|null} - The building type or null if no building exists.
 */
export function getBuildingAtTile(x, y) {
    if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
        return map[y][x].designatedStructure;
    }
    return null;
}

/**
 * Updates the construction progress of a building tile.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} progressAmount - Amount of progress to add (0-100).
 * @returns {boolean} - True if construction is complete after update.
 */
export function updateConstructionProgress(x, y, progressAmount) {
    if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
        const tile = map[y][x];
        if (tile.designatedStructure && tile.constructionProgress < 100) {
            tile.constructionProgress = Math.min(100, tile.constructionProgress + progressAmount);
            return tile.constructionProgress >= 100;
        }
    }
    return false;
}