let woodCount = 0;
let stoneCount = 0;

/**
 * Collect wood from a forest tile and update the resource count.
 * @param {Array} map - The game map array.
 * @param {number} x - The x-coordinate of the tile.
 * @param {number} y - The y-coordinate of the tile.
 * @param {Function} updateWood - Callback to update the wood count in the UI.
 */
export function collectWood(map, x, y, updateWood) {
    if (map[y][x].type === "forest") {
        const currentTree = map[y][x];
        
        if (currentTree.treeType === "treeTop" && y < map.length - 1) {
            if (map[y + 1][x].type === "forest" && map[y + 1][x].treeType === "treeBottom") {
                map[y + 1][x].treeType = null;
            }
        } else if (currentTree.treeType === "treeBottom" && y > 0) {
            if (map[y - 1][x].type === "forest" && map[y - 1][x].treeType === "treeTop") {
                map[y - 1][x].treeType = null;
            }
        }

        // Convert collected tree to grass
        currentTree.type = "grass";
        currentTree.treeType = null;
        woodCount++;
        updateWood(woodCount);
        console.log(`Collected wood at (${x}, ${y})`);
    } else {
        console.error(`No wood to collect at (${x}, ${y})`);
    }
}

/**
 * Collect stone from a stone tile and update the resource count.
 * @param {Array} map - The game map array.
 * @param {number} x - The x-coordinate of the tile.
 * @param {number} y - The y-coordinate of the tile.
 * @param {Function} updateStone - Callback to update the stone count in the UI.
 */
export function collectStone(map, x, y, updateStone) {
    if (map[y][x].type === "stone") {
        map[y][x].type = "grass";
        stoneCount++;
        updateStone(stoneCount);
        console.log(`Collected stone at (${x}, ${y})`);
    } else {
        console.error(`No stone to collect at (${x}, ${y})`);
    }
}

/**
 * Check if there are enough resources for construction.
 * @param {number} requiredWood - The amount of wood required.
 * @param {number} requiredStone - The amount of stone required.
 * @returns {boolean} - True if enough resources are available, false otherwise.
 */
export function hasEnoughResources(requiredWood, requiredStone) {
    return woodCount >= requiredWood && stoneCount >= requiredStone;
}

/**
 * Deduct resources for construction.
 * @param {number} usedWood - The amount of wood to deduct.
 * @param {number} usedStone - The amount of stone to deduct.
 * @param {Function} updateWood - Callback to update the wood count in the UI.
 * @param {Function} updateStone - Callback to update the stone count in the UI.
 */
export function deductResources(usedWood, usedStone, updateWood, updateStone) {
    woodCount -= usedWood;
    stoneCount -= usedStone;
    updateWood(woodCount);
    updateStone(stoneCount);
    console.log(`Resources used: ${usedWood} wood, ${usedStone} stone.`);
}

// Export resource counts for other files to access
export { woodCount, stoneCount };
