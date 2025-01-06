// scripts/ecs/core.js
export class World {
    constructor() {
        this.entities = new Map();
        this.components = new Map();
        this.nextEntityId = 1;
        this.systems = [];
    }

    createEntity() {
        const id = this.nextEntityId++;
        this.entities.set(id, new Set());
        return id;
    }

    addComponent(entityId, componentName, data) {
        if (!this.components.has(componentName)) {
            this.components.set(componentName, new Map());
        }
        this.components.get(componentName).set(entityId, data);
        this.entities.get(entityId).add(componentName);
    }

    getComponent(entityId, componentName) {
        return this.components.get(componentName)?.get(entityId);
    }

    removeEntity(entityId) {
        if (!this.entities.has(entityId)) return;
        
        // Remove all components
        for (const componentName of this.entities.get(entityId)) {
            this.components.get(componentName).delete(entityId);
        }
        this.entities.delete(entityId);
    }

    addSystem(system) {
        this.systems.push(system);
    }

    update(dt) {
        for (const system of this.systems) {
            system.update(dt, this);
        }
    }

    // Query entities that have all specified components
    query(...componentNames) {
        const results = [];
        for (const [entityId, components] of this.entities) {
            if (componentNames.every(name => components.has(name))) {
                results.push(entityId);
            }
        }
        return results;
    }
}