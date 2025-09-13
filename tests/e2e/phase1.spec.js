// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Phase 1: Core Engine Setup & Player Movement', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the game page
    await page.goto('/');
    
    // Wait for the game to initialize
    await page.waitForFunction(() => {
      return typeof THREE !== 'undefined' && typeof CANNON !== 'undefined';
    });
    
    // Wait a bit more for scene setup
    await page.waitForTimeout(1000);
  });

  test('TC-1.1: System_Initialize_RenderScene_DisplaysCorrectly', async ({ page }) => {
    // Test that the scene renders correctly with floor, sphere, and lighting
    
    // Check that THREE.js is loaded
    const threeLoaded = await page.evaluate(() => typeof THREE !== 'undefined');
    expect(threeLoaded).toBe(true);
    
    // Check that CANNON.js is loaded
    const cannonLoaded = await page.evaluate(() => typeof CANNON !== 'undefined');
    expect(cannonLoaded).toBe(true);
    
    // Check that the canvas exists
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Verify scene objects through console output
    const sceneInfo = await page.evaluate(() => {
      const scene = window.game?.scene;
      if (!scene) return null;
      
      const objects = {
        hasFloor: false,
        hasPlayer: false,
        hasLights: false,
        objectCount: scene.children.length
      };
      
      scene.traverse((obj) => {
        if (obj.name === 'floor' && obj.type === 'Mesh') objects.hasFloor = true;
        if (obj.name === 'player' && obj.type === 'Mesh') objects.hasPlayer = true;
        if (obj.type === 'AmbientLight' || obj.type === 'DirectionalLight') objects.hasLights = true;
      });
      
      return objects;
    });
    
    expect(sceneInfo).not.toBeNull();
    expect(sceneInfo.hasFloor).toBe(true);
    expect(sceneInfo.hasPlayer).toBe(true);
    expect(sceneInfo.hasLights).toBe(true);
    expect(sceneInfo.objectCount).toBeGreaterThanOrEqual(4); // floor, player, ambient light, directional light
    
    // Take a screenshot for evidence
    await page.screenshot({ path: 'tests/e2e/evidence/TC-1.1-scene-render.png' });
  });

  test('TC-1.2: PlayerController_HandleInput_AppliesForceForRolling', async ({ page }) => {
    // Test that player movement with rolling physics works correctly
    
    // Get initial player position
    const initialPosition = await page.evaluate(() => {
      return window.game?.playerMesh?.position ? {
        x: window.game.playerMesh.position.x,
        y: window.game.playerMesh.position.y,
        z: window.game.playerMesh.position.z
      } : null;
    });
    
    expect(initialPosition).not.toBeNull();
    console.log('Initial position:', initialPosition);
    
    // Simulate forward movement (W key or ArrowUp)
    await page.keyboard.down('w');
    
    // Hold for 2 seconds
    await page.waitForTimeout(2000);
    
    // Release key
    await page.keyboard.up('w');
    
    // Wait a bit for physics to settle
    await page.waitForTimeout(500);
    
    // Get final player position
    const finalPosition = await page.evaluate(() => {
      return window.game?.playerMesh?.position ? {
        x: window.game.playerMesh.position.x,
        y: window.game.playerMesh.position.y,
        z: window.game.playerMesh.position.z
      } : null;
    });
    
    expect(finalPosition).not.toBeNull();
    console.log('Final position:', finalPosition);
    
    // Verify that the player has moved forward (negative Z direction)
    expect(finalPosition.z).toBeLessThan(initialPosition.z);
    
    // Verify momentum-based movement (should move a reasonable distance)
    const distance = Math.abs(finalPosition.z - initialPosition.z);
    expect(distance).toBeGreaterThan(1); // Should move at least 1 unit
    expect(distance).toBeLessThan(10); // But not unreasonably far
    
    // Log evidence
    console.log(`Player moved ${distance.toFixed(2)} units forward with momentum`);
  });

  test('TC-1.3: PlayerController_HandleInput_AppliesUpwardImpulseForJumping', async ({ page }) => {
    // Test that jumping with upward impulse and gravity works correctly
    
    // Track Y positions over time
    const yPositions = [];
    
    // Start tracking position
    const trackingPromise = page.evaluate(async () => {
      const positions = [];
      const startTime = Date.now();
      
      // Record initial position
      positions.push({
        time: 0,
        y: window.game?.playerMesh?.position.y || 0
      });
      
      // Track for 2 seconds
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          const y = window.game?.playerMesh?.position.y || 0;
          positions.push({ time: elapsed, y });
          
          if (elapsed >= 2) {
            clearInterval(interval);
            resolve(positions);
          }
        }, 50); // Sample every 50ms
      });
    });
    
    // Wait a moment then trigger jump
    await page.waitForTimeout(100);
    await page.keyboard.press('Space');
    
    // Wait for tracking to complete
    const positions = await trackingPromise;
    
    expect(positions).toBeDefined();
    expect(positions.length).toBeGreaterThan(0);
    
    // Analyze jump trajectory
    const startY = positions[0].y;
    const maxY = Math.max(...positions.map(p => p.y));
    const endY = positions[positions.length - 1].y;
    
    console.log('Jump trajectory:');
    console.log(`  Start Y: ${startY.toFixed(3)}`);
    console.log(`  Peak Y: ${maxY.toFixed(3)}`);
    console.log(`  End Y: ${endY.toFixed(3)}`);
    console.log(`  Jump height: ${(maxY - startY).toFixed(3)}`);
    
    // Verify jump behavior
    expect(maxY).toBeGreaterThan(startY + 0.5); // Should jump at least 0.5 units
    expect(maxY).toBeLessThan(startY + 5); // But not unreasonably high
    expect(Math.abs(endY - startY)).toBeLessThan(0.2); // Should return close to starting height
    
    // Verify parabolic trajectory (goes up then down)
    const peakIndex = positions.findIndex(p => p.y === maxY);
    expect(peakIndex).toBeGreaterThan(0); // Peak should not be at start
    expect(peakIndex).toBeLessThan(positions.length - 1); // Peak should not be at end
  });

  test('Full Regression: All Phase 1 Requirements', async ({ page }) => {
    // Comprehensive test verifying all Phase 1 requirements work together
    
    // 1. Verify scene initialization
    const sceneCheck = await page.evaluate(() => {
      return {
        hasGame: window.game !== undefined,
        hasScene: window.game?.scene !== undefined,
        hasRenderer: window.game?.renderer !== undefined,
        hasCamera: window.game?.camera !== undefined,
        hasPhysics: window.game?.physicsManager !== undefined,
        hasPlayerController: window.game?.playerController !== undefined
      };
    });
    
    expect(sceneCheck.hasGame).toBe(true);
    expect(sceneCheck.hasScene).toBe(true);
    expect(sceneCheck.hasRenderer).toBe(true);
    expect(sceneCheck.hasCamera).toBe(true);
    expect(sceneCheck.hasPhysics).toBe(true);
    expect(sceneCheck.hasPlayerController).toBe(true);
    
    // 2. Test combined movement (forward + jump)
    const startPos = await page.evaluate(() => ({
      x: window.game.playerMesh.position.x,
      y: window.game.playerMesh.position.y,
      z: window.game.playerMesh.position.z
    }));
    
    // Move forward while jumping
    await page.keyboard.down('w');
    await page.waitForTimeout(200);
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    await page.keyboard.up('w');
    
    const endPos = await page.evaluate(() => ({
      x: window.game.playerMesh.position.x,
      y: window.game.playerMesh.position.y,
      z: window.game.playerMesh.position.z
    }));
    
    // Should have moved forward
    expect(endPos.z).toBeLessThan(startPos.z);
    
    // 3. Test all movement directions
    const movements = [
      { key: 'd', axis: 'x', direction: 1 },  // Right
      { key: 'a', axis: 'x', direction: -1 }, // Left
      { key: 's', axis: 'z', direction: 1 },  // Backward
    ];
    
    for (const move of movements) {
      const before = await page.evaluate(() => ({
        x: window.game.playerMesh.position.x,
        z: window.game.playerMesh.position.z
      }));
      
      await page.keyboard.down(move.key);
      await page.waitForTimeout(500);
      await page.keyboard.up(move.key);
      await page.waitForTimeout(200);
      
      const after = await page.evaluate(() => ({
        x: window.game.playerMesh.position.x,
        z: window.game.playerMesh.position.z
      }));
      
      const delta = after[move.axis] - before[move.axis];
      expect(Math.sign(delta)).toBe(move.direction);
    }
    
    // 4. Performance check - verify 60 FPS target
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        
        function countFrame() {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            resolve({
              fps: frameCount,
              duration: performance.now() - startTime
            });
          }
        }
        
        requestAnimationFrame(countFrame);
      });
    });
    
    console.log(`Performance: ${performanceMetrics.fps} FPS`);
    expect(performanceMetrics.fps).toBeGreaterThan(30); // At least 30 FPS
    
    // Take final screenshot
    await page.screenshot({ path: 'tests/e2e/evidence/phase1-regression.png' });
  });
});