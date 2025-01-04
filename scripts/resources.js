let woodCount = 0;
let stoneCount = 0;

export function collectWood(map, x, y, updateWood) {
  if (map[y][x].type === "forest") {
    map[y][x].type = "grass"; // Convert to grass after collection
    woodCount++;
    updateWood(woodCount);
    console.log(`Collected wood at (${x}, ${y})`);
  } else {
    console.error(`No wood to collect at (${x}, ${y})`);
  }
}

export function collectStone(map, x, y, updateStone) {
  if (map[y][x].type === "stone") {
    map[y][x].type = "grass"; // Convert to grass after collection
    stoneCount++;
    updateStone(stoneCount);
    console.log(`Collected stone at (${x}, ${y})`);
  } else {
    console.error(`No stone to collect at (${x}, ${y})`);
  }
}
