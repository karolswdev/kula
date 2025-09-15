const { chromium } = require('playwright');

(async () => {
    console.log('=== STORY 10.4 AUTOMATED FLOOR SYSTEM TEST ===');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
        // Load the editor
        await page.goto('http://localhost:8080/editor.html');
        await page.waitForTimeout(2000); // Wait for editor to initialize
        
        // Test 1: Check floor navigation UI exists
        console.log('\nTest 1: Floor Navigation UI Elements');
        const floorUp = await page.$('#floor-up');
        const floorDown = await page.$('#floor-down');
        const floorDisplay = await page.$('#floor-display');
        const floorInput = await page.$('#floor-input');
        
        if (floorUp && floorDown && floorDisplay && floorInput) {
            console.log('✅ PASS: All floor navigation elements present');
        } else {
            console.log('❌ FAIL: Missing floor navigation elements');
        }
        
        // Test 2: Check initial floor display
        console.log('\nTest 2: Initial Floor Display');
        const floorText = await page.textContent('#floor-display');
        if (floorText && floorText.includes('Floor: 0')) {
            console.log(`✅ PASS: Floor display shows: "${floorText}"`);
        } else {
            console.log(`❌ FAIL: Floor display incorrect: "${floorText}"`);
        }
        
        // Test 3: Test floor up button
        console.log('\nTest 3: Floor Up Navigation');
        await page.click('#floor-up');
        await page.waitForTimeout(500);
        const floorAfterUp = await page.textContent('#floor-display');
        if (floorAfterUp && floorAfterUp.includes('Floor: 1')) {
            console.log(`✅ PASS: Floor moved up to: "${floorAfterUp}"`);
        } else {
            console.log(`❌ FAIL: Floor up failed: "${floorAfterUp}"`);
        }
        
        // Test 4: Test floor down button
        console.log('\nTest 4: Floor Down Navigation');
        await page.click('#floor-down');
        await page.click('#floor-down');
        await page.waitForTimeout(500);
        const floorAfterDown = await page.textContent('#floor-display');
        if (floorAfterDown && floorAfterDown.includes('Floor: -1')) {
            console.log(`✅ PASS: Floor moved down to: "${floorAfterDown}"`);
        } else {
            console.log(`❌ FAIL: Floor down failed: "${floorAfterDown}"`);
        }
        
        // Test 5: Test direct floor input
        console.log('\nTest 5: Direct Floor Input');
        await page.fill('#floor-input', '5');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        const floorAfterInput = await page.textContent('#floor-display');
        if (floorAfterInput && floorAfterInput.includes('Floor: 5')) {
            console.log(`✅ PASS: Direct input worked: "${floorAfterInput}"`);
        } else {
            console.log(`❌ FAIL: Direct input failed: "${floorAfterInput}"`);
        }
        
        // Test 6: Test keyboard shortcuts
        console.log('\nTest 6: Keyboard Shortcuts');
        await page.keyboard.press('PageDown');
        await page.waitForTimeout(500);
        const floorAfterPageDown = await page.textContent('#floor-display');
        if (floorAfterPageDown && floorAfterPageDown.includes('Floor: 4')) {
            console.log(`✅ PASS: PageDown shortcut worked: "${floorAfterPageDown}"`);
        } else {
            console.log(`❌ FAIL: PageDown shortcut failed: "${floorAfterPageDown}"`);
        }
        
        await page.keyboard.press('PageUp');
        await page.waitForTimeout(500);
        const floorAfterPageUp = await page.textContent('#floor-display');
        if (floorAfterPageUp && floorAfterPageUp.includes('Floor: 5')) {
            console.log(`✅ PASS: PageUp shortcut worked: "${floorAfterPageUp}"`);
        } else {
            console.log(`❌ FAIL: PageUp shortcut failed: "${floorAfterPageUp}"`);
        }
        
        // Test 7: Test Alt+Number shortcut
        console.log('\nTest 7: Alt+Number Floor Jump');
        await page.keyboard.down('Alt');
        await page.keyboard.press('3');
        await page.keyboard.up('Alt');
        await page.waitForTimeout(500);
        const floorAfterAlt3 = await page.textContent('#floor-display');
        if (floorAfterAlt3 && floorAfterAlt3.includes('Floor: 3')) {
            console.log(`✅ PASS: Alt+3 jumped to floor 3: "${floorAfterAlt3}"`);
        } else {
            console.log(`❌ FAIL: Alt+3 shortcut failed: "${floorAfterAlt3}"`);
        }
        
        // Test 8: Check coordinates display includes floor
        console.log('\nTest 8: Coordinates Display with Floor');
        const coordsText = await page.textContent('#coordinates-display');
        if (coordsText && coordsText.includes('Floor:')) {
            console.log(`✅ PASS: Coordinates display includes floor: "${coordsText.split('\\n')[0]}"`);
        } else {
            console.log(`❌ FAIL: Coordinates display missing floor info`);
        }
        
        // Test 9: Test placing blocks on different floors
        console.log('\nTest 9: Block Placement on Different Floors');
        
        // Place a block on floor 3
        await page.evaluate(() => {
            if (window.editor) {
                window.editor.setFloor(3);
                window.editor.placeBlock({x: 0, y: 3, z: 0}, 'standard_platform');
                return true;
            }
            return false;
        });
        
        // Check if block was placed
        const blocksOnFloor3 = await page.evaluate(() => {
            if (window.editor && window.editor.levelData) {
                return window.editor.levelData.blocks.filter(b => b.at[1] === 3).length;
            }
            return 0;
        });
        
        if (blocksOnFloor3 > 0) {
            console.log(`✅ PASS: Block placed on floor 3 (${blocksOnFloor3} blocks)`);
        } else {
            console.log('❌ FAIL: Block placement on floor 3 failed');
        }
        
        // Test 10: Check shortcuts documentation
        console.log('\nTest 10: Shortcuts Documentation');
        const panelContent = await page.textContent('#control-panel');
        if (panelContent && panelContent.includes('PageUp') && panelContent.includes('Floor')) {
            console.log('✅ PASS: Floor navigation shortcuts are documented');
        } else {
            console.log('❌ FAIL: Floor navigation shortcuts not documented');
        }
        
        console.log('\n=== FLOOR SYSTEM TEST COMPLETE ===');
        console.log('All critical floor navigation features have been tested.');
        
        // Take a screenshot for evidence
        await page.screenshot({ path: 'evidence/floor-system-test.png', fullPage: true });
        console.log('Screenshot saved to: evidence/floor-system-test.png');
        
    } catch (error) {
        console.error('Test failed with error:', error);
    } finally {
        await browser.close();
    }
})();