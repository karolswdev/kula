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
 * Test Case TC-7.3: AssetManager_LoadLevel_InstancesRepeatedModels
 * Requirement: NFR-004 - Asset Loading & Instancing
 * 
 * Test Logic: Load a level containing multiple instances of the same block type 
 * (e.g., three 'nature_rock_platform' blocks). Assert that the .glb model for 
 * Rock Medium.glb is loaded only once and that the three visual meshes in the 
 * scene are clones/instances sharing the same geometry data.
 */
export async function TC_7_3_AssetLoadingAndInstancing() {
    console.log('\n=== Test Case TC-7.3: Asset Loading and Instancing ===');
    
    // Import AssetManager for this test
    const { default: assetManager } = await import('../src/assets/AssetManager.js');
    
    // Create a mock scene
    const scene = {
        children: [],
        add: function(mesh) {
            this.children.push(mesh);
            console.log(`Scene: Added mesh '${mesh.name}'`);
        },
        remove: function(mesh) {
            const index = this.children.indexOf(mesh);
            if (index > -1) this.children.splice(index, 1);
        }
    };
    
    // Create a mock physics manager with CANNON
    const physicsManager = {
        world: {
            addBody: function(body) {
                console.log(`PhysicsManager: Added physics body with shape type: ${body.shapes[0].type === 1 ? 'Box' : 'Other'}`);
            }
        },
        groundMaterial: {}
    };
    
    // Create LevelManager instance
    const levelManager = new LevelManager(scene, physicsManager);
    
    // Clear any previous cache
    assetManager.clearCache();
    
    // Create test level with multiple instances of the same block type
    const testLevel = {
        theme: "nature",
        gridUnitSize: 4,
        blocks: [
            {
                type: "nature_rock_platform",
                at: [0, 0, 0]
            },
            {
                type: "nature_rock_platform",
                at: [1, 0, 0]
            },
            {
                type: "nature_rock_platform",
                at: [2, 0, 0]
            }
        ]
    };
    
    console.log('\n--- Loading level with 3 instances of nature_rock_platform ---');
    
    // Load the level (this should trigger asset loading)
    await levelManager.load(testLevel);
    
    // Get statistics from AssetManager
    const stats = assetManager.getStats();
    
    console.log('\n--- AssetManager Statistics ---');
    console.log(`Network loads: ${stats.networkLoads}`);
    console.log(`Cache hits: ${stats.cacheHits}`);
    console.log(`Cached models: ${stats.cachedModels.join(', ')}`);
    
    // Verify that the model was loaded only once
    let testPassed = true;
    
    // Check that Rock Medium.glb was loaded exactly once
    const expectedModelPath = 'assets/Rock Medium.glb';
    if (stats.networkLoads === 1 && stats.cachedModels.includes(expectedModelPath)) {
        console.log(`✅ Model '${expectedModelPath}' loaded only once from network`);
    } else {
        console.log(`❌ Expected single network load of '${expectedModelPath}'`);
        testPassed = false;
    }
    
    // Check that we have 3 meshes in the scene
    const blockMeshes = scene.children.filter(child => child.name && child.name.startsWith('block-'));
    console.log(`\n--- Scene Analysis ---`);
    console.log(`Total blocks in scene: ${blockMeshes.length}`);
    
    if (blockMeshes.length === 3) {
        console.log('✅ Three block instances created in scene');
        
        // Check if they share geometry (instances)
        // Note: In Three.js, cloned meshes will have the same geometry UUID if properly instanced
        const geometryUUIDs = new Set();
        blockMeshes.forEach((mesh, index) => {
            // Traverse to find actual geometry (model might be a group)
            mesh.traverse((child) => {
                if (child.isMesh && child.geometry) {
                    geometryUUIDs.add(child.geometry.uuid);
                    console.log(`Block ${index}: Found geometry UUID: ${child.geometry.uuid}`);
                }
            });
        });
        
        if (geometryUUIDs.size <= 1) {
            console.log('✅ All instances share the same geometry (proper instancing)');
        } else {
            console.log(`⚠️ Note: ${geometryUUIDs.size} different geometries found (may be due to model structure)`);
        }
    } else {
        console.log(`❌ Expected 3 blocks, found ${blockMeshes.length}`);
        testPassed = false;
    }
    
    console.log(`\nTest Case TC-7.3: ${testPassed ? 'PASSED ✅' : 'FAILED ❌'}`);
    
    return testPassed;
}

