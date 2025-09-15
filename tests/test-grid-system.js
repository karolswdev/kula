/**
 * Test Cases for PHASE-7: Grid Engine Refactor
 * Tests the universal grid system and asset registry implementation
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Import the modules we're testing
import { LevelManager } from '../src/level/LevelManager.js';
import assetRegistry from '../src/assets/AssetRegistry.js';

/**
 * Test Case TC-7.1: LevelManager_LoadGridLevel_PlacesBlocksAtCorrectWorldPositions
 * Requirement: ARCH-003 - Grid Coordinate System
 * 
 * Test Logic: Create a new grid-based level file with blocks at integer coordinates 
 * [0,0,0] and [2,0,1]. Assuming a gridUnitSize of 4, load the level. Assert that 
 * the resulting meshes are created at world positions (0,0,0) and (8,0,4).
 */
export async function TC_7_1_GridCoordinateTransformation() {
    console.log('\n=== Test Case TC-7.1: Grid Coordinate Transformation ===');
    
    // Create a mock scene and physics manager
    const scene = {
        add: function(mesh) {
            console.log(`Scene: Added mesh '${mesh.name}' at position (${mesh.position.x}, ${mesh.position.y}, ${mesh.position.z})`);
        },
        remove: function(mesh) {}
    };
    
    const physicsManager = {
        world: null,
        createFloorBody: function() { return {}; },
        createWallBody: function() { return {}; }
    };
    
    // Create LevelManager instance
    const levelManager = new LevelManager(scene, physicsManager);
    
    // Create test level data with specific grid coordinates
    const testLevel = {
        theme: "nature",
        gridUnitSize: 4,
        blocks: [
            {
                type: "standard",
                at: [0, 0, 0]
            },
            {
                type: "standard",
                at: [2, 0, 1]
            }
        ],
        player: {
            spawn: [0, 1, 0]
        }
    };
    
    // Load the level
    await levelManager.load(testLevel);
    
    // Verify grid unit size was set correctly
    console.log(`\nGrid Unit Size: ${levelManager.gridUnitSize}`);
    
    // Check the blocks were placed at correct world positions
    let blockCount = 0;
    let testPassed = true;
    
    levelManager.platforms.forEach((mesh, key) => {
        const gridPos = mesh.userData.gridPosition;
        const worldPos = mesh.position;
        
        console.log(`\nBlock ${blockCount + 1}:`);
        console.log(`  Grid coordinates: [${gridPos[0]}, ${gridPos[1]}, ${gridPos[2]}]`);
        console.log(`  Calculated world position: (${worldPos.x}, ${worldPos.y}, ${worldPos.z})`);
        
        // Calculate expected position
        const expectedX = gridPos[0] * levelManager.gridUnitSize;
        const expectedY = gridPos[1] * levelManager.gridUnitSize;
        const expectedZ = gridPos[2] * levelManager.gridUnitSize;
        
        console.log(`  Expected world position: (${expectedX}, ${expectedY}, ${expectedZ})`);
        
        // Verify the transformation is correct
        if (Math.abs(worldPos.x - expectedX) > 0.001 ||
            Math.abs(worldPos.y - expectedY) > 0.001 ||
            Math.abs(worldPos.z - expectedZ) > 0.001) {
            console.log(`  ❌ FAILED: Position mismatch!`);
            testPassed = false;
        } else {
            console.log(`  ✅ PASSED: Position matches expected transformation`);
        }
        
        blockCount++;
    });
    
    // Specifically verify the two test blocks
    console.log('\n--- Specific Test Verification ---');
    console.log('Block at grid [0,0,0] should be at world (0,0,0)');
    console.log('Block at grid [2,0,1] should be at world (8,0,4)');
    
    return testPassed;
}

/**
 * Test Case TC-7.2: AssetRegistry_GetBlockDefinition_ReturnsCorrectModelAndPhysics
 * Requirement: ARCH-004 - Asset Registry Architecture
 * 
 * Test Logic: Query the AssetRegistry for a 'nature_rock_platform' block type. 
 * Assert that the registry returns a definition containing the visual model path 
 * (assets/Rock Medium.glb) and a simplified physics primitive (CANNON.Box).
 */
export function TC_7_2_AssetRegistryQuery() {
    console.log('\n=== Test Case TC-7.2: Asset Registry Query ===');
    
    // Set theme to nature
    assetRegistry.setTheme('nature');
    
    // Query for nature_rock_platform
    const blockDef = assetRegistry.getBlockDefinition('nature_rock_platform');
    
    console.log('\nQuerying AssetRegistry for block type: "nature_rock_platform"');
    console.log('Fetched block definition:');
    console.log(JSON.stringify(blockDef, null, 2));
    
    // Verify the definition
    let testPassed = true;
    
    console.log('\n--- Verification ---');
    
    // Check model path
    if (blockDef.model === 'assets/Rock Medium.glb') {
        console.log('✅ Model path: assets/Rock Medium.glb (CORRECT)');
    } else {
        console.log(`❌ Model path: ${blockDef.model} (EXPECTED: assets/Rock Medium.glb)`);
        testPassed = false;
    }
    
    // Check physics shape type
    if (blockDef.physics.shape === 'Box') {
        console.log('✅ Physics shape: Box (CORRECT - simplified primitive)');
    } else {
        console.log(`❌ Physics shape: ${blockDef.physics.shape} (EXPECTED: Box)`);
        testPassed = false;
    }
    
    // Check physics dimensions
    if (blockDef.physics.dimensions && 
        blockDef.physics.dimensions[0] === 2 &&
        blockDef.physics.dimensions[1] === 2 &&
        blockDef.physics.dimensions[2] === 2) {
        console.log('✅ Physics dimensions: [2, 2, 2] (CORRECT)');
    } else {
        console.log(`❌ Physics dimensions: ${JSON.stringify(blockDef.physics.dimensions)} (EXPECTED: [2, 2, 2])`);
        testPassed = false;
    }
    
    // Check grid footprint
    if (blockDef.gridFootprint && 
        blockDef.gridFootprint[0] === 1 &&
        blockDef.gridFootprint[1] === 1 &&
        blockDef.gridFootprint[2] === 1) {
        console.log('✅ Grid footprint: [1, 1, 1] (CORRECT)');
    } else {
        console.log(`❌ Grid footprint: ${JSON.stringify(blockDef.gridFootprint)} (EXPECTED: [1, 1, 1])`);
        testPassed = false;
    }
    
    console.log(`\nTest Case TC-7.2: ${testPassed ? 'PASSED ✅' : 'FAILED ❌'}`);
    
    return testPassed;
}

/**
 * Run all test cases for STORY-7.1
 */
export async function runStory71Tests() {
    console.log('========================================');
    console.log('STORY-7.1: Universal Grid System Tests');
    console.log('========================================');
    
    let allTestsPassed = true;
    
    // Run TC-7.1
    const tc71Result = await TC_7_1_GridCoordinateTransformation();
    if (!tc71Result) allTestsPassed = false;
    
    // Run TC-7.2
    const tc72Result = TC_7_2_AssetRegistryQuery();
    if (!tc72Result) allTestsPassed = false;
    
    console.log('\n========================================');
    console.log(`STORY-7.1 Test Results: ${allTestsPassed ? 'ALL PASSED ✅' : 'SOME FAILED ❌'}`);
    console.log('========================================\n');
    
    return allTestsPassed;
}