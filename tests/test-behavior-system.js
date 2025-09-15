/**
 * Test Case TC-9.1: BehaviorSystem_OnLevelLoad_ParsesAndAttachesBehaviors
 * 
 * This test verifies that the BehaviorSystem correctly parses a behavior entry 
 * for a block at grid coordinate [5,1,5] and attaches an "elevator" behavior instance.
 * 
 * Expected console logs:
 * - "Parsing behavior 'elevator' for target block at [5,1,5]."
 * - "Behavior attached successfully."
 */

import { BehaviorSystem } from '../src/behaviors/BehaviorSystem.js';

// Test function to verify TC-9.1
export async function testBehaviorSystemParsing() {
    console.log('=====================================');
    console.log('Test Case TC-9.1: BehaviorSystem Parsing Test');
    console.log('=====================================');
    
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
        position: { x: 20, y: 4, z: 20, clone: () => ({ x: 20, y: 4, z: 20 }) },
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
    console.log('Test verification:');
    
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
    
    return hasElevatorBehavior;
}

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
    testBehaviorSystemParsing().then(success => {
        process.exit(success ? 0 : 1);
    });
}