const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 50;
const rows = canvas.height / tileSize;
const cols = canvas.width / tileSize;

const map = [];
const resources = { wood: 0 };

// Generate the grid
for (let y = 0; y < rows; y++) {
  const row = [];
  for (let x = 0; x < cols; x++) {
    const type = Math.random() < 0.2 ? "forest" : "grass"; // 20% forest, 80% grass
    row.push({ type });
  }
  map.push(row);
}

// Draw the map
function drawMap() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const tile = map[y][x];
      ctx.fillStyle = tile.type === "forest" ? "green" : "lightgreen";
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

// Simulate gathering wood
document.getElementById("gatherWood").addEventListener("click", () => {
  const forestTile = map.flat().find(tile => tile.type === "forest");
  if (forestTile) {
    forestTile.type = "grass";
    resources.wood += 1;
    document.getElementById("woodCount").textContent = resources.wood;
    drawMap();
  } else {
    alert("No more forest to gather wood!");
  }
});

drawMap();
