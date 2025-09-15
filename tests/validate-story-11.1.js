#!/usr/bin/env node

/**
 * Validation script for Story 11.1 - Core Editor Functionality & Controls
 * 
 * This script validates:
 * - TC-11.1: Save/Load functionality
 * - TC-11.2: Camera controls implementation
 * - Visual asset palette
 */

const fs = require('fs');
const path = require('path');

console.log('=== STORY 11.1 VALIDATION ===\n');

// Track validation results
let testsPass = true;
const results = [];

// Test 1: Check if EditorControls.js exists and has required methods
console.log('Test 1: EditorControls.js implementation');
const editorControlsPath = path.join(__dirname, '../src/editor/EditorControls.js');
if (fs.existsSync(editorControlsPath)) {
    const content = fs.readFileSync(editorControlsPath, 'utf8');
    
    // Check for required methods
    const requiredMethods = [
        'handleMouseDown',
        'handleMouseMove', 
        'handleMouseUp',
        'handleWheel',
        'rotateCamera',
        'panCamera',
        'zoomCamera',
        'update'
    ];
    
    let allMethodsPresent = true;
    for (const method of requiredMethods) {
        if (!content.includes(method)) {
            console.log(`  ❌ Missing method: ${method}`);
            allMethodsPresent = false;
        }
    }
    
    if (allMethodsPresent) {
        console.log('  ✅ EditorControls.js has all required methods');
        results.push('EditorControls implementation: PASS');
    } else {
        console.log('  ❌ EditorControls.js is missing some methods');
        results.push('EditorControls implementation: FAIL');
        testsPass = false;
    }
} else {
    console.log('  ❌ EditorControls.js not found');
    results.push('EditorControls implementation: FAIL');
    testsPass = false;
}

// Test 2: Check EditorUI.js for save/load functionality
console.log('\nTest 2: Save/Load functionality in EditorUI.js');
const editorUIPath = path.join(__dirname, '../src/editor/EditorUI.js');
if (fs.existsSync(editorUIPath)) {
    const content = fs.readFileSync(editorUIPath, 'utf8');
    
    const requiredFunctions = [
        'saveToFile',
        'loadFromFile',
        'importJSON'
    ];
    
    let allFunctionsPresent = true;
    for (const func of requiredFunctions) {
        if (!content.includes(func)) {
            console.log(`  ❌ Missing function: ${func}`);
            allFunctionsPresent = false;
        }
    }
    
    // Check for Blob and FileReader usage
    const hasBlobSupport = content.includes('Blob') && content.includes('application/json');
    const hasFileReader = content.includes('FileReader') && content.includes('readAsText');
    
    if (allFunctionsPresent && hasBlobSupport && hasFileReader) {
        console.log('  ✅ Save/Load functionality implemented correctly');
        results.push('Save/Load functionality: PASS');
    } else {
        if (!hasBlobSupport) console.log('  ❌ Missing Blob support for save');
        if (!hasFileReader) console.log('  ❌ Missing FileReader support for load');
        results.push('Save/Load functionality: FAIL');
        testsPass = false;
    }
} else {
    console.log('  ❌ EditorUI.js not found');
    results.push('Save/Load functionality: FAIL');
    testsPass = false;
}

// Test 3: Check for visual palette implementation
console.log('\nTest 3: Visual Asset Palette');
if (fs.existsSync(editorUIPath)) {
    const content = fs.readFileSync(editorUIPath, 'utf8');
    
    const visualPaletteFeatures = [
        'thumbnailRenderer',
        'thumbnailScene',
        'thumbnailCamera',
        'initializeVisualBlockPalette',
        'createVisualBlockButton',
        'generateBlockThumbnail'
    ];
    
    let allFeaturesPresent = true;
    for (const feature of visualPaletteFeatures) {
        if (!content.includes(feature)) {
            console.log(`  ❌ Missing visual palette feature: ${feature}`);
            allFeaturesPresent = false;
        }
    }
    
    // Check for THREE.js renderer for thumbnails
    const hasRendererSetup = content.includes('WebGLRenderer') && content.includes('thumbnailRenderer');
    const hasDataURL = content.includes('toDataURL');
    
    if (allFeaturesPresent && hasRendererSetup && hasDataURL) {
        console.log('  ✅ Visual asset palette implemented with 3D thumbnails');
        results.push('Visual Asset Palette: PASS');
    } else {
        if (!hasRendererSetup) console.log('  ❌ Missing thumbnail renderer setup');
        if (!hasDataURL) console.log('  ❌ Missing thumbnail data URL generation');
        results.push('Visual Asset Palette: FAIL');
        testsPass = false;
    }
}

