// scripts/ecs/components.js

// Core components
export const Position = 'Position';     // {x: number, y: number}
export const Sprite = 'Sprite';         // {texture: string}
export const Health = 'Health';         // {current: number, max: number}
export const Movement = 'Movement';      // {speed: number, isMoving: boolean}
export const Combat = 'Combat';         // {damage: number, range: number}
export const AI = 'AI';                 // {behavior: string, target?: number}
export const Resource = 'Resource';     // {type: string, amount: number}
export const Job = 'Job';              // {type: string, targetId?: number, state: string}
export const Building = 'Building';     // {type: string, state: string, progress: number}

// Component factories
export function createWorker(x, y) {
    return {
        [Position]: { x, y },
        [Sprite]: { texture: 'worker' },
        [Health]: { current: 50, max: 50 },
        [Movement]: { speed: 1, isMoving: false },
        [Job]: { type: null, targetId: null, state: 'idle' }
    };
}

export function createWarrior(x, y) {
    return {
        [Position]: { x, y },
        [Sprite]: { texture: 'warrior' },
        [Health]: { current: 100, max: 100 },
        [Movement]: { speed: 1, isMoving: false },
        [Combat]: { damage: 20, range: 1 },
        [Job]: { type: null, targetId: null, state: 'idle' }
    };
}

export function createBear(x, y) {
    return {
        [Position]: { x, y },
        [Sprite]: { texture: 'bear' },
        [Health]: { current: 150, max: 150 },
        [Movement]: { speed: 1, isMoving: false },
        [Combat]: { damage: 30, range: 1 },
        [AI]: { behavior: 'aggressive' }
    };
}

export function createTree(x, y) {
    return {
        [Position]: { x, y },
        [Sprite]: { texture: 'forest' },
        [Resource]: { type: 'wood', amount: 10 }
    };
}

export function createStone(x, y) {
    return {
        [Position]: { x, y },
        [Sprite]: { texture: 'stone' },
        [Resource]: { type: 'stone', amount: 10 }
    };
}