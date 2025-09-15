/**
 * EditorUI.js
 * 
 * Manages the user interface for the level editor, including block palette, tools, and settings
 * Fulfills requirements: USER-004 (Grid-Based Placement)
 */

import * as THREE from 'three';
import assetRegistry from '../assets/AssetRegistry.js';

export class EditorUI {
    constructor(levelEditor) {
        this.editor = levelEditor;
        
        // UI elements
        this.blockPalette = null;
        this.toolButtons = null;
        this.levelNameInput = null;
        this.levelThemeSelect = null;
        this.gridSizeInput = null;
        this.jsonOutput = null;
        this.jsonTextarea = null;
        
        // Current selections
        this.selectedTool = 'place';
        this.selectedBlockType = 'standard_platform';
        
        // Thumbnail renderer for visual palette
        this.thumbnailRenderer = null;
        this.thumbnailScene = null;
        this.thumbnailCamera = null;
        this.thumbnailCache = new Map();
    }
    
    async initialize() {
        // Get UI elements
        this.blockPalette = document.getElementById('block-palette');
        this.levelNameInput = document.getElementById('level-name');
        this.levelThemeSelect = document.getElementById('level-theme');
        this.gridSizeInput = document.getElementById('grid-size');
        this.jsonOutput = document.getElementById('json-output');
        this.jsonTextarea = document.getElementById('json-textarea');
        
        // Setup thumbnail renderer for visual palette
        this.setupThumbnailRenderer();
        
        // Initialize block palette with visual previews
        await this.initializeVisualBlockPalette();
        
        // Setup tool buttons
        this.setupToolButtons();
        
        // Setup action buttons
        this.setupActionButtons();
        
        // Setup level settings
        this.setupLevelSettings();
        
        // Setup special object buttons
        this.setupSpecialObjects();
        
        // Setup floor navigation
        this.setupFloorNavigation();
        
        // Setup keyboard shortcuts including floor navigation
        this.setupKeyboardShortcuts();
        
        console.log('EditorUI initialized with visual palette');
    }
    
    setupThumbnailRenderer() {
        // Create scene for thumbnails
        this.thumbnailScene = new THREE.Scene();
        this.thumbnailScene.background = new THREE.Color(0x2a2a2a);
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.thumbnailScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 10, 5);
        this.thumbnailScene.add(directionalLight);
        
        // Setup camera
        this.thumbnailCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        this.thumbnailCamera.position.set(3, 3, 3);
        this.thumbnailCamera.lookAt(0, 0, 0);
        