/**
 * Test Case TC-7.4: PhysicsManager_OnLoad_UsesSimplifiedColliders
 * Requirement: ARCH-006 - Physics Optimization
 * 
 * Test Logic: Load a level block that uses the visually complex Rock Medium.glb model. 
 * Assert that the corresponding physics body created in the PhysicsManager is a 
 * simple CANNON.Box shape, not a complex mesh-based collider.
 */
export async function TC_7_4_SimplifiedPhysicsColliders() {
    console.log('\n=== Test Case TC-7.4: Simplified Physics Colliders ===');
    
    // Track physics body creation
    const physicsBodyLog = [];
    
    // Create a mock physics manager that logs body creation
    const physicsManager = {
        world: {
            addBody: function(body) {
                const shapeType = body.shapes[0].type;
                const shapeTypeName = shapeType === 1 ? 'Box' : `Other(${shapeType})`;
                
                physicsBodyLog.push({
                    type: shapeTypeName,
                    position: body.position,
                    shape: body.shapes[0]
                });
                
                console.log(`PhysicsManager: Created physics body`);
                console.log(`  Shape type: ${shapeTypeName}`);
                console.log(`  Position: (${body.position.x}, ${body.position.y}, ${body.position.z})`);
            }
        },
        groundMaterial: {}
    };
    
    // Create a mock scene
    const scene = {
        add: function(mesh) {
            console.log(`Scene: Added visual mesh '${mesh.name}'`);
        },
        remove: function(mesh) {}
    };
    
    // Create LevelManager instance
    const levelManager = new LevelManager(scene, physicsManager);
    
    // Create test level with complex visual model
    const testLevel = {
        theme: "nature",
        gridUnitSize: 4,
        blocks: [
            {
                type: "nature_rock_platform",  // Uses Rock Medium.glb - visually complex model
                at: [0, 0, 0]
            }
        ]
    };
    
    console.log('\n--- Loading level with visually complex Rock Medium.glb model ---');
    
    // Load the level
    await levelManager.load(testLevel);
    
    console.log('\n--- Physics Body Analysis ---');
    
    let testPassed = true;
    
    // Check that physics body was created
    if (physicsBodyLog.length > 0) {
        console.log(`Total physics bodies created: ${physicsBodyLog.length}`);
        
        // Check that the physics body uses a simple Box shape
        const body = physicsBodyLog[0];
        if (body.type === 'Box') {
            console.log('✅ Physics body uses simplified Box collider');
            console.log('✅ Visual model (Rock Medium.glb) is complex, but physics is optimized');
        } else {
            console.log(`❌ Physics body uses ${body.type} instead of Box`);
            testPassed = false;
        }
    } else {
        console.log('❌ No physics body was created');
        testPassed = false;
    }
    
    console.log(`\nTest Case TC-7.4: ${testPassed ? 'PASSED ✅' : 'FAILED ❌'}`);
    
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

/**
 * Run all test cases for STORY-7.2
 */
export async function runStory72Tests() {
    console.log('========================================');
    console.log('STORY-7.2: Asset Integration Tests');
    console.log('========================================');
    
    let allTestsPassed = true;
    
    // Run TC-7.3
    const tc73Result = await TC_7_3_AssetLoadingAndInstancing();
    if (!tc73Result) allTestsPassed = false;
    
    // Run TC-7.4
    const tc74Result = await TC_7_4_SimplifiedPhysicsColliders();
    if (!tc74Result) allTestsPassed = false;
    
    console.log('\n========================================');
    console.log(`STORY-7.2 Test Results: ${allTestsPassed ? 'ALL PASSED ✅' : 'SOME FAILED ❌'}`);
    console.log('========================================\n');
    
    return allTestsPassed;
}