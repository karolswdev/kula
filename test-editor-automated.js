/**
 * Automated test script for Level Editor
 * Tests TC-10.3 and TC-10.4 requirements
 */

import { LevelEditor } from './src/editor/LevelEditor.js';

async function runTests() {
    console.log('=== LEVEL EDITOR AUTOMATED TESTS ===\n');
    
    // Test TC-10.3: Block placement updates level data
    console.log('TEST TC-10.3: LevelEditor_OnGridClick_AddsBlockToLevelData');
    console.log('---------------------------------------------------');
    
    try {
        // Create canvas for testing
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        document.body.appendChild(canvas);
        
        // Initialize editor
        const editor = new LevelEditor(canvas);
        await editor.initialize();
        
        // Get initial state
        const initialBlocks = editor.getLevelData().blocks.length;
        console.log('Initial blocks count:', initialBlocks);
        console.log('Initial level data:', JSON.stringify(editor.getLevelData(), null, 2));
        
        // Place a block at [3, 0, 3]
        console.log('\nPlacing standard_platform at [3, 0, 3]...');
        await editor.placeBlock({ x: 3, y: 0, z: 3 }, 'standard_platform');
        
        // Check if block was added
        const updatedData = editor.getLevelData();
        const updatedBlocks = updatedData.blocks.length;
        console.log('Updated blocks count:', updatedBlocks);
        console.log('Updated level data:', JSON.stringify(updatedData, null, 2));
        
        // Find the new block
        const newBlock = updatedData.blocks.find(b => 
            b.at[0] === 3 && b.at[1] === 0 && b.at[2] === 3
        );
        
        if (newBlock && newBlock.type === 'standard_platform') {
            console.log('✅ TC-10.3 PASSED: Block successfully added to level data');
            console.log('New block:', JSON.stringify(newBlock, null, 2));
        } else {
            console.log('❌ TC-10.3 FAILED: Block not found in level data');
        }
        
    } catch (error) {
        console.error('❌ TC-10.3 ERROR:', error);
    }
    
    console.log('\n');
    
    // Test TC-10.4: Generate valid JSON
    console.log('TEST TC-10.4: LevelEditor_OnSave_GeneratesValidLevelJSON');
    console.log('---------------------------------------------------');
    
    try {
        // Create new editor instance
        const canvas2 = document.createElement('canvas');
        canvas2.width = 800;
        canvas2.height = 600;
        const editor2 = new LevelEditor(canvas2);
        await editor2.initialize();
        
        // Build a simple level
        console.log('Building test level...');
        
        // Add platforms
        await editor2.placeBlock({ x: 0, y: 0, z: 0 }, 'stone_platform');
        await editor2.placeBlock({ x: 1, y: 0, z: 0 }, 'stone_platform');
        await editor2.placeBlock({ x: 2, y: 0, z: 0 }, 'grass_platform');
        
        // Set player spawn
        editor2.setPlayerSpawn({ x: 0, y: 1, z: 0 });
        
        // Add key
        editor2.addKey({ x: 2, y: 1, z: 0 });
        
        // Set exit
        editor2.setExit({ x: 2, y: 0, z: 0 });
        
        // Set metadata
        editor2.setLevelName('Test Level');
        editor2.setLevelTheme('nature');
        
        // Generate JSON
        console.log('\nGenerating JSON...');
        const json = editor2.generateJSON();
        
        if (json) {
            console.log('Generated JSON:');
            console.log(json);
            
            // Validate JSON structure
            const levelData = JSON.parse(json);
            
            const validations = {
                'Has name': !!levelData.name,
                'Has theme': !!levelData.theme,
                'Has blocks': Array.isArray(levelData.blocks) && levelData.blocks.length > 0,
                'Has player spawn': !!(levelData.player && levelData.player.spawn),
                'Has keys': !!(levelData.objectives && levelData.objectives.keys && levelData.objectives.keys.length > 0),
                'Has exit': !!(levelData.objectives && levelData.objectives.exit)
            };
            
            console.log('\nValidation results:');
            let allValid = true;
            for (const [check, valid] of Object.entries(validations)) {
                console.log(`  ${valid ? '✅' : '❌'} ${check}`);
                if (!valid) allValid = false;
            }
            
            if (allValid) {
                console.log('\n✅ TC-10.4 PASSED: Valid level JSON generated');
            } else {
                console.log('\n❌ TC-10.4 FAILED: Generated JSON is invalid');
            }
        } else {
            console.log('❌ TC-10.4 FAILED: No JSON generated');
        }
        
    } catch (error) {
        console.error('❌ TC-10.4 ERROR:', error);
    }
    
    console.log('\n=== TESTS COMPLETE ===');
}

// Run tests when module loads
runTests();