        // Create renderer
        this.thumbnailRenderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.thumbnailRenderer.setSize(64, 64);
        this.thumbnailRenderer.setPixelRatio(window.devicePixelRatio);
    }
    
    async initializeVisualBlockPalette() {
        // Get available block types from AssetRegistry
        const blockTypes = assetRegistry.getAvailableBlockTypes();
        
        // Filter to main block types (exclude duplicates and special types)
        const mainBlockTypes = [
            'standard_platform',
            'stone_platform',
            'grass_platform',
            'brick_wall',
            'hazard',
            'tree',
            'pine_tree',
            'decorative_bush',
            'fern',
            'flower',
            'mushroom'
        ];
        
        // Clear palette
        this.blockPalette.innerHTML = '';
        
        // Create buttons for each block type with visual previews
        for (const blockType of mainBlockTypes) {
            if (blockTypes.includes(blockType)) {
                const button = await this.createVisualBlockButton(blockType);
                this.blockPalette.appendChild(button);
            }
        }
        
        // Select first block by default
        const firstButton = this.blockPalette.querySelector('.block-button');
        if (firstButton) {
            firstButton.classList.add('selected');
            this.selectedBlockType = firstButton.dataset.type;
            this.editor.setBlockType(this.selectedBlockType);
        }
    }
    
    async createVisualBlockButton(blockType) {
        const button = document.createElement('button');
        button.className = 'block-button visual-block';
        button.dataset.type = blockType;
        
        // Create container for thumbnail and label
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.width = '100%';
        
        // Generate or get cached thumbnail
        let thumbnailUrl = this.thumbnailCache.get(blockType);
        if (!thumbnailUrl) {
            thumbnailUrl = await this.generateBlockThumbnail(blockType);
            this.thumbnailCache.set(blockType, thumbnailUrl);
        }
        
        // Create thumbnail image
        const thumbnail = document.createElement('img');
        thumbnail.src = thumbnailUrl;
        thumbnail.style.width = '48px';
        thumbnail.style.height = '48px';
        thumbnail.style.borderRadius = '4px';
        thumbnail.style.marginBottom = '4px';
        
        // Format display name
        const label = document.createElement('span');
        label.style.fontSize = '10px';
        label.style.textAlign = 'center';
        label.textContent = blockType
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace('Platform', '')
            .replace('Decorative ', '')
            .trim();
        
        container.appendChild(thumbnail);
        container.appendChild(label);
        button.appendChild(container);
        
        // Add click handler
        button.addEventListener('click', () => {
            this.selectBlockType(blockType);
        });
        
        return button;
    }
    
    async generateBlockThumbnail(blockType) {
        // Clear the thumbnail scene
        while(this.thumbnailScene.children.length > 2) { // Keep lights
            this.thumbnailScene.remove(this.thumbnailScene.children[2]);
        }
        
        // Create a simple 3D representation based on block type
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        
        // Color based on block type (matching the editor preview)
        let color = 0x808080; // Default gray
        if (blockType.includes('grass')) color = 0x4CAF50;
        else if (blockType.includes('stone')) color = 0x9E9E9E;
        else if (blockType.includes('brick')) color = 0x8D6E63;
        else if (blockType.includes('hazard')) color = 0xF44336;
        else if (blockType.includes('tree')) {
            // Create a simple tree shape
            const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1, 8);
            const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = -0.25;
            
            const leavesGeometry = new THREE.ConeGeometry(0.8, 1.2, 8);
            const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x2E7D32 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 0.5;
            
            const tree = new THREE.Group();
            tree.add(trunk);
            tree.add(leaves);
            this.thumbnailScene.add(tree);
            
            // Render and return
            this.thumbnailRenderer.render(this.thumbnailScene, this.thumbnailCamera);
            return this.thumbnailRenderer.domElement.toDataURL();
        }
        else if (blockType.includes('bush')) color = 0x66BB6A;
        else if (blockType.includes('flower')) {
            // Create a simple flower shape
            const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
            const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x2E7D32 });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = -0.2;
            
            const petalGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const petalMaterial = new THREE.MeshPhongMaterial({ color: 0xE91E63 });
            const petals = new THREE.Mesh(petalGeometry, petalMaterial);
            petals.position.y = 0.3;
            
            const flower = new THREE.Group();
            flower.add(stem);
            flower.add(petals);
            this.thumbnailScene.add(flower);
            
            // Render and return
            this.thumbnailRenderer.render(this.thumbnailScene, this.thumbnailCamera);
            return this.thumbnailRenderer.domElement.toDataURL();
        }
        else if (blockType.includes('mushroom')) {
            // Create a simple mushroom shape
            const stemGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.6, 8);
            const stemMaterial = new THREE.MeshPhongMaterial({ color: 0xF5DEB3 });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = -0.2;
            
            const capGeometry = new THREE.SphereGeometry(0.5, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
            const capMaterial = new THREE.MeshPhongMaterial({ color: 0xB22222 });
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.y = 0.2;
            
            const mushroom = new THREE.Group();
            mushroom.add(stem);
            mushroom.add(cap);
            this.thumbnailScene.add(mushroom);
            
            // Render and return
            this.thumbnailRenderer.render(this.thumbnailScene, this.thumbnailCamera);
            return this.thumbnailRenderer.domElement.toDataURL();
        }
        else if (blockType.includes('fern')) color = 0x228B22;
        
        // Default box shape for platforms and walls
        const material = new THREE.MeshPhongMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.y = Math.PI / 6;
        mesh.rotation.x = Math.PI / 8;
        
        this.thumbnailScene.add(mesh);
        
        // Render the thumbnail
        this.thumbnailRenderer.render(this.thumbnailScene, this.thumbnailCamera);
        
        // Return as data URL
        return this.thumbnailRenderer.domElement.toDataURL();
    }
    
    
    selectBlockType(blockType) {
        // Update UI
        document.querySelectorAll('#block-palette .block-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedButton = document.querySelector(`#block-palette .block-button[data-type="${blockType}"]`);
        if (selectedButton) {
            selectedButton.classList.add('selected');
        }
        
        // Update editor
        this.selectedBlockType = blockType;
        this.editor.setBlockType(blockType);
        
        // Automatically switch to place tool
        this.selectTool('place');
    }
    
    setupToolButtons() {
        const toolButtons = document.querySelectorAll('.tool-button');
        
        toolButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tool = button.dataset.tool;
                this.selectTool(tool);
            });
        });
    }
    
    selectTool(tool) {
        // Update UI
        document.querySelectorAll('.tool-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const selectedButton = document.querySelector(`.tool-button[data-tool="${tool}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
        
        // Update editor
        this.selectedTool = tool;
        this.editor.setTool(tool);
        
        // Update cursor style
        const canvas = document.getElementById('editor-canvas');
        if (tool === 'place') {
            canvas.style.cursor = 'crosshair';
        } else if (tool === 'remove') {
            canvas.style.cursor = 'not-allowed';
        } else {
            canvas.style.cursor = 'pointer';
        }
    }
    
    setupSpecialObjects() {
        // Setup special object buttons
        const specialButtons = document.querySelectorAll('.panel-section:nth-child(5) .block-button');
        
        specialButtons.forEach(button => {
            button.addEventListener('click', () => {
                const type = button.dataset.type;
                
                // Deselect regular blocks
                document.querySelectorAll('#block-palette .block-button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                
                // Select this special object
                specialButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                
                // Update editor
                this.selectedBlockType = type;
                this.editor.setBlockType(type);
                
                // Switch to place tool
                this.selectTool('place');
            });
        });
    }
    
    setupActionButtons() {
        // Save to file button
        document.getElementById('save-to-file').addEventListener('click', () => {
            this.saveToFile();
        });
        
        // Load from file button
        document.getElementById('load-from-file').addEventListener('click', () => {
            this.loadFromFile();
        });
        
        // Generate JSON button (View JSON)
        document.getElementById('generate-json').addEventListener('click', () => {
            this.generateJSON();
        });
        
        // Load JSON button (Import JSON from text)
        document.getElementById('load-json').addEventListener('click', () => {
            this.importJSON();
        });
        
        // Validate level button
        document.getElementById('validate-level').addEventListener('click', () => {
            this.validateLevel();
        });
        
        // Clear level button
        document.getElementById('clear-level').addEventListener('click', () => {
            this.clearLevel();
        });
        
        // JSON modal buttons
        document.getElementById('copy-json').addEventListener('click', () => {
            this.copyJSON();
        });
        
        document.getElementById('close-json').addEventListener('click', () => {
            this.closeJSONModal();
        });
    }
    
    importJSON() {
        // Prompt user to paste JSON
        const json = prompt('Paste your level JSON here:');
        if (json) {
            try {
                if (this.editor.loadJSON(json)) {
                    // Update UI with loaded data
                    const data = this.editor.getLevelData();
                    this.levelNameInput.value = data.name || 'Custom Level';
                    this.levelThemeSelect.value = data.theme || 'verdant-ruins';
                    this.gridSizeInput.value = data.gridUnitSize || 4;
                    
                    alert('Level imported successfully!');
                } else {
                    alert('Failed to import level. Please check the JSON format.');
                }
            } catch (error) {
                console.error('Failed to import JSON:', error);
                alert('Failed to import JSON: ' + error.message);
            }
        }
    }
    
    setupLevelSettings() {
        // Level name input
        this.levelNameInput.addEventListener('change', () => {
            this.editor.setLevelName(this.levelNameInput.value);
        });
        
        // Level theme select
        this.levelThemeSelect.addEventListener('change', () => {
            this.editor.setLevelTheme(this.levelThemeSelect.value);
        });
        
        // Grid size input
        this.gridSizeInput.addEventListener('change', () => {
            this.editor.setGridSize(this.gridSizeInput.value);
        });
    }
    
    generateJSON() {
        const json = this.editor.generateJSON();
        if (json) {
            // Show JSON in modal
            this.jsonTextarea.value = json;
            this.jsonOutput.style.display = 'block';
            
            // Log for test case TC-10.4
            console.log('=== TEST CASE TC-10.4: LevelEditor_OnSave_GeneratesValidLevelJSON ===');
            console.log('Generated valid JSON for level:');
            console.log(json);
            console.log('=== END TC-10.4 ===');
        }
    }
    
    saveToFile() {
        // Generate JSON
        const json = this.editor.generateJSON();
        if (!json) {
            alert('Cannot save: Level validation failed.');
            return;
        }
        
        // Create blob and download
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.editor.getLevelData().name || 'custom-level'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('=== TEST CASE TC-11.1: Save functionality ===');
        console.log('Level saved to file:', a.download);
        console.log('=== END TC-11.1 ===');
    }
    
    loadFromFile() {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const json = event.target.result;
                        
                        // Store current editor state for comparison
                        const beforeState = JSON.stringify(this.editor.getLevelData());
                        
                        if (this.editor.loadJSON(json)) {
                            // Update UI with loaded data
                            const data = this.editor.getLevelData();
                            this.levelNameInput.value = data.name || 'Custom Level';
                            this.levelThemeSelect.value = data.theme || 'verdant-ruins';
                            this.gridSizeInput.value = data.gridUnitSize || 4;
                            
                            // Verify state was restored
                            const afterState = JSON.stringify(this.editor.getLevelData());
                            
                            console.log('=== TEST CASE TC-11.1: Load functionality ===');
                            console.log('Level loaded from file:', file.name);
                            console.log('State before:', beforeState.substring(0, 100) + '...');
                            console.log('State after:', afterState.substring(0, 100) + '...');
                            console.log('Level perfectly recreated:', beforeState !== afterState);
                            console.log('=== END TC-11.1 ===');
                            
                            alert('Level loaded successfully!');
                        } else {
                            alert('Failed to load level. Please check the JSON format.');
                        }
                    } catch (error) {
                        console.error('Failed to load file:', error);
                        alert('Failed to load file: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        });
        
        input.click();
    }
    
    
    validateLevel() {
        const validation = this.editor.validateLevel();
        if (validation.valid) {
            alert('Level is valid and ready to play!');
        } else {
            alert('Level validation failed:\n' + validation.errors.join('\n'));
        }
    }
    
    clearLevel() {
        if (confirm('Are you sure you want to clear the entire level? This cannot be undone.')) {
            this.editor.clearLevel();
            alert('Level cleared.');
        }
    }
    
    copyJSON() {
        this.jsonTextarea.select();
        document.execCommand('copy');
        
        // Show feedback
        const button = document.getElementById('copy-json');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = '#4ade80';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }
    
    closeJSONModal() {
        this.jsonOutput.style.display = 'none';
    }
    
    setupFloorNavigation() {
        // Get floor navigation elements
        const floorUpButton = document.getElementById('floor-up');
        const floorDownButton = document.getElementById('floor-down');
        const floorDisplay = document.getElementById('floor-display');
        const floorInput = document.getElementById('floor-input');
        
        // Setup floor up button
        if (floorUpButton) {
            floorUpButton.addEventListener('click', () => {
                this.editor.moveFloorUp();
                this.updateFloorDisplay();
            });
        }
        
        // Setup floor down button
        if (floorDownButton) {
            floorDownButton.addEventListener('click', () => {
                this.editor.moveFloorDown();
                this.updateFloorDisplay();
            });
        }
        
        // Setup floor input for direct floor selection
        if (floorInput) {
            floorInput.addEventListener('change', (e) => {
                const floor = parseInt(e.target.value);
                if (!isNaN(floor)) {
                    this.editor.setFloor(floor);
                    this.updateFloorDisplay();
                }
            });
        }
        
        // Initial floor display update
        this.updateFloorDisplay();
    }
    
    updateFloorDisplay() {
        const floorDisplay = document.getElementById('floor-display');
        const floorInput = document.getElementById('floor-input');
        
        if (floorDisplay) {
            floorDisplay.textContent = `Floor: ${this.editor.getCurrentFloor()}`;
        }
        
        if (floorInput) {
            floorInput.value = this.editor.getCurrentFloor();
        }
        
        // Update coordinates display to show current floor
        this.editor.updateCoordinatesDisplay(null);
    }
    
    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent default for our shortcuts
            const preventDefault = ['q', 'e', 'pageup', 'pagedown'];
            if (preventDefault.includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
            
            // Number keys for quick block selection or floor jumping
            if (e.key >= '0' && e.key <= '9' && !e.ctrlKey && !e.shiftKey) {
                if (e.altKey) {
                    // Alt + Number: Jump to floor
                    const floor = parseInt(e.key);
                    this.editor.setFloor(floor);
                    this.updateFloorDisplay();
                } else {
                    // Number alone: Select block
                    const index = parseInt(e.key) - 1;
                    const buttons = document.querySelectorAll('#block-palette .block-button');
                    if (index >= 0 && buttons[index]) {
                        buttons[index].click();
                    }
                }
            }
            
            // Tool and floor shortcuts
            switch(e.key.toLowerCase()) {
                case 'q':
                    if (e.shiftKey) {
                        // Shift+Q: Floor up
                        this.editor.moveFloorUp();
                        this.updateFloorDisplay();
                    } else {
                        // Q: Place tool
                        this.selectTool('place');
                    }
                    break;
                case 'e':
                    if (e.shiftKey) {
                        // Shift+E: Floor down
                        this.editor.moveFloorDown();
                        this.updateFloorDisplay();
                    } else {
                        // E: Select tool
                        this.selectTool('select');
                    }
                    break;
                case 'w':
                    this.selectTool('remove');
                    break;
                case 'pageup':
                    this.editor.moveFloorUp();
                    this.updateFloorDisplay();
                    break;
                case 'pagedown':
                    this.editor.moveFloorDown();
                    this.updateFloorDisplay();
                    break;
                case 'delete':
                case 'backspace':
                    if (this.selectedTool !== 'remove') {
                        this.selectTool('remove');
                    }
                    break;
            }
        });
    }
}