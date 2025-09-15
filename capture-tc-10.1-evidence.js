#!/usr/bin/env node

/**
 * Evidence capture script for TC-10.1: GameFlowManager_OnLevelComplete_UnlocksAndLoadsNextLevel
 * This script launches the test and captures evidence
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureEvidence() {
    const browser = await chromium.launch({ 
        headless: false,  // Set to false to see the browser
        slowMo: 100  // Slow down actions for visibility
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        recordVideo: {
            dir: 'evidence/phase-10/story-10.1/',
            size: { width: 1280, height: 800 }
        }
    });
    
    const page = await context.newPage();
    
    console.log('Loading game...');
    await page.goto('http://localhost:8080/index.html');
    await page.waitForTimeout(2000);
    
    // Step 1: Capture main menu
    console.log('Step 1: Capturing main menu...');
    await page.screenshot({ 
        path: 'evidence/phase-10/story-10.1/01-main-menu.png',
        fullPage: true 
    });
    
    // Step 2: Navigate to level select
    console.log('Step 2: Navigating to level select...');
    await page.click('#start-button');
    await page.waitForTimeout(1000);
    await page.screenshot({ 
        path: 'evidence/phase-10/story-10.1/02-level-select-initial.png',
        fullPage: true 
    });
    
    // Step 3: Start Level 1
    console.log('Step 3: Starting Level 1...');
    await page.click('.level-card:first-child');
    await page.waitForTimeout(3000);
    await page.screenshot({ 
        path: 'evidence/phase-10/story-10.1/03-level-1-started.png',
        fullPage: true 
    });
    
    // Step 4: Simulate level completion programmatically
    console.log('Step 4: Simulating level completion...');
    await page.evaluate(() => {
        // Access the game objects
        const levelManager = window.game.levelManager;
        const gameState = window.game.gameState;
        
        // Collect all keys and unlock exit
        levelManager.gameState.keysCollected = levelManager.gameState.totalKeys;
        levelManager.gameState.exitUnlocked = true;
        
        // Add some score
        if (gameState) {
            gameState.addScore(500);
        }
        
        // Trigger level complete
        levelManager.completeLevel();
    });
    
    await page.waitForTimeout(1000);
    await page.screenshot({ 
        path: 'evidence/phase-10/story-10.1/04-level-complete-message.png',
        fullPage: true 
    });
    
    // Step 5: Wait for transition to level select
    console.log('Step 5: Waiting for level select screen...');
    await page.waitForTimeout(3000);
    await page.screenshot({ 
        path: 'evidence/phase-10/story-10.1/05-level-select-after-complete.png',
        fullPage: true 
    });
    
    // Step 6: Click on Level 2 (should now be unlocked)
    console.log('Step 6: Clicking on Level 2...');
    const level2Card = await page.$('.level-card:nth-child(2)');
    const isLocked = await level2Card.evaluate(el => el.classList.contains('locked'));
    
    if (isLocked) {
        console.error('ERROR: Level 2 is still locked!');
        await page.screenshot({ 
            path: 'evidence/phase-10/story-10.1/06-error-level-2-locked.png',
            fullPage: true 
        });
    } else {
        console.log('SUCCESS: Level 2 is unlocked!');
        await level2Card.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ 
            path: 'evidence/phase-10/story-10.1/06-level-2-loaded.png',
            fullPage: true 
        });
        
        // Verify level 2 is running
        const levelName = await page.evaluate(() => {
            return window.game.levelManager.currentLevel?.name || 'Unknown';
        });
        console.log(`Current level: ${levelName}`);
    }
    
    // Capture console logs
    const logs = [];
    page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
    
    // Save logs
    fs.writeFileSync(
        'evidence/phase-10/story-10.1/console-logs.txt',
        logs.join('\n'),
        'utf8'
    );
    
    console.log('Evidence capture complete!');
    console.log('Video saved to: evidence/phase-10/story-10.1/');
    console.log('Screenshots saved to: evidence/phase-10/story-10.1/');
    
    await context.close();
    await browser.close();
}

// Create evidence directory
const evidenceDir = path.join(__dirname, 'evidence', 'phase-10', 'story-10.1');
if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
}

// Run the capture
captureEvidence().catch(console.error);