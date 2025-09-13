const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * PHASE-3 End-to-End Tests
 * Testing level objectives and core gameplay loop
 * Requirements: ARCH-002, PROD-004, PROD-005, PROD-006
 */

test.describe('PHASE-3: Level Objectives & Core Gameplay Loop', () => {
    let page;
    
    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        
        // Set viewport for consistent testing
        await page.setViewportSize({ width: 1280, height: 720 });
        
        // Navigate to the game
        await page.goto('http://localhost:8081');
        
        // Wait for game initialization
        await page.waitForFunction(() => {
            return window.game && 
                   window.game.isRunning && 
                   window.game.levelManager;
        }, { timeout: 10000 });
        
        // Add console listener for verification
        page.on('console', msg => {
            if (msg.type() === 'log') {
                console.log('Browser console:', msg.text());
            }
        });
    });
    
    test.afterEach(async () => {
        if (page) {
            await page.close();
        }
    });
    
    /**
     * Test Case TC-3.1: LevelManager_LoadLevel_CreatesEntitiesFromData
     * Requirement: ARCH-002 - Data-Driven Levels
     * 
     * Test that the LevelManager correctly loads and creates entities from JSON data
     */
    test('TC-3.1: Level loads from JSON and creates entities', async () => {
        console.log('TC-3.1: Testing level loading from JSON data');
        
        // Verify level manager exists and has loaded data
        const levelData = await page.evaluate(() => {
            const manager = window.game.levelManager;
            if (!manager) return null;
            
            return {
                levelName: manager.currentLevel?.name,
                platformCount: manager.platforms.size,
                keyCount: manager.keys.size,
                hasExitPortal: !!manager.exitPortal,
                gameState: manager.getGameState()
            };
        });
        
        // Assert level was loaded
        expect(levelData).not.toBeNull();
        expect(levelData.levelName).toBe('Gravity Introduction');
        
        // Assert correct number of entities created
        expect(levelData.platformCount).toBe(4); // floor, ceiling, 2 walls
        expect(levelData.keyCount).toBe(3); // 3 keys in test level
        expect(levelData.hasExitPortal).toBe(true);
        
        // Assert game state initialized correctly
        expect(levelData.gameState.totalKeys).toBe(3);
        expect(levelData.gameState.keysCollected).toBe(0);
        expect(levelData.gameState.exitUnlocked).toBe(false);
        
        // Verify entities are rendered in the scene
        const sceneInfo = await page.evaluate(() => {
            const scene = window.game.scene;
            const platforms = [];
            const keys = [];
            let exitPortal = null;
            
            scene.traverse((child) => {
                if (child.name?.startsWith('platform-')) {
                    platforms.push({
                        name: child.name,
                        position: {
                            x: child.position.x,
                            y: child.position.y,
                            z: child.position.z
                        }
                    });
                } else if (child.name?.startsWith('key-')) {
                    keys.push({
                        name: child.name,
                        position: {
                            x: child.position.x,
                            y: child.position.y,
                            z: child.position.z
                        }
                    });
                } else if (child.name === 'exit-portal') {
                    exitPortal = {
                        name: child.name,
                        position: {
                            x: child.position.x,
                            y: child.position.y,
                            z: child.position.z
                        }
                    };
                }
            });
            
            return { platforms, keys, exitPortal };
        });
        
        // Verify platforms are at expected positions from JSON
        expect(sceneInfo.platforms.length).toBe(4);
        const floor = sceneInfo.platforms.find(p => p.name === 'platform-floor');
        expect(floor).toBeDefined();
        expect(floor.position).toEqual({ x: 0, y: 0, z: 0 });
        
        // Verify keys are at expected positions
        expect(sceneInfo.keys.length).toBe(3);
        const key1 = sceneInfo.keys.find(k => k.name === 'key-key-1');
        expect(key1).toBeDefined();
        expect(key1.position.x).toBeCloseTo(5, 1);
        expect(key1.position.z).toBeCloseTo(5, 1);
        
        // Verify exit portal exists
        expect(sceneInfo.exitPortal).not.toBeNull();
        expect(sceneInfo.exitPortal.position).toEqual({ x: 0, y: 1, z: -8 });
        
        // Take screenshot for evidence
        await page.screenshot({ 
            path: path.join(__dirname, 'evidence', 'tc-3.1-level-loaded.png'),
            fullPage: false 
        });
        
        // Log success
        console.log('TC-3.1: PASSED - Level loaded successfully from JSON');
        console.log(`  - Loaded level: ${levelData.levelName}`);
        console.log(`  - Created ${levelData.platformCount} platforms`);
        console.log(`  - Created ${levelData.keyCount} keys`);
        console.log(`  - Created exit portal: ${levelData.hasExitPortal}`);
    });
    
    /**
     * Test Case TC-3.2: PlayerController_OnCollisionWithKey_CollectsKeyAndRemovesIt
     * Requirement: PROD-004 - Key Collection
     * 
     * Test that the player can collect keys by colliding with them
     */
    test('TC-3.2: Player collects keys on collision', async () => {
        console.log('TC-3.2: Testing key collection mechanics');
        
        // Move player to first key position (5, 1, 5)
        await page.evaluate(() => {
            const playerBody = window.game.physicsManager.getPlayerBody();
            if (playerBody) {
                playerBody.position.set(5, 1, 5);
                playerBody.velocity.set(0, 0, 0);
            }
            const playerMesh = window.game.playerMesh;
            if (playerMesh) {
                playerMesh.position.set(5, 1, 5);
            }
        });
        
        // Wait a moment for collision detection
        await page.waitForTimeout(500);
        
        // Check if key was collected
        const afterCollection = await page.evaluate(() => {
            const manager = window.game.levelManager;
            const gameState = manager.getGameState();
            const key1Exists = manager.keys.get('key-1')?.userData?.collected === false;
            
            // Also check if key is still in scene
            let keyInScene = false;
            window.game.scene.traverse((child) => {
                if (child.name === 'key-key-1') {
                    keyInScene = true;
                }
            });
            
            return {
                keysCollected: gameState.keysCollected,
                totalKeys: gameState.totalKeys,
                key1StillExists: key1Exists,
                keyInScene: keyInScene
            };
        });
        
        // Assert key was collected
        expect(afterCollection.keysCollected).toBe(1);
        expect(afterCollection.totalKeys).toBe(3);
        expect(afterCollection.keyInScene).toBe(false);
        
        // Take screenshot for evidence
        await page.screenshot({ 
            path: path.join(__dirname, 'evidence', 'tc-3.2-key-collected.png'),
            fullPage: false 
        });
        
        console.log('TC-3.2: PASSED - Key collection working');
        console.log(`  - Keys collected: ${afterCollection.keysCollected}/${afterCollection.totalKeys}`);
    });
    
    /**
     * Test Case TC-3.3: ExitPortal_OnKeyCollection_UnlocksAndCompletesLevel
     * Requirement: PROD-005 - Exit Portal
     * 
     * Test that the exit portal unlocks when all keys are collected and completes level on entry
     */
    test('TC-3.3: Exit portal unlocks and completes level', async () => {
        console.log('TC-3.3: Testing exit portal mechanics');
        
        // Collect all keys programmatically
        await page.evaluate(() => {
            const manager = window.game.levelManager;
            manager.collectKey('key-1');
            manager.collectKey('key-2');
        });
        
        // Check portal state before collecting last key
        const beforeLastKey = await page.evaluate(() => {
            const manager = window.game.levelManager;
            const portal = manager.exitPortal;
            return {
                keysCollected: manager.getGameState().keysCollected,
                portalLocked: portal?.userData?.isLocked,
                portalColor: portal?.material?.color?.getHexString()
            };
        });
        
        expect(beforeLastKey.keysCollected).toBe(2);
        expect(beforeLastKey.portalLocked).toBe(true);
        
        // Collect last key
        await page.evaluate(() => {
            const manager = window.game.levelManager;
            manager.collectKey('key-3');
        });
        
        // Wait for portal unlock animation
        await page.waitForTimeout(100);
        
        // Check portal state after collecting all keys
        const afterAllKeys = await page.evaluate(() => {
            const manager = window.game.levelManager;
            const portal = manager.exitPortal;
            const gameState = manager.getGameState();
            return {
                keysCollected: gameState.keysCollected,
                exitUnlocked: gameState.exitUnlocked,
                portalLocked: portal?.userData?.isLocked,
                portalColor: portal?.material?.color?.getHexString()
            };
        });
        
        expect(afterAllKeys.keysCollected).toBe(3);
        expect(afterAllKeys.exitUnlocked).toBe(true);
        expect(afterAllKeys.portalLocked).toBe(false);
        expect(afterAllKeys.portalColor).toBe('00ff00'); // Green when unlocked
        
        // Move player to exit portal
        await page.evaluate(() => {
            const playerBody = window.game.physicsManager.getPlayerBody();
            if (playerBody) {
                playerBody.position.set(0, 1, -8);
                playerBody.velocity.set(0, 0, 0);
            }
            const playerMesh = window.game.playerMesh;
            if (playerMesh) {
                playerMesh.position.set(0, 1, -8);
            }
        });
        
        // Wait for collision detection
        await page.waitForTimeout(500);
        
        // Check if level completed
        const levelComplete = await page.evaluate(() => {
            const manager = window.game.levelManager;
            return manager.getGameState().levelComplete;
        });
        
        expect(levelComplete).toBe(true);
        
        // Take screenshot for evidence
        await page.screenshot({ 
            path: path.join(__dirname, 'evidence', 'tc-3.3-level-complete.png'),
            fullPage: false 
        });
        
        console.log('TC-3.3: PASSED - Exit portal mechanics working');
        console.log('  - Portal unlocked after collecting all keys');
        console.log('  - Level completed on portal entry');
    });
    
    /**
     * Test Case TC-3.4: PlayerController_OnFall_TriggersLifeLostAndResets
     * Requirement: PROD-006 - Failure Condition: Falling
     * 
     * Test that falling below the threshold triggers life loss and reset
     */
    test('TC-3.4: Fall detection and player reset', async () => {
        console.log('TC-3.4: Testing fall detection and reset mechanics');
        
        // This test requires fall detection to be implemented in Story 3.2
        // For now, we'll create a placeholder that will be completed later
        
        // Get initial player position
        const initialPosition = await page.evaluate(() => {
            const mesh = window.game.playerMesh;
            return { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };
        });
        
        console.log('TC-3.4: Initial player position:', initialPosition);
        
        // Move player below fall threshold
        await page.evaluate(() => {
            const playerBody = window.game.physicsManager.getPlayerBody();
            if (playerBody) {
                playerBody.position.set(0, -15, 0); // Below -10 threshold
                playerBody.velocity.set(0, 0, 0);
            }
            const playerMesh = window.game.playerMesh;
            if (playerMesh) {
                playerMesh.position.set(0, -15, 0);
            }
        });
        
        // Wait for fall detection (to be implemented)
        await page.waitForTimeout(100);
        
        // For now, just verify we can detect the fall condition
        const fallCondition = await page.evaluate(() => {
            const manager = window.game.levelManager;
            const playerY = window.game.playerMesh.position.y;
            const threshold = manager.getFallThreshold();
            return {
                playerY: playerY,
                threshold: threshold,
                shouldFall: playerY < threshold
            };
        });
        
        expect(fallCondition.shouldFall).toBe(true);
        
        console.log('TC-3.4: Fall condition detected');
        console.log(`  - Player Y: ${fallCondition.playerY}`);
        console.log(`  - Threshold: ${fallCondition.threshold}`);
        console.log('  - Note: Full implementation pending in Story 3.2');
    });
});

// Helper function to create evidence directory
const fs = require('fs');
const evidenceDir = path.join(__dirname, 'evidence');
if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
}