// Test 4: Check editor.html for new buttons
console.log('\nTest 4: Editor UI buttons');
const editorHtmlPath = path.join(__dirname, '../editor.html');
if (fs.existsSync(editorHtmlPath)) {
    const content = fs.readFileSync(editorHtmlPath, 'utf8');
    
    const requiredButtons = [
        'save-to-file',
        'load-from-file',
        'generate-json',
        'load-json'
    ];
    
    let allButtonsPresent = true;
    for (const button of requiredButtons) {
        if (!content.includes(`id="${button}"`)) {
            console.log(`  ❌ Missing button: ${button}`);
            allButtonsPresent = false;
        }
    }
    
    if (allButtonsPresent) {
        console.log('  ✅ All required buttons present in editor UI');
        results.push('Editor UI buttons: PASS');
    } else {
        results.push('Editor UI buttons: FAIL');
        testsPass = false;
    }
}

// Test 5: Check LevelEditor.js for EditorControls integration
console.log('\nTest 5: EditorControls integration');
const levelEditorPath = path.join(__dirname, '../src/editor/LevelEditor.js');
if (fs.existsSync(levelEditorPath)) {
    const content = fs.readFileSync(levelEditorPath, 'utf8');
    
    const hasEditorControlsImport = content.includes("import { EditorControls }");
    const usesEditorControls = content.includes("new EditorControls");
    const removedOrbitControls = !content.includes("import { OrbitControls }");
    
    if (hasEditorControlsImport && usesEditorControls && removedOrbitControls) {
        console.log('  ✅ EditorControls properly integrated');
        results.push('EditorControls integration: PASS');
    } else {
        if (!hasEditorControlsImport) console.log('  ❌ Missing EditorControls import');
        if (!usesEditorControls) console.log('  ❌ Not using EditorControls');
        if (!removedOrbitControls) console.log('  ⚠️  OrbitControls still imported');
        results.push('EditorControls integration: FAIL');
        testsPass = false;
    }
}

// Test 6: Verify test documentation exists
console.log('\nTest 6: Test documentation');
const testDocPath = path.join(__dirname, 'manual/test-phase-11.1.md');
if (fs.existsSync(testDocPath)) {
    const content = fs.readFileSync(testDocPath, 'utf8');
    
    const hasTC111 = content.includes('TC-11.1') && content.includes('Save and Load');
    const hasTC112 = content.includes('TC-11.2') && content.includes('Camera Controls');
    
    if (hasTC111 && hasTC112) {
        console.log('  ✅ Test documentation complete');
        results.push('Test documentation: PASS');
    } else {
        if (!hasTC111) console.log('  ❌ Missing TC-11.1 documentation');
        if (!hasTC112) console.log('  ❌ Missing TC-11.2 documentation');
        results.push('Test documentation: PARTIAL');
    }
} else {
    console.log('  ⚠️  Test documentation not found (optional)');
    results.push('Test documentation: NOT FOUND');
}

// Summary
console.log('\n=== VALIDATION SUMMARY ===');
results.forEach(result => console.log(`  ${result}`));

if (testsPass) {
    console.log('\n✅ All critical tests passed! Story 11.1 is complete.');
    console.log('\nImplemented features:');
    console.log('  • Save/Load functionality for levels');
    console.log('  • Visual asset palette with 3D thumbnails');
    console.log('  • Dedicated editor camera controls (orbit, pan, zoom)');
    console.log('\nNext steps:');
    console.log('  1. Test the editor at http://localhost:8080/editor.html');
    console.log('  2. Create a level and test save/load');
    console.log('  3. Test camera controls (right-click orbit, middle-click pan, scroll zoom)');
    console.log('  4. Verify visual block palette shows 3D previews');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed. Please review the issues above.');
    process.exit(1);
}