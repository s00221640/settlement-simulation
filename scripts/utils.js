

export function isTileOccupied(x, y, workers, warriors, bears) {
    return workers.some(worker => worker.x === x && worker.y === y) ||
           warriors.some(warrior => warrior.x === x && warrior.y === y) ||
           bears.some(bear => bear.x === x && bear.y === y);
}
