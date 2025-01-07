export class EntityManager {
    constructor() {
        this.entities = [];
        this.nextId = 1; // Unique ID generator
    }

    addEntity(entity) {
        entity.id = this.nextId++;
        this.entities.push(entity);
    }

    removeEntity(entityId) {
        this.entities = this.entities.filter(entity => entity.id !== entityId);
    }

    getEntitiesByType(type) {
        return this.entities.filter(entity => entity.type === type);
    }

    updateAllEntities() {
        this.entities.forEach(entity => entity.update && entity.update());
    }
}