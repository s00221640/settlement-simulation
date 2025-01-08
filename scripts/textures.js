export const textures = {
    grass: null,
    forest: null,
    stone: null,
    treeTop: null,
    treeBottom: null,
    worker: null,
    warrior: null,
    bear: null,
    stream_horizontal: null,
    stream_vertical: null,
    streamCornerTopLeft: null,
    streamCornerTopRight: null,
    streamCornerBottomLeft: null,
    streamCornerBottomRight: null,
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
        const texturePromises = [
            createImage("textures/Grass.png", "grass").then(img => textures.grass = img),
            createImage("textures/Forest.png", "forest").then(img => textures.forest = img),
            createImage("textures/Stone.png", "stone").then(img => textures.stone = img),
            createImage("textures/Tree_top.png", "treeTop").then(img => textures.treeTop = img),
            createImage("textures/Tree_bottom.png", "treeBottom").then(img => textures.treeBottom = img),
            createImage("textures/Worker.png", "worker").then(img => textures.worker = img),
            createImage("textures/Warrior.png", "warrior").then(img => textures.warrior = img),
            createImage("textures/Bear.png", "bear").then(img => textures.bear = img),
            createImage("textures/Stream_horizontal.png", "stream_horizontal").then(img => textures.stream_horizontal = img),
            createImage("textures/Stream_vertical.png", "stream_vertical").then(img => textures.stream_vertical = img),
            createImage("textures/Stream_corner_top_left.png", "streamCornerTopLeft").then(img => textures.streamCornerTopLeft = img),
            createImage("textures/Stream_corner_top_right.png", "streamCornerTopRight").then(img => textures.streamCornerTopRight = img),
            createImage("textures/Stream_corner_bottom_left.png", "streamCornerBottomLeft").then(img => textures.streamCornerBottomLeft = img),
            createImage("textures/Stream_corner_bottom_right.png", "streamCornerBottomRight").then(img => textures.streamCornerBottomRight = img),
            createImage("textures/Wall_wood.png", "wallWood").then(img => textures.wallWood = img),
            createImage("textures/Floor_wood.png", "floorWood").then(img => textures.floorWood = img),
            createImage("textures/Door_wood.png", "doorWood").then(img => textures.doorWood = img),
        ];

        await Promise.all(texturePromises);
        console.log("All textures loaded successfully");
    } catch (error) {
        console.error("Failed to load one or more textures:", error);
        throw error;
    }
}
