// scripts/ecs/systems/map.js
export class MapSystem {
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.tiles = [];
        this.generateMap();
    }

    generateMap() {
        this.tiles = [];
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                // Random terrain generation
                const rand = Math.random();
                let type = "grass"; // Default
                if (rand < 0.15) type = "forest";
                else if (rand < 0.25) type = "stone";
                
                row.push({
                    type,
                    x,
                    y,
                    treeType: null
                });
            }
            this.tiles.push(row);
        }

        // Process tree pairs
        this.preprocessTrees();
    }

    preprocessTrees() {
        // Process each column for vertical tree pairs
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height - 1; y++) {
                if (this.tiles[y][x].type !== "forest" || 
                    this.tiles[y][x].treeType !== null) {
                    continue;
                }
                
                if (this.tiles[y + 1][x].type === "forest" && 
                    this.tiles[y + 1][x].treeType === null) {
                    this.tiles[y][x].treeType = "treeTop";
                    this.tiles[y + 1][x].treeType = "treeBottom";
                    y++; // Skip the next tile since we used it
                }
            }
        }
    }

    draw(ctx, textures) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                
                // Draw base grass for all tiles
                ctx.drawImage(
                    textures.grass, 
                    x * this.tileSize, 
                    y * this.tileSize, 
                    this.tileSize, 
                    this.tileSize
                );

                // Draw resources on top
                if (tile.type === "forest") {
                    const treeTexture = tile.treeType === "treeTop" ? textures.treeTop :
                                      tile.treeType === "treeBottom" ? textures.treeBottom :
                                      textures.forest;
                    
                    ctx.drawImage(
                        treeTexture,
                        x * this.tileSize,
                        y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                } else if (tile.type === "stone") {
                    ctx.drawImage(
                        textures.stone,
                        x * this.tileSize,
                        y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        }
    }

    getTile(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.tiles[y][x];
        }
        return null;
    }

    isPassable(x, y) {
        const tile = this.getTile(x, y);
        return tile && tile.type === "grass";
    }
}