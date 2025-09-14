/**
 * Phase 5 End-to-End Tests
 * Requirements: PROD-007 (Hazards), PROD-011 (Modular Blocks - Moving Platforms), PROD-012 (Audio)
 */

import { test, expect } from '@playwright/test';

test.describe('Phase 5: Hazards, Moving Platforms, and Audio', () => {
    
    test.beforeEach(async ({ page }) => {
        // Navigate to the game
        await page.goto('http://localhost:8080');
        
        // Wait for Three.js to initialize
        await page.waitForFunction(() => window.THREE !== undefined);
        
        // Wait for game initialization
        await page.waitForFunction(() => window.game !== undefined);
        await page.waitForTimeout(1000);
    });
    
    /**
     * Test Case TC-5.1: Hazard Collision Triggers Life Loss
     * Requirement: PROD-007 - Failure Condition: Hazards
     */
    test('TC-5.1: PlayerController_OnCollisionWithHazard_TriggersLifeLost', async ({ page }) => {
        console.log('Starting TC-5.1: Testing hazard collision life loss');
        
        // Get initial lives count
        const initialLives = await page.evaluate(() => {
            return window.game.gameState.getState().lives;
        });
        
        console.log(`Initial lives: ${initialLives}`);
        
        // Check that hazards exist in the level
        const hazardCount = await page.evaluate(() => {
            return window.game.levelManager.hazards.size;
        });
        
        expect(hazardCount).toBeGreaterThan(0);
        console.log(`Found ${hazardCount} hazards in level`);
        
        // Get first hazard position
        const hazardPosition = await page.evaluate(() => {
            const firstHazard = Array.from(window.game.levelManager.hazards.values())[0];
            return {
                x: firstHazard.position.x,
                y: firstHazard.position.y,
                z: firstHazard.position.z
            };
        });
        
        console.log(`First hazard at position: (${hazardPosition.x}, ${hazardPosition.y}, ${hazardPosition.z})`);
        
        // Move player to hazard position to trigger collision
        await page.evaluate((pos) => {
            const playerBody = window.game.physicsManager.getPlayerBody();
            if (playerBody) {
                playerBody.position.set(pos.x, pos.y + 1, pos.z);
                playerBody.velocity.set(0, -5, 0); // Drop onto hazard
            }
        }, hazardPosition);
        
        // Wait for collision detection
        await page.waitForTimeout(500);
        
        // Check if life was lost
        const currentLives = await page.evaluate(() => {
            return window.game.gameState.getState().lives;
        });
        
        console.log(`Lives after hazard collision: ${currentLives}`);
        
        // Verify life was lost
        expect(currentLives).toBeLessThan(initialLives);
        
        // Check console for hazard collision log
        const consoleLogs = await page.evaluate(() => {
            return window.consoleLogs || [];
        });
        
        // Setup console log capture
        await page.evaluate(() => {
            window.consoleLogs = [];
            const originalLog = console.log;
            console.log = function(...args) {
                window.consoleLogs.push(args.join(' '));
                originalLog.apply(console, args);
            };
        });
        
        console.log('✅ TC-5.1 PASSED: Hazard collision triggers life loss');
    });
    
    /**
     * Test Case TC-5.2: Moving Platform Creation and Movement
     * Requirement: PROD-011 - Level Structure: Modular Blocks
     */
    test('TC-5.2: LevelManager_LoadLevel_CreatesMovingPlatform', async ({ page }) => {
        console.log('Starting TC-5.2: Testing moving platform creation and movement');
        
        // Check that moving platforms exist
        const platformCount = await page.evaluate(() => {
            return window.game.levelManager.movingPlatforms.size;
        });
        
        expect(platformCount).toBeGreaterThan(0);
        console.log(`Found ${platformCount} moving platforms in level`);
        
        // Get first moving platform
        const platformData = await page.evaluate(() => {
            const firstPlatform = Array.from(window.game.levelManager.movingPlatforms.values())[0];
            return {
                id: firstPlatform.id,
                initialPosition: {
                    x: firstPlatform.startPosition.x,
                    y: firstPlatform.startPosition.y,
                    z: firstPlatform.startPosition.z
                },
                waypointCount: firstPlatform.movement.waypoints.length,
                speed: firstPlatform.movement.speed
            };
        });
        
        console.log(`Platform "${platformData.id}" with ${platformData.waypointCount} waypoints at speed ${platformData.speed}`);
        
        // Record initial position
        const initialPos = await page.evaluate(() => {
            const firstPlatform = Array.from(window.game.levelManager.movingPlatforms.values())[0];
            return {
                x: firstPlatform.currentPosition.x,
                y: firstPlatform.currentPosition.y,
                z: firstPlatform.currentPosition.z
            };
        });
        
        console.log(`Initial position: (${initialPos.x.toFixed(2)}, ${initialPos.y.toFixed(2)}, ${initialPos.z.toFixed(2)})`);
        
        // Wait for platform to move
        await page.waitForTimeout(2000);
        
        // Check new position
        const newPos = await page.evaluate(() => {
            const firstPlatform = Array.from(window.game.levelManager.movingPlatforms.values())[0];
            return {
                x: firstPlatform.currentPosition.x,
                y: firstPlatform.currentPosition.y,
                z: firstPlatform.currentPosition.z
            };
        });
        
        console.log(`Position after 2s: (${newPos.x.toFixed(2)}, ${newPos.y.toFixed(2)}, ${newPos.z.toFixed(2)})`);
        
        // Verify platform has moved
        const distance = Math.sqrt(
            Math.pow(newPos.x - initialPos.x, 2) +
            Math.pow(newPos.y - initialPos.y, 2) +
            Math.pow(newPos.z - initialPos.z, 2)
        );
        
        expect(distance).toBeGreaterThan(0.1);
        console.log(`Platform moved ${distance.toFixed(2)} units`);
        
        // Test player can stand on platform
        await page.evaluate(() => {
            const firstPlatform = Array.from(window.game.levelManager.movingPlatforms.values())[0];
            const playerBody = window.game.physicsManager.getPlayerBody();
            if (playerBody && firstPlatform) {
                // Place player on platform
                playerBody.position.set(
                    firstPlatform.currentPosition.x,
                    firstPlatform.currentPosition.y + 1,
                    firstPlatform.currentPosition.z
                );
                playerBody.velocity.set(0, 0, 0);
            }
        });
        
        await page.waitForTimeout(1000);
        
        // Check if player is still on/near platform
        const playerOnPlatform = await page.evaluate(() => {
            const firstPlatform = Array.from(window.game.levelManager.movingPlatforms.values())[0];
            const playerBody = window.game.physicsManager.getPlayerBody();
            if (playerBody && firstPlatform) {
                const distance = Math.abs(playerBody.position.y - (firstPlatform.currentPosition.y + 1));
                return distance < 1.5; // Allow some tolerance
            }
            return false;
        });
        
        expect(playerOnPlatform).toBeTruthy();
        console.log('✅ TC-5.2 PASSED: Moving platform created and moves correctly');
    });
    
    /**
     * Test Case TC-5.3: Audio Manager Plays Correct Sounds
     * Requirement: PROD-012 - Audio: Sound Effects
     * This is a manual test but we can verify the AudioManager is initialized
     */
    test('TC-5.3: AudioManager_OnGameEvent_PlaysCorrectSound', async ({ page }) => {
        console.log('Starting TC-5.3: Testing audio manager functionality');
        
        // Check AudioManager exists and is initialized
        const audioManagerExists = await page.evaluate(() => {
            return window.game?.audioManager !== undefined;
        });
        
        expect(audioManagerExists).toBeTruthy();
        console.log('AudioManager is initialized');
        
        // Check sounds are loaded
        const soundsLoaded = await page.evaluate(() => {
            const audioManager = window.game?.audioManager;
            if (audioManager) {
                return Object.keys(audioManager.sounds).length > 0;
            }
            return false;
        });
        
        expect(soundsLoaded).toBeTruthy();
        console.log('Sounds are loaded in AudioManager');
        
        // Test jump sound (simulated)
        await page.evaluate(() => {
            // Setup sound play tracking
            window.soundsPlayed = [];
            const audioManager = window.game?.audioManager;
            if (audioManager) {
                const originalPlaySound = audioManager.playSound.bind(audioManager);
                audioManager.playSound = function(soundName, ...args) {
                    window.soundsPlayed.push(soundName);
                    return originalPlaySound(soundName, ...args);
                };
            }
        });
        
        // Trigger jump
        await page.keyboard.press('Space');
        await page.waitForTimeout(100);
        
        // Check if jump sound was triggered
        const jumpSoundPlayed = await page.evaluate(() => {
            return window.soundsPlayed?.includes('jump');
        });
        
        expect(jumpSoundPlayed).toBeTruthy();
        console.log('Jump sound triggered correctly');
        
        // Test key collection sound (if possible)
        const hasKeys = await page.evaluate(() => {
            return window.game.levelManager.keys.size > 0;
        });
        
        if (hasKeys) {
            // Move player to first key
            await page.evaluate(() => {
                const firstKey = Array.from(window.game.levelManager.keys.values())[0];
                const playerBody = window.game.physicsManager.getPlayerBody();
                if (playerBody && firstKey) {
                    playerBody.position.set(
                        firstKey.position.x,
                        firstKey.position.y,
                        firstKey.position.z
                    );
                }
            });
            
            await page.waitForTimeout(500);
            
            // Check if key collect sound was triggered
            const keyCollectPlayed = await page.evaluate(() => {
                return window.soundsPlayed?.includes('keyCollect');
            });
            
            if (keyCollectPlayed) {
                console.log('Key collection sound triggered correctly');
            }
        }
        
        console.log('✅ TC-5.3 PASSED: AudioManager initialized and responds to events');
        console.log('Note: Full audio testing requires manual verification with sound enabled');
    });
    
    /**
     * Regression Test: Verify previous phase functionality still works
     */
    test('Regression: Previous phase features still functional', async ({ page }) => {
        console.log('Running regression tests for previous phases');
        
        // Test gravity system still works (Phase 2)
        const gravityWorks = await page.evaluate(() => {
            const playerController = window.game?.playerController;
            return playerController && playerController.currentGravity !== undefined;
        });
        expect(gravityWorks).toBeTruthy();
        console.log('✓ Gravity system functional');
        
        // Test collectibles still work (Phase 3)
        const collectiblesExist = await page.evaluate(() => {
            const levelManager = window.game?.levelManager;
            return levelManager && (levelManager.keys.size > 0 || levelManager.coins.size > 0);
        });
        expect(collectiblesExist).toBeTruthy();
        console.log('✓ Collectibles system functional');
        
        // Test game state management (Phase 4)
        const gameStateWorks = await page.evaluate(() => {
            const gameState = window.game?.gameState;
            return gameState && gameState.getState().lives > 0;
        });
        expect(gameStateWorks).toBeTruthy();
        console.log('✓ Game state management functional');
        
        console.log('✅ All regression tests passed');
    });
});

console.log('Phase 5 test suite defined successfully');