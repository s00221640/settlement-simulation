// utils.js
export function isTileOccupied(x, y) {
    const entities = window.gameState?.entities || [];
    return entities.some(entity => entity.x === x && entity.y === y);
}

export function addEntity(entity) {
    if (!window.gameState) {
        window.gameState = { entities: [] };
    }
    window.gameState.entities.push(entity);
}

export function removeEntity(entity) {
    if (!window.gameState?.entities) return;
    const index = window.gameState.entities.indexOf(entity);
    if (index > -1) {
        window.gameState.entities.splice(index, 1);
    }
}

export function getEntitiesAtPosition(x, y) {
    return window.gameState?.entities.filter(entity => entity.x === x && entity.y === y) || [];
}

export function getEntitiesInRange(x, y, range) {
    return window.gameState?.entities.filter(entity => 
        Math.abs(entity.x - x) <= range && 
        Math.abs(entity.y - y) <= range
    ) || [];
}

// Add basic combat and health functionality
export function createEntity(type, x, y) {
    const baseStats = {
        worker: { health: 50, damage: 0, range: 1 },
        warrior: { health: 100, damage: 20, range: 1 },
        bear: { health: 150, damage: 30, range: 1 }
    };

    const stats = baseStats[type];
    if (!stats) throw new Error(`Invalid entity type: ${type}`);

    return {
        type,
        x,
        y,
        health: stats.health,
        maxHealth: stats.health,
        damage: stats.damage,
        range: stats.range,
        isMoving: false,
        task: null
    };
}

export function attackEntity(attacker, target) {
    if (!target) return false;
    
    target.health = Math.max(0, target.health - attacker.damage);
    console.log(`${attacker.type} attacked ${target.type} for ${attacker.damage} damage. ${target.type} has ${target.health}/${target.maxHealth} HP remaining`);
    
    if (target.health <= 0) {
        removeEntity(target);
        return true; // Target was killed
    }
    return false; // Target survived
}