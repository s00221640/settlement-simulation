let wood = 0;

export function collectWood(map, updateUI) {
  const forestTile = map.flat().find(tile => tile.type === "forest");
  if (forestTile) {
    forestTile.type = "grass";
    wood += 1;
    updateUI(wood);
  } else {
    alert("No more forest to gather wood!");
  }
}
