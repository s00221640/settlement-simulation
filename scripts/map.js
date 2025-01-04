export const map = [];
const tileSize = 50;

export function generateMap(rows, cols) {
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      const type = Math.random() < 0.1 ? "stone" : Math.random() < 0.2 ? "forest" : "grass";
      row.push({ type });
    }
    map.push(row);
  }
}

export function drawMap(ctx) {
  map.forEach((row, y) => {
    row.forEach((tile, x) => {
      ctx.fillStyle = tile.type === "forest" ? "green" : tile.type === "stone" ? "gray" : "lightgreen";
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
    });
  });
}
