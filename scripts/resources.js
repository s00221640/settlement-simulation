let woodCount = 0;
let stoneCount = 0;

export function collectWood(map, x, y, updateWood) {
    if (map[y][x].type === "forest") {
        const currentTree = map[y][x];
        
        if (currentTree.treeType === "treeTop" && y < map.length - 1) {
            // If we're collecting a top tree, reset the bottom tree
            if (map[y + 1][x].type === "forest" && map[y + 1][x].treeType === "treeBottom") {
                map[y + 1][x].treeType = null;
            }
        } else if (currentTree.treeType === "treeBottom" && y > 0) {
            // If we're collecting a bottom tree, reset the top tree
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