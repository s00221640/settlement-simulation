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

            row.push({ type, x, y, treeType: null }); // Add treeType for processing
        }
        map.push(row);
    }
}

// Preprocessing pass to determine tree types
export function preprocessTreeTypes() {
    // Iterate through the map vertically
    for (let x = 0; x < map[0].length; x++) {
        let currentColumn = [];

        // Collect all forest tiles in this column
        for (let y = 0; y < map.length; y++) {
            if (map[y][x].type === "forest") {
                currentColumn.push(map[y][x]);
            }
        }

        // Assign treeType based on position in column
        currentColumn.forEach((tile, index) => {
            const isTop = index === 0;
            const isBottom = index === currentColumn.length - 1;

            if (!isTop && !isBottom) {
                tile.treeType = "normalTree"; // Middle tree in a column
            } else if (isTop) {
                tile.treeType = "treeTop";
            } else if (isBottom) {
                tile.treeType = "treeBottom";
            }
        });
    }
}

// Render map
export function drawMap(ctx) {
    const textures = {
        grass: document.getElementById("Grass"),
        forest: document.getElementById("Tree"),
        stone: document.getElementById("Stone"),
        treeTop: document.getElementById("Tree_top"),
        treeBottom: document.getElementById("Tree_bottom"),
        normalTree: document.getElementById("Tree"),
    };

    const tileSize = 50;

    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            if (tile.type === "forest") {
                const treeTexture = textures[tile.treeType || "forest"];
                ctx.drawImage(treeTexture, x * tileSize, y * tileSize, tileSize, tileSize);
            } else {
                const texture = textures[tile.type];
                if (texture) {
                    ctx.drawImage(texture, x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        });
    });
}
