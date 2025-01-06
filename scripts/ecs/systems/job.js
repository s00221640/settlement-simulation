// scripts/ecs/systems/job.js
export class JobSystem {
    constructor(movementSystem, mapSystem) {
        this.movementSystem = movementSystem;
        this.mapSystem = mapSystem;
    }

    update(dt, world) {
        const workers = world.query('Position', 'Job');
        
        for (const workerId of workers) {
            const job = world.getComponent(workerId, 'Job');
            if (!job.type) continue; // No active job
            
            switch (job.type) {
                case 'gatherWood':
                case 'gatherStone':
                    this.handleGatheringJob(world, workerId, job);
                    break;
            }
        }
    }

    handleGatheringJob(world, workerId, job) {
        const pos = world.getComponent(workerId, 'Position');
        const targetTile = world.mapSystem.getTile(job.targetX, job.targetY);
        
        if (!targetTile) {
            job.type = null;
            return;
        }

        const distance = Math.abs(pos.x - job.targetX) + Math.abs(pos.y - job.targetY);
        
        if (distance <= 1) {
            if (job.type === 'gatherWood' && targetTile.type === 'forest') {
                // Handle tree pairs
                if (targetTile.treeType === 'treeTop') {
                    const bottomTile = world.mapSystem.getTile(job.targetX, job.targetY + 1);
                    if (bottomTile && bottomTile.type === 'forest') {
                        bottomTile.type = 'grass';
                        bottomTile.treeType = null;
                    }
                } else if (targetTile.treeType === 'treeBottom') {
                    const topTile = world.mapSystem.getTile(job.targetX, job.targetY - 1);
                    if (topTile && topTile.type === 'forest') {
                        topTile.type = 'grass';
                        topTile.treeType = null;
                    }
                }
                
                targetTile.type = 'grass';
                targetTile.treeType = null;
                
                // Update wood count properly
                const woodSpan = document.getElementById('woodCount');
                woodSpan.textContent = (parseInt(woodSpan.textContent || '0') + 1).toString();
                
            } else if (job.type === 'gatherStone' && targetTile.type === 'stone') {
                targetTile.type = 'grass';
                
                // Update stone count properly
                const stoneSpan = document.getElementById('stoneCount');
                stoneSpan.textContent = (parseInt(stoneSpan.textContent || '0') + 1).toString();
            }
            
            job.type = null;
        } else if (!job.isMoving) {
            const adjacentTiles = world.mapSystem.getAdjacentTiles(job.targetX, job.targetY);
            if (adjacentTiles.length > 0) {
                const closest = adjacentTiles.reduce((a, b) => {
                    const distA = Math.abs(a.x - pos.x) + Math.abs(a.y - pos.y);
                    const distB = Math.abs(b.x - pos.x) + Math.abs(b.y - pos.y);
                    return distA < distB ? a : b;
                });

                world.movementSystem.moveEntityTo(world, workerId, closest.x, closest.y);
            } else {
                job.type = null;
            }
        }
    }

    assignGatheringJob(world, workerId, resourceType) {
        const job = world.getComponent(workerId, 'Job');
        if (job.type) return false; // Already has a job

        const pos = world.getComponent(workerId, 'Position');
        
        // Find nearest resource
        let nearestResource = null;
        let minDistance = Infinity;

        for (let y = 0; y < this.mapSystem.height; y++) {
            for (let x = 0; x < this.mapSystem.width; x++) {
                const tile = this.mapSystem.getTile(x, y);
                if (tile.type === resourceType) {
                    const distance = Math.abs(x - pos.x) + Math.abs(y - pos.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestResource = {x, y};
                    }
                }
            }
        }

        if (nearestResource) {
            job.type = resourceType === 'forest' ? 'gatherWood' : 'gatherStone';
            job.targetX = nearestResource.x;
            job.targetY = nearestResource.y;
            return true;
        }

        return false;
    }
}