/**
 * EditorUI.js
 * 
 * Manages the user interface for the level editor, including block palette, tools, and settings
 * Fulfills requirements: USER-004 (Grid-Based Placement)
 */

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
    }
    
    async initialize() {
        // Get UI elements
        this.blockPalette = document.getElementById('block-palette');
        this.levelNameInput = document.getElementById('level-name');
        this.levelThemeSelect = document.getElementById('level-theme');
        this.gridSizeInput = document.getElementById('grid-size');
        this.jsonOutput = document.getElementById('json-output');
        this.jsonTextarea = document.getElementById('json-textarea');
        
        // Initialize block palette
        this.initializeBlockPalette();
        
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
        
        console.log('EditorUI initialized');
    }
    
    initializeBlockPalette() {
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
        
        // Create buttons for each block type
        mainBlockTypes.forEach(blockType => {
            if (blockTypes.includes(blockType)) {
                const button = this.createBlockButton(blockType);
                this.blockPalette.appendChild(button);
            }
        });
        
        // Select first block by default
        const firstButton = this.blockPalette.querySelector('.block-button');
        if (firstButton) {
            firstButton.classList.add('selected');
            this.selectedBlockType = firstButton.dataset.type;
            this.editor.setBlockType(this.selectedBlockType);
        }
    }
    
    createBlockButton(blockType) {
        const button = document.createElement('button');
        button.className = 'block-button';
        button.dataset.type = blockType;
        
        // Format display name
        const displayName = blockType
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace('Platform', '')
            .replace('Decorative ', '');
        
        button.textContent = displayName;
        
        // Add click handler
        button.addEventListener('click', () => {
            this.selectBlockType(blockType);
        });
        
        return button;
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
        // Generate JSON button
        document.getElementById('generate-json').addEventListener('click', () => {
            this.generateJSON();
        });
        
        // Load JSON button
        document.getElementById('load-json').addEventListener('click', () => {
            this.loadJSON();
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
    
    loadJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const json = event.target.result;
                    if (this.editor.loadJSON(json)) {
                        // Update UI with loaded data
                        const data = this.editor.getLevelData();
                        this.levelNameInput.value = data.name || 'Custom Level';
                        this.levelThemeSelect.value = data.theme || 'nature';
                        
                        alert('Level loaded successfully!');
                    } else {
                        alert('Failed to load level. Please check the JSON format.');
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