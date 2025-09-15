/**
 * Node.js test runner for TC-9.1
 * This simulates the test execution and shows the expected console output
 */

// Mock THREE global
global.THREE = {
    Vector3: class Vector3 {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        clone() {
            return new global.THREE.Vector3(this.x, this.y, this.z);
        }
        distanceTo(other) {
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const dz = this.z - other.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
    }
};

// Import and run the BehaviorSystem test
import { BehaviorSystem } from '../src/behaviors/BehaviorSystem.js';

console.log('=====================================');
console.log('Test Case TC-9.1: BehaviorSystem_OnLevelLoad_ParsesAndAttachesBehaviors');
console.log('=====================================');
console.log('');

// Create mock scene and physics manager
const mockScene = {
    add: () => {},
    remove: () => {}
};

const mockPhysicsManager = {
    world: {
        addBody: () => {},
        removeBody: () => {}
    }
};

// Create BehaviorSystem instance
const behaviorSystem = new BehaviorSystem(mockScene, mockPhysicsManager);
console.log('Created BehaviorSystem instance');

// Create mock level data with behaviors array
const levelData = {
    gridUnitSize: 4,
    blocks: [
        { type: 'standard', at: [5, 1, 5] }
    ],
    behaviors: [
        {
            type: 'elevator',
            target: [5, 1, 5],
            config: {
                trigger: 'onPlayerContact',
                startPosition: [5, 1, 5],
                endPosition: [5, 3, 5],
                speed: 2.0,
                returnDelay: 3.0
            }
        }
    ]
};

// Create mock platforms map with a block at [5,1,5]
const mockBlock = {
    name: 'block-standard-0',
    position: new global.THREE.Vector3(20, 4, 20),
    userData: {
        blockType: 'standard',
        gridPosition: [5, 1, 5]
    },
    geometry: {
        parameters: { width: 4 }
    }
};

const platforms = new Map();
platforms.set('block-0', mockBlock);

console.log('Created mock level data with elevator behavior at [5,1,5]');
console.log('');
console.log('Parsing behaviors...');
console.log('');

// Parse behaviors - this should trigger the required console logs
behaviorSystem.parseBehaviors(levelData, platforms);

console.log('');
console.log('Test Verification:');

// Verify behavior was attached
const attachedBehaviors = behaviorSystem.behaviors;
const hasElevatorBehavior = Array.from(attachedBehaviors.values()).some(
    behavior => behavior.type === 'elevator' && 
               behavior.targetBlock === mockBlock
);

if (hasElevatorBehavior) {
    console.log('✅ TEST PASSED: Elevator behavior was successfully attached to block at [5,1,5]');
} else {
    console.log('❌ TEST FAILED: Elevator behavior was not attached');
}

// Verify block has behavior metadata
if (mockBlock.userData.hasBehavior && mockBlock.userData.behaviors) {
    console.log('✅ TEST PASSED: Block metadata was updated with behavior references');
} else {
    console.log('❌ TEST FAILED: Block metadata was not updated');
}

console.log('');
console.log('=====================================');
console.log('Test Case TC-9.1 Complete');
console.log('=====================================');

process.exit(hasElevatorBehavior && mockBlock.userData.hasBehavior ? 0 : 1);