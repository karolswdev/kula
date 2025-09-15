/**
 * LevelEditor.js
 * 
 * Main level editor class that manages the 3D viewport, grid system, and block placement
 * Fulfills requirements: USER-004 (Grid-Based Placement)
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import assetRegistry from '../assets/AssetRegistry.js';

export class LevelEditor {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Grid settings
        this.gridSize = 10;
        this.gridUnitSize = 4; // World units per grid cell
        this.gridHelper = null;
        this.gridPlane = null;
        
        // Floor management
        this.currentFloor = 0;  // Y-level
        this.minFloor = -5;
        this.maxFloor = 10;
        this.floorHeight = this.gridUnitSize; // 4 units per floor
        
        // Editor state
        this.currentTool = 'place'; // place, remove, select
        this.selectedBlockType = 'standard_platform';
        this.hoveredGridPos = null;
        this.highlightCube = null;
        
        // Level data structure
        this.levelData = {
            name: 'Custom Level',
            theme: 'verdant-ruins',
            gridUnitSize: 4,
            blocks: [],
            player: {
                spawn: [5, 2, 5],
                lives: 3
            },
            objectives: {
                keys: [],
                exit: null
            },
            collectibles: [],
            decorations: []
        };
        
        // Block instances (mesh -> data mapping)
        this.blockInstances = new Map();
        this.specialObjects = new Map(); // For player spawn, keys, exit
        
        // Asset loading
        this.gltfLoader = new GLTFLoader();
        this.loadedModels = new Map();
        
        // Bind event handlers
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.handleWindowResize = this.handleWindowResize.bind(this);
    }
    
    async initialize() {
        // Setup Three.js scene
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        this.setupGrid();
        this.setupHighlight();
        
        // Setup event listeners
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('click', this.handleMouseClick);
        window.addEventListener('resize', this.handleWindowResize);
        
        // Start render loop
        this.animate();
        
        console.log('LevelEditor initialized');
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    }
    
    setupCamera() {
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(30, 40, 30);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.target.set(0, 0, 0);
        this.controls.maxPolarAngle = Math.PI / 2.2;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 100;
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }
    
    setupGrid() {
        // Create grid helper
        const gridTotalSize = this.gridSize * this.gridUnitSize;
        this.gridHelper = new THREE.GridHelper(
            gridTotalSize, 
            this.gridSize, 
            0x444444, 
            0x888888
        );
        // Position grid at current floor
        this.gridHelper.position.y = this.currentFloor * this.floorHeight;
        this.scene.add(this.gridHelper);
        
        // Create invisible plane for raycasting at current floor
        const planeGeometry = new THREE.PlaneGeometry(gridTotalSize, gridTotalSize);
        const planeMaterial = new THREE.MeshBasicMaterial({ 
            visible: false,
            side: THREE.DoubleSide
        });
        this.gridPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.gridPlane.rotation.x = -Math.PI / 2;
        this.gridPlane.position.y = this.currentFloor * this.floorHeight;
        this.gridPlane.name = 'gridPlane';
        this.scene.add(this.gridPlane);
    }
    
    setupHighlight() {
        // Create highlight cube for showing where blocks will be placed
        const geometry = new THREE.BoxGeometry(
            this.gridUnitSize,
            this.gridUnitSize,
            this.gridUnitSize
        );
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            opacity: 0.5,
            transparent: true,
            wireframe: true
        });
        this.highlightCube = new THREE.Mesh(geometry, material);
        this.highlightCube.visible = false;
        this.scene.add(this.highlightCube);
    }
    
    handleMouseMove(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Only check intersection with the current floor plane
        const intersects = this.raycaster.intersectObject(this.gridPlane);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            const gridPos = this.worldToGrid(point);
            // Force Y to current floor
            gridPos.y = this.currentFloor;
            
            // Update highlight position
            if (this.currentTool === 'place') {
                this.highlightCube.visible = true;
                this.highlightCube.position.set(
                    gridPos.x * this.gridUnitSize,
                    gridPos.y * this.gridUnitSize,
                    gridPos.z * this.gridUnitSize
                );
                this.highlightCube.material.color.setHex(0x00ff00);
            } else if (this.currentTool === 'remove') {
                // Find block at position on current floor
                const block = this.getBlockAt(gridPos);
                if (block) {
                    this.highlightCube.visible = true;
                    this.highlightCube.position.copy(block.position);
                    this.highlightCube.material.color.setHex(0xff0000);
                } else {
                    this.highlightCube.visible = false;
                }
            }
            
            this.hoveredGridPos = gridPos;
            this.updateCoordinatesDisplay(gridPos);
        } else {
            this.highlightCube.visible = false;
            this.hoveredGridPos = null;
        }
    }
    
    handleMouseClick(event) {
        if (!this.hoveredGridPos) return;
        
        if (this.currentTool === 'place') {
            this.placeBlock(this.hoveredGridPos, this.selectedBlockType);
        } else if (this.currentTool === 'remove') {
            this.removeBlock(this.hoveredGridPos);
        }
    }
    
    worldToGrid(worldPos) {
        // Convert world position to grid coordinates
        return {
            x: Math.round(worldPos.x / this.gridUnitSize),
            y: this.currentFloor,  // Always use current floor for Y
            z: Math.round(worldPos.z / this.gridUnitSize)
        };
    }
    
    gridToWorld(gridPos) {
        // Convert grid coordinates to world position
        return new THREE.Vector3(
            gridPos.x * this.gridUnitSize,
            gridPos.y * this.gridUnitSize,
            gridPos.z * this.gridUnitSize
        );
    }
    
    async placeBlock(gridPos, blockType) {
        // Check if position is already occupied
        if (this.getBlockAt(gridPos)) {
            console.log('Position already occupied');
            return;
        }
        
        // Handle special objects
        if (blockType === 'player_spawn') {
            this.setPlayerSpawn(gridPos);
            return;
        } else if (blockType === 'key') {
            this.addKey(gridPos);
            return;
        } else if (blockType === 'exit') {
            this.setExit(gridPos);
            return;
        }
        
        // Create block mesh
        const blockMesh = await this.createBlockMesh(blockType);
        if (!blockMesh) return;
        
        // Position the block
        const worldPos = this.gridToWorld(gridPos);
        blockMesh.position.copy(worldPos);
        
        // Add to scene
        this.scene.add(blockMesh);
        
        // Update level data
        const blockData = {
            type: blockType,
            at: [gridPos.x, gridPos.y, gridPos.z]
        };
        
        // Determine which array to add to based on block type
        const blockDef = assetRegistry.getBlockDefinition(blockType);
        if (blockDef && blockDef.behavior === 'decoration') {
            this.levelData.decorations.push(blockData);
        } else if (blockDef && blockDef.behavior === 'hazard') {
            // Add hazards to blocks array with special handling
            this.levelData.blocks.push(blockData);
        } else {
            this.levelData.blocks.push(blockData);
        }
        
        // Store reference
        this.blockInstances.set(blockMesh, blockData);
        
        console.log('Block placed:', blockType, 'at', gridPos);
        console.log('Level data updated:', this.levelData);
    }
    
    removeBlock(gridPos) {
        // Find and remove block at position
        const block = this.getBlockAt(gridPos);
        if (block) {
            // Remove from scene
            this.scene.remove(block);
            
            // Remove from level data
            const blockData = this.blockInstances.get(block);
            if (blockData) {
                // Remove from appropriate array
                this.levelData.blocks = this.levelData.blocks.filter(b => 
                    !(b.at[0] === gridPos.x && b.at[1] === gridPos.y && b.at[2] === gridPos.z)
                );
                this.levelData.decorations = this.levelData.decorations.filter(d => 
                    !(d.at[0] === gridPos.x && d.at[1] === gridPos.y && d.at[2] === gridPos.z)
                );
            }
            
            // Remove reference
            this.blockInstances.delete(block);
            
            console.log('Block removed at', gridPos);
            console.log('Level data updated:', this.levelData);
        }
        
        // Also check for special objects
        this.removeSpecialObject(gridPos);
    }
    
    getBlockAt(gridPos) {
        // Find block mesh at grid position
        for (const [mesh, data] of this.blockInstances) {
            if (data.at[0] === gridPos.x && 
                data.at[1] === gridPos.y && 
                data.at[2] === gridPos.z) {
                return mesh;
            }
        }
        return null;
    }
    
    async createBlockMesh(blockType) {
        // Get block definition from registry
        const blockDef = assetRegistry.getBlockDefinition(blockType);
        if (!blockDef) {
            console.warn('Block type not found:', blockType);
            return null;
        }
        
        // Create a simple colored box for now (will load GLB models later)
        const geometry = new THREE.BoxGeometry(
            this.gridUnitSize * 0.95,
            this.gridUnitSize * 0.95,
            this.gridUnitSize * 0.95
        );
        
        // Color based on block type
        let color = 0x808080; // Default gray
        if (blockType.includes('grass')) color = 0x4CAF50;
        else if (blockType.includes('stone')) color = 0x9E9E9E;
        else if (blockType.includes('brick')) color = 0x8D6E63;
        else if (blockType.includes('hazard')) color = 0xF44336;
        else if (blockType.includes('tree')) color = 0x2E7D32;
        else if (blockType.includes('bush')) color = 0x66BB6A;
        else if (blockType.includes('flower')) color = 0xE91E63;
        else if (blockType.includes('mushroom')) color = 0x795548;
        
        const material = new THREE.MeshPhongMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.blockType = blockType;
        
        return mesh;
    }
    
    setPlayerSpawn(gridPos) {
        // Remove old spawn marker if exists
        const oldSpawn = this.specialObjects.get('player_spawn');
        if (oldSpawn) {
            this.scene.remove(oldSpawn);
        }
        
        // Create spawn marker
        const geometry = new THREE.SphereGeometry(this.gridUnitSize * 0.3);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.3
        });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(this.gridToWorld(gridPos));
        
        // Add to scene
        this.scene.add(marker);
        this.specialObjects.set('player_spawn', marker);
        
        // Update level data
        this.levelData.player.spawn = [gridPos.x, gridPos.y, gridPos.z];
        
        console.log('Player spawn set at', gridPos);
    }
    
    addKey(gridPos) {
        // Create key marker
        const geometry = new THREE.ConeGeometry(
            this.gridUnitSize * 0.3, 
            this.gridUnitSize * 0.6
        );
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xffd700,
            emissive: 0xffd700,
            emissiveIntensity: 0.3
        });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(this.gridToWorld(gridPos));
        marker.rotation.z = Math.PI;
        
        // Add to scene
        this.scene.add(marker);
        
        // Generate key ID
        const keyId = `key${this.levelData.objectives.keys.length + 1}`;
        
        // Store reference
        this.specialObjects.set(`key_${gridPos.x}_${gridPos.y}_${gridPos.z}`, marker);
        
        // Update level data
        this.levelData.objectives.keys.push({
            id: keyId,
            at: [gridPos.x, gridPos.y, gridPos.z]
        });
        
        console.log('Key added at', gridPos);
    }
    
    setExit(gridPos) {
        // Remove old exit marker if exists
        const oldExit = this.specialObjects.get('exit');
        if (oldExit) {
            this.scene.remove(oldExit);
        }
        
        // Create exit marker
        const geometry = new THREE.TorusGeometry(
            this.gridUnitSize * 0.4,
            this.gridUnitSize * 0.1,
            8,
            20
        );
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xff00ff,
            emissive: 0xff00ff,
            emissiveIntensity: 0.3
        });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(this.gridToWorld(gridPos));
        marker.rotation.x = Math.PI / 2;
        
        // Add to scene
        this.scene.add(marker);
        this.specialObjects.set('exit', marker);
        
        // Update level data
        this.levelData.objectives.exit = {
            at: [gridPos.x, gridPos.y, gridPos.z]
        };
        
        console.log('Exit set at', gridPos);
    }
    
    removeSpecialObject(gridPos) {
        // Check for key at position
        const keyName = `key_${gridPos.x}_${gridPos.y}_${gridPos.z}`;
        const keyMarker = this.specialObjects.get(keyName);
        if (keyMarker) {
            this.scene.remove(keyMarker);
            this.specialObjects.delete(keyName);
            
            // Remove from level data
            this.levelData.objectives.keys = this.levelData.objectives.keys.filter(
                k => !(k.at[0] === gridPos.x && k.at[1] === gridPos.y && k.at[2] === gridPos.z)
            );
        }
        
        // Check for player spawn
        if (this.levelData.player.spawn[0] === gridPos.x &&
            this.levelData.player.spawn[1] === gridPos.y &&
            this.levelData.player.spawn[2] === gridPos.z) {
            const spawn = this.specialObjects.get('player_spawn');
            if (spawn) {
                this.scene.remove(spawn);
                this.specialObjects.delete('player_spawn');
            }
        }
        
        // Check for exit
        if (this.levelData.objectives.exit &&
            this.levelData.objectives.exit.at[0] === gridPos.x &&
            this.levelData.objectives.exit.at[1] === gridPos.y &&
            this.levelData.objectives.exit.at[2] === gridPos.z) {
            const exit = this.specialObjects.get('exit');
            if (exit) {
                this.scene.remove(exit);
                this.specialObjects.delete('exit');
                this.levelData.objectives.exit = null;
            }
        }
    }
    
    clearLevel() {
        // Remove all blocks
        for (const [mesh, data] of this.blockInstances) {
            this.scene.remove(mesh);
        }
        this.blockInstances.clear();
        
        // Remove all special objects
        for (const [key, obj] of this.specialObjects) {
            this.scene.remove(obj);
        }
        this.specialObjects.clear();
        
        // Reset level data
        this.levelData.blocks = [];
        this.levelData.decorations = [];
        this.levelData.objectives.keys = [];
        this.levelData.objectives.exit = null;
        this.levelData.collectibles = [];
        
        console.log('Level cleared');
    }
    
    generateJSON() {
        // Validate level before generating
        const validation = this.validateLevel();
        if (!validation.valid) {
            alert('Level validation failed:\n' + validation.errors.join('\n'));
            return null;
        }
        
        // Generate clean JSON
        const json = JSON.stringify(this.levelData, null, 2);
        console.log('Generated JSON:', json);
        return json;
    }
    
    validateLevel() {
        const errors = [];
        
        // Check for player spawn
        if (!this.levelData.player.spawn) {
            errors.push('- Missing player spawn point');
        }
        
        // Check for at least one key
        if (this.levelData.objectives.keys.length === 0) {
            errors.push('- Level must have at least one key');
        }
        
        // Check for exit
        if (!this.levelData.objectives.exit) {
            errors.push('- Missing exit point');
        }
        
        // Check for at least some platforms
        if (this.levelData.blocks.length === 0) {
            errors.push('- Level must have at least one platform');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    loadJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Clear current level
            this.clearLevel();
            
            // Load new data
            this.levelData = data;
            
            // Recreate blocks
            for (const block of data.blocks) {
                const gridPos = { x: block.at[0], y: block.at[1], z: block.at[2] };
                this.placeBlock(gridPos, block.type);
            }
            
            // Recreate decorations
            if (data.decorations) {
                for (const deco of data.decorations) {
                    const gridPos = { x: deco.at[0], y: deco.at[1], z: deco.at[2] };
                    this.placeBlock(gridPos, deco.type);
                }
            }
            
            // Recreate special objects
            if (data.player && data.player.spawn) {
                const spawn = data.player.spawn;
                this.setPlayerSpawn({ x: spawn[0], y: spawn[1], z: spawn[2] });
            }
            
            if (data.objectives) {
                if (data.objectives.keys) {
                    for (const key of data.objectives.keys) {
                        this.addKey({ x: key.at[0], y: key.at[1], z: key.at[2] });
                    }
                }
                
                if (data.objectives.exit) {
                    const exit = data.objectives.exit.at;
                    this.setExit({ x: exit[0], y: exit[1], z: exit[2] });
                }
            }
            
            console.log('Level loaded from JSON');
            return true;
        } catch (error) {
            console.error('Failed to load JSON:', error);
            return false;
        }
    }
    
    updateCoordinatesDisplay(gridPos) {
        const display = document.getElementById('coordinates-display');
        if (display) {
            if (gridPos) {
                display.innerHTML = `Floor: ${this.currentFloor}<br>Grid: [${gridPos.x}, ${gridPos.y}, ${gridPos.z}]<br>Tool: ${this.currentTool}`;
            } else {
                display.innerHTML = `Floor: ${this.currentFloor}<br>Tool: ${this.currentTool}`;
            }
        }
    }
    
    setTool(tool) {
        this.currentTool = tool;
        console.log('Tool changed to:', tool);
    }
    
    setBlockType(blockType) {
        this.selectedBlockType = blockType;
        console.log('Block type selected:', blockType);
    }
    
    setGridSize(size) {
        this.gridSize = parseInt(size);
        
        // Recreate grid
        this.scene.remove(this.gridHelper);
        this.scene.remove(this.gridPlane);
        this.setupGrid();
        
        console.log('Grid size changed to:', this.gridSize);
    }
    
    handleWindowResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Rotate special objects for visibility
        const time = Date.now() * 0.001;
        for (const [key, obj] of this.specialObjects) {
            if (key.startsWith('key_')) {
                obj.rotation.y = time * 2;
            } else if (key === 'exit') {
                obj.rotation.z = time;
            }
        }
        
        // Update floor visibility
        this.updateFloorVisibility();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    // Public API for UI
    getLevelData() {
        return this.levelData;
    }
    
    setLevelName(name) {
        this.levelData.name = name;
    }
    
    setLevelTheme(theme) {
        this.levelData.theme = theme;
    }
    
    // Floor management methods
    setFloor(floor) {
        // Clamp floor to valid range
        floor = Math.max(this.minFloor, Math.min(this.maxFloor, floor));
        
        if (floor !== this.currentFloor) {
            this.currentFloor = floor;
            
            // Update grid position
            if (this.gridHelper) {
                this.gridHelper.position.y = this.currentFloor * this.floorHeight;
            }
            
            // Update raycast plane position
            if (this.gridPlane) {
                this.gridPlane.position.y = this.currentFloor * this.floorHeight;
            }
            
            // Update highlight if visible
            if (this.highlightCube.visible && this.hoveredGridPos) {
                this.highlightCube.position.y = this.currentFloor * this.floorHeight;
            }
            
            // Update display
            this.updateCoordinatesDisplay(this.hoveredGridPos);
            
            console.log(`Floor changed to: ${this.currentFloor}`);
        }
    }
    
    moveFloorUp() {
        this.setFloor(this.currentFloor + 1);
    }
    
    moveFloorDown() {
        this.setFloor(this.currentFloor - 1);
    }
    
    updateFloorVisibility() {
        // Update opacity of blocks based on their floor relative to current floor
        for (const [mesh, data] of this.blockInstances) {
            const blockFloor = data.at[1];  // Y coordinate is the floor
            
            if (blockFloor === this.currentFloor) {
                // Current floor: full visibility
                mesh.material.opacity = 1.0;
                mesh.material.transparent = false;
            } else if (blockFloor < this.currentFloor) {
                // Floors below: semi-transparent (25% opacity)
                mesh.material.opacity = 0.25;
                mesh.material.transparent = true;
            } else {
                // Floors above: very faint (10% opacity)
                mesh.material.opacity = 0.1;
                mesh.material.transparent = true;
            }
        }
        
        // Update special objects visibility
        for (const [key, obj] of this.specialObjects) {
            let objFloor = 0;
            
            // Determine floor from object position or data
            if (key === 'player_spawn' && this.levelData.player.spawn) {
                objFloor = this.levelData.player.spawn[1];
            } else if (key === 'exit' && this.levelData.objectives.exit) {
                objFloor = this.levelData.objectives.exit.at[1];
            } else if (key.startsWith('key_')) {
                // Extract coordinates from key name
                const parts = key.split('_');
                if (parts.length >= 3) {
                    objFloor = parseInt(parts[2]);
                }
            }
            
            // Apply visibility rules
            if (obj.material) {
                if (objFloor === this.currentFloor) {
                    obj.material.opacity = 1.0;
                    obj.material.transparent = false;
                } else if (objFloor < this.currentFloor) {
                    obj.material.opacity = 0.25;
                    obj.material.transparent = true;
                } else {
                    obj.material.opacity = 0.1;
                    obj.material.transparent = true;
                }
            }
        }
    }
    
    getCurrentFloor() {
        return this.currentFloor;
    }
}