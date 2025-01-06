// scripts/textures.js
export const textures = {
    grass: null,
    forest: null,
    stone: null,
    treeTop: null,
    treeBottom: null,
    worker: null,
    warrior: null,
    bear: null
};

function createImage(src, name) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            console.log(`Loaded texture: ${name}`);
            resolve(img);
        };
        img.onerror = () => {
            console.error(`Failed to load texture: ${name} from ${src}`);
            reject(new Error(`Failed to load ${name}`));
        };
        img.src = src;
    });
}

export async function loadTextures() {
    try {
        await Promise.all([
            createImage("textures/Grass.png", "grass").then(img => textures.grass = img),
            createImage("textures/Forest.png", "forest").then(img => textures.forest = img),
            createImage("textures/Stone.png", "stone").then(img => textures.stone = img),
            createImage("textures/Tree_top.png", "treeTop").then(img => textures.treeTop = img),
            createImage("textures/Tree_bottom.png", "treeBottom").then(img => textures.treeBottom = img),
            createImage("textures/Worker.png", "worker").then(img => textures.worker = img),
            createImage("textures/Warrior.png", "warrior").then(img => textures.warrior = img),
            createImage("textures/Bear.png", "bear").then(img => textures.bear = img)
        ]);
        console.log("All textures loaded successfully");
    } catch (error) {
        console.error("Failed to load one or more textures:", error);
        throw error;
    }
}