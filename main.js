import { generateMap, drawMap, map } from "./scripts/map.js";
import { collectWood } from "./scripts/resources.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const rows = canvas.height / 50;
const cols = canvas.width / 50;

// Initialize the game
generateMap(rows, cols);
drawMap(ctx);

// Add event listener for gathering wood
document.getElementById("gatherWood").addEventListener("click", () => {
  collectWood(map, wood => {
    document.getElementById("woodCount").textContent = wood;
  });
  drawMap(ctx);
});
