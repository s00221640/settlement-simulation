// scripts/combat.js
const STATS = {
    worker: { maxHealth: 50, damage: 0 },
    warrior: { maxHealth: 100, damage: 20 },
    bear: { maxHealth: 150, damage: 30 }
};

export function initializeHealth(entity, type) {
    entity.health = STATS[type].maxHealth;
    entity.maxHealth = STATS[type].maxHealth;
    entity.damage = STATS[type].damage;
}

export function drawHealthBar(ctx, entity) {
    const healthBarWidth = 40;
    const healthBarHeight = 4;
    const x = entity.x * 50 + (50 - healthBarWidth) / 2;
    const y = entity.y * 50 - 8;
    
    // Background (red)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x, y, healthBarWidth, healthBarHeight);
    
    // Foreground (green)
    ctx.fillStyle = '#00ff00';
    const healthWidth = (entity.health / entity.maxHealth) * healthBarWidth;
    ctx.fillRect(x, y, healthWidth, healthBarHeight);
}

export function attack(attacker, defender) {
    if (!attacker || !defender) return false;
    
    defender.health = Math.max(0, defender.health - attacker.damage);
    console.log(`${attacker.type} attacked ${defender.type} for ${attacker.damage} damage. ${defender.type} has ${defender.health}/${defender.maxHealth} HP`);
    
    return defender.health <= 0;
}