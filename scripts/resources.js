let wood = 0;
let stone = 0;

export function collectWood(map, updateUI) {
  console.log("Collecting wood..."); // Debug
  const forestTile = map.flat().find(tile => tile.type === "forest");
  if (forestTile) {
    console.log("Found forest tile, converting to grass."); // Debug
    forestTile.type = "grass";
    wood += 1;
    updateUI(wood);
  } else {
    alert("No more forest to gather wood!");
  }
}

export function collectStone(map, updateUI) {
  console.log("Collecting stone..."); // Debug
  const stoneTile = map.flat().find(tile => tile.type === "stone");
  if (stoneTile) {
    console.log("Found stone tile, converting to grass."); // Debug
    stoneTile.type = "grass";
    stone += 1;
    updateUI(stone);
  } else {
    alert("No more stone to gather!");
  }
}
