// scripts/ecs/systems/combat.js
import { Position, Combat, Health } from '../components.js';

export class CombatSystem {
    constructor(spatialGrid) {
        this.spatialGrid = spatialGrid;
        this.attackCooldowns = new Map();
    }

    update(dt, world) {
        // Update cooldowns
        for (const [entityId, cooldown] of this.attackCooldowns.entries()) {
            if (cooldown > 0) {
                this.attackCooldowns.set(entityId, cooldown - dt);
            }
        }

        // Find entities that can fight
        const combatants = world.query(Position, Combat, Health);

        for (const entityId of combatants) {
            if (this.attackCooldowns.get(entityId) > 0) continue;

            const pos = world.getComponent(entityId, Position);
            const combat = world.getComponent(entityId, Combat);
            
            // Find potential targets in range
            const nearbyEntities = this.spatialGrid.getNearbyEntities(pos.x, pos.y, combat.range);
            
            for (const targetId of nearbyEntities) {
                if (targetId === entityId) continue;
                
                const targetHealth = world.getComponent(targetId, Health);
                if (!targetHealth) continue;

                const targetPos = world.getComponent(targetId, Position);
                const distance = Math.abs(targetPos.x - pos.x) + Math.abs(targetPos.y - pos.y);

                if (distance <= combat.range) {
                    // Attack!
                    this.attack(world, entityId, targetId);
                    this.attackCooldowns.set(entityId, 1.0); // 1 second cooldown
                    break;
                }
            }
        }
    }

    attack(world, attackerId, targetId) {
        const combat = world.getComponent(attackerId, Combat);
        const targetHealth = world.getComponent(targetId, Health);

        targetHealth.current -= combat.damage;
        console.log(`Entity ${attackerId} attacked ${targetId} for ${combat.damage} damage. Health: ${targetHealth.current}/${targetHealth.max}`);

        if (targetHealth.current <= 0) {
            const pos = world.getComponent(targetId, Position);
            this.spatialGrid.removeEntity(targetId, pos.x, pos.y);
            world.removeEntity(targetId);
        }
    }
}