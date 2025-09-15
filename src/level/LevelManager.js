/**
 * LevelManager - Handles loading and management of game levels from JSON data
 * Requirements: ARCH-002 (Data-Driven Levels), ARCH-003 (Grid Coordinate System), PROD-004 (Key Collection), PROD-005 (Exit Portal), PROD-010 (Scoring), PROD-007 (Hazards), PROD-011 (Modular Blocks), PROD-013 (Universal 3D Grid)
 */

// THREE is available as a global from the CDN
import * as CANNON from 'cannon-es';
import { Coin } from '../entities/Coin.js';
import { Hazard } from '../entities/Hazard.js';
import { MovingPlatform } from '../entities/MovingPlatform.js';
import assetRegistry from '../assets/AssetRegistry.js';
import assetManager from '../assets/AssetManager.js';

export class LevelManager {
    constructor(scene, physicsManager) {
        this.scene = scene;
        this.physicsManager = physicsManager;
        
        // Current level data
        this.currentLevel = null;
        this.levelEntities = [];
        this.levelPhysicsBodies = [];
        
        // Grid system properties - Requirement: ARCH-003, PROD-013
        this.gridUnitSize = 4; // Default grid unit size
        this.isGridBased = false; // Flag to track if level uses new grid format
        
        // Game state for objectives - Requirement: PROD-004, PROD-005
        this.gameState = {
            keysCollected: 0,
            totalKeys: 0,
            exitUnlocked: false,
            levelComplete: false,
            playerStartPosition: null,
            playerStartGravity: null
        };
        
        // Entity collections
        this.keys = new Map();
        this.platforms = new Map();
        this.coins = new Map(); // Requirement: PROD-010
        this.hazards = new Map(); // Requirement: PROD-007
        this.movingPlatforms = new Map(); // Requirement: PROD-011
        this.exitPortal = null;
        
        console.log('LevelManager::constructor - Level manager initialized with grid support');
    }
    
    /**
     * Load a level from JSON data
     * Requirement: ARCH-002 - Data-Driven Levels, ARCH-003 - Grid Coordinate System
     * @param {Object|string} levelData - Level data object or path to JSON file
     * @returns {Promise<void>}
     */
    async load(levelData) {
        console.log('LevelManager::load - Loading level data');
        
        // Clear any existing level
        this.clear();
        
        // Parse level data if it's a string (file path)
        if (typeof levelData === 'string') {
            try {
                const response = await fetch(levelData);
                this.currentLevel = await response.json();
            } catch (error) {
                console.error('LevelManager::load - Failed to load level file:', error);
                throw error;
            }
        } else {
            this.currentLevel = levelData;
        }
        
        // Check if this is a new grid-based level format
        if (this.currentLevel.gridUnitSize !== undefined && this.currentLevel.blocks) {
            this.isGridBased = true;
            this.gridUnitSize = this.currentLevel.gridUnitSize || 4;
            console.log(`LevelManager::load - Loading grid-based level with gridUnitSize: ${this.gridUnitSize}`);
            
            // Set theme for AssetRegistry if specified
            if (this.currentLevel.theme) {
                assetRegistry.setTheme(this.currentLevel.theme);
            }
            
            // Load grid-based level
            await this.loadGridLevel();
        } else {
            // Load legacy format level
            this.isGridBased = false;
            console.log('LevelManager::load - Loading legacy format level:', this.currentLevel.name);
            await this.loadLegacyLevel();
        }
        
        console.log(`LevelManager::load - Level loaded with ${this.platforms.size} platforms, ${this.keys.size} keys`);
        console.log('LevelManager::load - Game state:', this.gameState);
    }
    
    /**
     * Load a grid-based level format
     * Requirement: ARCH-003 - Grid Coordinate System, PROD-013 - Universal 3D Grid
     */
    async loadGridLevel() {
        console.log('LevelManager::loadGridLevel - Loading grid-based level');
        
        // Preload all required model assets for this level
        if (this.currentLevel.blocks) {
            await this.preloadLevelAssets(this.currentLevel.blocks);
        }
        
        // Process blocks (now with preloaded assets)
        if (this.currentLevel.blocks) {
            await this.createGridBlocks(this.currentLevel.blocks);
        }
        
        // Process player spawn position (convert from grid to world)
        if (this.currentLevel.player) {
            const spawn = this.currentLevel.player.spawn;
            this.gameState.playerStartPosition = this.gridToWorld(spawn);
            this.gameState.playerStartGravity = new THREE.Vector3(0, -1, 0);
            
            console.log(`LevelManager::loadGridLevel - Player spawn: grid[${spawn}] -> world(${this.gameState.playerStartPosition.x}, ${this.gameState.playerStartPosition.y}, ${this.gameState.playerStartPosition.z})`);
        }
        
        // Process objectives
        if (this.currentLevel.objectives) {
            // Create keys
            if (this.currentLevel.objectives.keys) {
                this.createGridKeys(this.currentLevel.objectives.keys);
                this.gameState.totalKeys = this.currentLevel.objectives.keys.length;
            }
            
            // Create exit portal
            if (this.currentLevel.objectives.exit) {
                this.createGridExitPortal(this.currentLevel.objectives.exit);
            }
        }
        
        // Process collectibles
        if (this.currentLevel.collectibles) {
            this.createGridCoins(this.currentLevel.collectibles);
        }
        
        // Process decorations (non-collidable visual elements)
        if (this.currentLevel.decorations) {
            await this.createGridDecorations(this.currentLevel.decorations);
        }
    }
    
    /**
     * Load a legacy format level (backward compatibility)
     */
    async loadLegacyLevel() {
        console.log('LevelManager::loadLegacyLevel - Loading legacy format level');
        
        // Set player start position and gravity
        if (this.currentLevel.playerStart) {
            this.gameState.playerStartPosition = new THREE.Vector3(
                this.currentLevel.playerStart.position.x,
                this.currentLevel.playerStart.position.y,
                this.currentLevel.playerStart.position.z
            );
            
            if (this.currentLevel.playerStart.gravity) {
                this.gameState.playerStartGravity = new THREE.Vector3(
                    this.currentLevel.playerStart.gravity.x,
                    this.currentLevel.playerStart.gravity.y,
                    this.currentLevel.playerStart.gravity.z
                );
            } else {
                this.gameState.playerStartGravity = new THREE.Vector3(0, -1, 0);
            }
        }
        
        // Create platforms - Requirement: PROD-011 (Modular Blocks)
        if (this.currentLevel.platforms) {
            this.createPlatforms(this.currentLevel.platforms);
        }
        
        // Create keys - Requirement: PROD-004
        if (this.currentLevel.keys) {
            this.createKeys(this.currentLevel.keys);
            this.gameState.totalKeys = this.currentLevel.keys.length;
        }
        
        // Create exit portal - Requirement: PROD-005
        if (this.currentLevel.exit) {
            this.createExitPortal(this.currentLevel.exit);
        }
        
        // Create coins - Requirement: PROD-010
        if (this.currentLevel.coins) {
            this.createCoins(this.currentLevel.coins);
        }
        
        // Create hazards - Requirement: PROD-007
        if (this.currentLevel.hazards) {
            this.createHazards(this.currentLevel.hazards);
        }
        
        // Create moving platforms - Requirement: PROD-011
        if (this.currentLevel.movingPlatforms) {
            this.createMovingPlatforms(this.currentLevel.movingPlatforms);
        }
        
        // Set level bounds
        if (this.currentLevel.levelBounds) {
            this.levelBounds = this.currentLevel.levelBounds;
        }
    }
    
    /**
     * Convert grid coordinates to world position
     * Requirement: ARCH-003 - Grid Coordinate System
     * Formula: worldPosition = gridPosition * gridUnitSize
     * @param {Array} gridCoords - Integer grid coordinates [x, y, z]
     * @returns {THREE.Vector3} World position
     */
    gridToWorld(gridCoords) {
        return new THREE.Vector3(
            gridCoords[0] * this.gridUnitSize,
            gridCoords[1] * this.gridUnitSize,
            gridCoords[2] * this.gridUnitSize
        );
    }
    
    /**
     * Preload all model assets required for the level
     * Requirement: NFR-004 - Asset Loading & Instancing
     * @param {Array} blocksData - Array of block definitions
     */
    async preloadLevelAssets(blocksData) {
        console.log(`LevelManager::preloadLevelAssets - Analyzing ${blocksData.length} blocks for asset requirements`);
        
        // Collect unique model paths
        const uniqueModelPaths = new Set();
        
        blocksData.forEach(blockData => {
            const blockDef = assetRegistry.getBlockDefinition(blockData.type);
            if (blockDef && blockDef.model) {
                uniqueModelPaths.add(blockDef.model);
            }
        });
        
        console.log(`LevelManager::preloadLevelAssets - Found ${uniqueModelPaths.size} unique models to load`);
        
        // Preload all unique models
        const modelPathsArray = Array.from(uniqueModelPaths);
        await assetManager.preloadModels(modelPathsArray);
        
        console.log('LevelManager::preloadLevelAssets - All assets preloaded successfully');
    }
    
    /**
     * Create blocks from grid-based level data
     * Requirement: PROD-013 - Universal 3D Grid, ARCH-004 - Asset Registry, NFR-004 - Asset Loading & Instancing
     */
    async createGridBlocks(blocksData) {
        console.log(`LevelManager::createGridBlocks - Creating ${blocksData.length} blocks`);
        
        for (let index = 0; index < blocksData.length; index++) {
            const blockData = blocksData[index];
            
            // Get block definition from AssetRegistry
            const blockDef = assetRegistry.getBlockDefinition(blockData.type);
            if (!blockDef) {
                console.warn(`LevelManager::createGridBlocks - Unknown block type: ${blockData.type}`);
                continue;
            }
            
            // Calculate world position from grid coordinates
            const worldPos = this.gridToWorld(blockData.at);
            
            // Log the grid to world transformation for testing
            console.log(`LevelManager::createGridBlocks - Block '${blockData.type}' at grid[${blockData.at}] -> world(${worldPos.x}, ${worldPos.y}, ${worldPos.z})`);
            
            let mesh;
            
            // Try to load actual .glb model from AssetManager
            if (blockDef.model) {
                const modelInstance = assetManager.getInstance(blockDef.model);
                
                if (modelInstance) {
                    // Use the actual .glb model instance
                    mesh = modelInstance;
                    
                    // Scale the model to fit the grid unit size if needed
                    // Most models are designed to fit a 1x1x1 unit, scale to grid size
                    const scaleFactor = this.gridUnitSize / 4; // Assuming models are designed for size 4
                    mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
                    
                    console.log(`LevelManager::createGridBlocks - Using .glb model instance: ${blockDef.model}`);
                } else {
                    console.warn(`LevelManager::createGridBlocks - Model not loaded: ${blockDef.model}, using placeholder`);
                    // Fall back to placeholder if model not loaded
                    mesh = this.createPlaceholderBlock(blockData.type);
                }
            } else {
                // No model specified, use placeholder
                mesh = this.createPlaceholderBlock(blockData.type);
            }
            
            // Set position and properties
            mesh.position.copy(worldPos);
            mesh.name = `block-${blockData.type}-${index}`;
            mesh.userData = {
                blockType: blockData.type,
                gridPosition: blockData.at,
                blockDefinition: blockDef
            };
            
            // Add to scene and track
            this.scene.add(mesh);
            this.levelEntities.push(mesh);
            this.platforms.set(`block-${index}`, mesh);
            
            // Create physics body using simplified shape from registry
            // Skip physics body creation for decorations (non-collidable)
            if (this.physicsManager && this.physicsManager.world) {
                // Check if this is a decoration (should not have collision)
                if (blockDef.behavior !== 'decoration') {
                    this.createBlockPhysicsBody(blockDef, worldPos, index);
                } else {
                    console.log(`LevelManager::createGridBlocks - Skipping physics for decoration: ${blockData.type}`);
                }
            }
        }
    }
    
    /**
     * Create a placeholder block mesh
     * @param {string} blockType - The type of block
     * @returns {THREE.Mesh} A placeholder mesh
     */
    createPlaceholderBlock(blockType) {
        const geometry = new THREE.BoxGeometry(
            this.gridUnitSize * 0.95, // Slightly smaller for visual gaps
            this.gridUnitSize * 0.95,
            this.gridUnitSize * 0.95
        );
        
        // Color based on block type for visual distinction
        const color = blockType === 'nature_rock_platform' ? 0x808080 : 0x4080ff;
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        return mesh;
    }
    
    /**
     * Create physics body for a block using simplified colliders
     * Requirement: ARCH-006 - Physics Optimization
     * @param {Object} blockDef - Block definition from AssetRegistry
     * @param {THREE.Vector3} worldPos - World position for the block
     * @param {number} index - Block index
     */
    createBlockPhysicsBody(blockDef, worldPos, index) {
        if (!blockDef.physics) return;
        
        // Create simplified physics shape from registry (Box primitive, not complex mesh)
        const physicsShape = assetRegistry.createPhysicsShape(blockDef.physics);
        
        // Create static physics body
        const body = new CANNON.Body({
            mass: 0, // Static body
            shape: physicsShape,
            position: new CANNON.Vec3(worldPos.x, worldPos.y, worldPos.z),
            type: CANNON.Body.STATIC,
            material: this.physicsManager.groundMaterial
        });
        
        // Add to physics world
        this.physicsManager.world.addBody(body);
        this.levelPhysicsBodies.push(body);
        
        // Log for test verification
        console.log(`LevelManager::createBlockPhysicsBody - Created ${blockDef.physics.shape} physics body for block ${index}`);
        console.log(`  Physics shape type: ${blockDef.physics.shape}`);
        console.log(`  Position: (${worldPos.x}, ${worldPos.y}, ${worldPos.z})`);
    }
    
    /**
     * Create keys from grid-based level data
     */
    createGridKeys(keysData) {
        keysData.forEach(keyData => {
            const worldPos = this.gridToWorld(keyData.at);
            
            // Create key at grid position
            const keyWorldData = {
                id: keyData.id,
                position: { x: worldPos.x, y: worldPos.y + 2, z: worldPos.z }, // Raise key above block
                color: '#FFD700',
                scale: 1.0
            };
            
            // Use existing key creation logic
            this.createKeys([keyWorldData]);
        });
    }
    
    /**
     * Create exit portal from grid-based level data
     */
    createGridExitPortal(exitData) {
        const worldPos = this.gridToWorld(exitData.at);
        
        // Create exit portal at grid position
        const exitWorldData = {
            position: { x: worldPos.x, y: worldPos.y + 0.5, z: worldPos.z },
            lockedColor: '#FF0000',
            unlockedColor: '#00FF00',
            scale: 1.5
        };
        
        // Use existing portal creation logic
        this.createExitPortal(exitWorldData);
    }
    
    /**
     * Create coins from grid-based level data
     */
    createGridCoins(coinsData) {
        coinsData.forEach((coinData, index) => {
            const worldPos = this.gridToWorld(coinData.at);
            
            // Create coin at grid position
            const coinWorldData = {
                id: `coin-${index}`,
                position: { x: worldPos.x, y: worldPos.y + 1, z: worldPos.z },
                value: coinData.value || 10,
                type: coinData.type || 'silver'
            };
            
            // Use existing coin creation logic
            this.createCoins([coinWorldData]);
        });
    }
    
    /**
     * Create decorations from grid-based level data
     * These are non-collidable visual elements that enhance the environment
     * Requirement: PROD-016 - Thematic Worlds
     */
    async createGridDecorations(decorationsData) {
        console.log(`LevelManager::createGridDecorations - Creating ${decorationsData.length} decorations`);
        
        // First preload all decoration models
        const uniqueModelPaths = new Set();
        decorationsData.forEach(decorData => {
            const blockDef = assetRegistry.getBlockDefinition(decorData.type);
            if (blockDef && blockDef.model) {
                uniqueModelPaths.add(blockDef.model);
            }
        });
        
        // Preload models
        if (uniqueModelPaths.size > 0) {
            const modelPathsArray = Array.from(uniqueModelPaths);
            await assetManager.preloadModels(modelPathsArray);
        }
        
        // Create decoration entities
        decorationsData.forEach((decorData, index) => {
            // Decorations are essentially blocks with behavior: 'decoration'
            // We can reuse the block creation logic
            const blockDataWithDecoration = {
                type: decorData.type,
                at: decorData.at
            };
            
            // Get block definition from AssetRegistry
            const blockDef = assetRegistry.getBlockDefinition(decorData.type);
            if (!blockDef) {
                console.warn(`LevelManager::createGridDecorations - Unknown decoration type: ${decorData.type}`);
                return;
            }
            
            // Calculate world position from grid coordinates
            const worldPos = this.gridToWorld(decorData.at);
            
            let mesh;
            
            // Try to load actual .glb model from AssetManager
            if (blockDef.model) {
                const modelInstance = assetManager.getInstance(blockDef.model);
                
                if (modelInstance) {
                    mesh = modelInstance;
                    const scaleFactor = this.gridUnitSize / 4;
                    mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
                    console.log(`LevelManager::createGridDecorations - Using decoration model: ${blockDef.model}`);
                } else {
                    console.warn(`LevelManager::createGridDecorations - Model not loaded: ${blockDef.model}`);
                    return;
                }
            } else {
                console.warn(`LevelManager::createGridDecorations - No model specified for decoration: ${decorData.type}`);
                return;
            }
            
            // Set position and properties
            mesh.position.copy(worldPos);
            mesh.name = `decoration-${decorData.type}-${index}`;
            mesh.userData = {
                blockType: decorData.type,
                gridPosition: decorData.at,
                blockDefinition: blockDef,
                isDecoration: true
            };
            
            // Add to scene and track (no physics body for decorations)
            this.scene.add(mesh);
            this.levelEntities.push(mesh);
            
            console.log(`LevelManager::createGridDecorations - Created decoration '${decorData.type}' at grid[${decorData.at}] -> world(${worldPos.x}, ${worldPos.y}, ${worldPos.z})`);
        });
    }
    
    /**
     * Create platform entities from level data
     * Requirement: PROD-011 - Modular Blocks
     */
    createPlatforms(platformsData) {
        platformsData.forEach(platformData => {
            // Create geometry based on size
            const geometry = new THREE.BoxGeometry(
                platformData.size.width,
                platformData.size.height,
                platformData.size.depth
            );
            
            // Create material with specified properties
            const material = new THREE.MeshStandardMaterial({
                color: platformData.material.color || '#808080',
                roughness: platformData.material.roughness || 0.8,
                metalness: platformData.material.metalness || 0.2
            });
            
            // Create mesh
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                platformData.position.x,
                platformData.position.y,
                platformData.position.z
            );
            
            // Apply rotation if specified
            if (platformData.rotation) {
                mesh.rotation.set(
                    platformData.rotation.x || 0,
                    platformData.rotation.y || 0,
                    platformData.rotation.z || 0
                );
            }
            
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.name = `platform-${platformData.id}`;
            
            // Add to scene and track
            this.scene.add(mesh);
            this.levelEntities.push(mesh);
            this.platforms.set(platformData.id, mesh);
            
            // Create physics body if physics manager is available
            if (this.physicsManager && platformData.physics) {
                const physicsBody = this.createPlatformPhysicsBody(platformData);
                if (physicsBody) {
                    this.levelPhysicsBodies.push(physicsBody);
                }
            }
            
            console.log(`LevelManager::createPlatforms - Created platform: ${platformData.id} at`, mesh.position);
        });
    }
    
    /**
     * Create physics body for a platform
     * Requirement: PROD-001 - Gravity Reorientation
     */
    createPlatformPhysicsBody(platformData) {
        // Determine platform orientation based on size and position
        const isFloor = platformData.size.height < platformData.size.width && 
                       platformData.size.height < platformData.size.depth;
        const isWall = platformData.size.width < platformData.size.height || 
                      platformData.size.depth < platformData.size.height;
        
        let body = null;
        
        if (isFloor || platformData.id.includes('floor') || platformData.id.includes('ceiling')) {
            // Create floor/ceiling body
            body = this.physicsManager.createFloorBody(
                new THREE.Vector3(
                    platformData.position.x,
                    platformData.position.y,
                    platformData.position.z
                ),
                new THREE.Vector2(
                    platformData.size.width,
                    platformData.size.depth
                )
            );
        } else if (isWall || platformData.id.includes('wall')) {
            // Create wall body
            body = this.physicsManager.createWallBody(
                new THREE.Vector3(
                    platformData.position.x,
                    platformData.position.y,
                    platformData.position.z
                ),
                new THREE.Vector2(
                    Math.max(platformData.size.width, platformData.size.depth),
                    platformData.size.height
                )
            );
        }
        
        if (body && platformData.physics.isGravitySurface) {
            body.isGravitySurface = true;
        }
        
        return body;
    }
    
    /**
     * Create key entities from level data
     * Requirement: PROD-004 - Key Collection
     */
    createKeys(keysData) {
        keysData.forEach(keyData => {
            // Create key geometry - a simple torus for now, will enhance later
            const geometry = new THREE.TorusGeometry(0.4, 0.1, 8, 16);
            
            // Create golden material with emissive glow
            const material = new THREE.MeshStandardMaterial({
                color: keyData.color || '#FFD700',
                emissive: keyData.color || '#FFD700',
                emissiveIntensity: 0.3,
                metalness: 0.8,
                roughness: 0.2
            });
            
            // Create mesh
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                keyData.position.x,
                keyData.position.y,
                keyData.position.z
            );
            
            // Apply scale if specified
            if (keyData.scale) {
                mesh.scale.setScalar(keyData.scale);
            }
            
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.name = `key-${keyData.id}`;
            
            // Store key metadata
            mesh.userData = {
                id: keyData.id,
                rotationSpeed: keyData.rotationSpeed || 2.0,
                collected: false,
                isKey: true
            };
            
            // Add to scene and track
            this.scene.add(mesh);
            this.levelEntities.push(mesh);
            this.keys.set(keyData.id, mesh);
            
            console.log(`LevelManager::createKeys - Created key: ${keyData.id} at`, mesh.position);
        });
    }
    
    /**
     * Create exit portal from level data
     * Requirement: PROD-005 - Exit Portal
     */
    createExitPortal(exitData) {
        // Create portal geometry - a cylinder for now
        const geometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32);
        
        // Create material - starts locked (red)
        const material = new THREE.MeshStandardMaterial({
            color: exitData.lockedColor || '#FF0000',
            emissive: exitData.lockedColor || '#FF0000',
            emissiveIntensity: 0.2,
            metalness: 0.5,
            roughness: 0.3
        });
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            exitData.position.x,
            exitData.position.y,
            exitData.position.z
        );
        
        // Rotate to lie flat
        mesh.rotation.x = Math.PI / 2;
        
        // Apply scale if specified
        if (exitData.scale) {
            mesh.scale.setScalar(exitData.scale);
        }
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = 'exit-portal';
        
        // Store portal metadata
        mesh.userData = {
            requiredKeys: exitData.requiredKeys || this.gameState.totalKeys,
            lockedColor: exitData.lockedColor || '#FF0000',
            unlockedColor: exitData.unlockedColor || '#00FF00',
            isLocked: true,
            isExitPortal: true
        };
        
        // Add to scene and track
        this.scene.add(mesh);
        this.levelEntities.push(mesh);
        this.exitPortal = mesh;
        
        console.log(`LevelManager::createExitPortal - Created exit portal at`, mesh.position);
        console.log(`LevelManager::createExitPortal - Requires ${mesh.userData.requiredKeys} keys`);
    }
    
    /**
     * Create coins from level data
     * Requirement: PROD-010 - Collectibles: Scoring
     */
    createCoins(coinsData) {
        coinsData.forEach(coinData => {
            const coin = new Coin(
                coinData.id,
                coinData.position,
                coinData.value || 10,
                coinData.type || 'silver'
            );
            
            // Add coin mesh to scene
            coin.addToScene(this.scene);
            
            // Track coin
            this.coins.set(coinData.id, coin);
            this.levelEntities.push(coin.mesh);
            
            console.log(`LevelManager::createCoins - Created ${coin.type} coin: ${coin.id} worth ${coin.value} points`);
        });
    }
    
    /**
     * Create hazards from level data
     * Requirement: PROD-007 - Failure Condition: Hazards
     */
    createHazards(hazardsData) {
        hazardsData.forEach((hazardData, index) => {
            const hazard = new Hazard({
                position: [hazardData.position.x, hazardData.position.y, hazardData.position.z],
                size: hazardData.size ? [hazardData.size.width, hazardData.size.height, hazardData.size.depth] : [1, 0.5, 1],
                type: hazardData.type || 'spikes',
                color: hazardData.color
            });
            
            // Add hazard mesh to scene
            this.scene.add(hazard.mesh);
            this.levelEntities.push(hazard.mesh);
            
            // Create physics body for collision detection
            if (this.physicsManager && this.physicsManager.world) {
                hazard.createPhysicsBody(this.physicsManager.world);
                this.levelPhysicsBodies.push(hazard.physicsBody);
            }
            
            // Track hazard
            const hazardId = hazardData.id || `hazard_${index}`;
            this.hazards.set(hazardId, hazard);
            
            console.log(`LevelManager::createHazards - Created ${hazard.type} hazard at`, hazard.position);
        });
    }
    
    /**
     * Create moving platforms from level data
     * Requirement: PROD-011 - Level Structure: Modular Blocks
     */
    createMovingPlatforms(movingPlatformsData) {
        movingPlatformsData.forEach((platformData, index) => {
            const movingPlatform = new MovingPlatform({
                position: platformData.position,
                size: platformData.size,
                color: platformData.color || 0x4080FF,
                movement: platformData.movement,
                id: platformData.id || `moving_platform_${index}`
            });
            
            // Add platform mesh to scene
            movingPlatform.addToScene(this.scene);
            this.levelEntities.push(movingPlatform.mesh);
            
            // Create physics body
            if (this.physicsManager && this.physicsManager.world) {
                movingPlatform.createPhysicsBody(this.physicsManager.world);
                this.levelPhysicsBodies.push(movingPlatform.physicsBody);
            }
            
            // Track moving platform
            this.movingPlatforms.set(movingPlatform.id, movingPlatform);
            
            console.log(`LevelManager::createMovingPlatforms - Created moving platform: ${movingPlatform.id}`);
        });
    }
    
    /**
     * Update level entities (animations, state changes)
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        const elapsedTime = Date.now() * 0.001; // Convert to seconds
        
        // Animate keys (rotation)
        this.keys.forEach(key => {
            if (!key.userData.collected) {
                key.rotation.y += key.userData.rotationSpeed * deltaTime;
                // Subtle floating animation
                key.position.y += Math.sin(Date.now() * 0.001) * 0.005;
            }
        });
        
        // Update coins (rotation and float animation)
        this.coins.forEach(coin => {
            if (!coin.isCollected) {
                coin.update(deltaTime, elapsedTime);
            }
        });
        
        // Update exit portal state
        if (this.exitPortal && this.exitPortal.userData.isLocked) {
            // Check if enough keys collected to unlock
            if (this.gameState.keysCollected >= this.exitPortal.userData.requiredKeys) {
                this.unlockExitPortal();
            }
        }
        
        // Animate unlocked portal
        if (this.exitPortal && !this.exitPortal.userData.isLocked) {
            this.exitPortal.rotation.z += deltaTime * 2;
            // Pulsing effect
            const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.1;
            this.exitPortal.scale.setScalar((this.currentLevel.exit?.scale || 1.5) * pulse);
        }
        
        // Update hazards - Requirement: PROD-007
        this.hazards.forEach(hazard => {
            hazard.update(deltaTime, elapsedTime);
        });
        
        // Update moving platforms - Requirement: PROD-011
        this.movingPlatforms.forEach(movingPlatform => {
            movingPlatform.update(deltaTime, elapsedTime);
        });
    }
    
    /**
     * Collect a key
     * Requirement: PROD-004 - Key Collection
     */
    collectKey(keyId) {
        const key = this.keys.get(keyId);
        if (key && !key.userData.collected) {
            key.userData.collected = true;
            this.gameState.keysCollected++;
            
            // Remove key from scene with a simple fade effect
            this.scene.remove(key);
            
            // Play key collection sound - Requirement: PROD-012
            if (window.game?.audioManager) {
                window.game.audioManager.playSound('keyCollect');
            }
            
            console.log(`LevelManager::collectKey - Collected key: ${keyId}`);
            console.log(`LevelManager::collectKey - Keys: ${this.gameState.keysCollected}/${this.gameState.totalKeys}`);
            
            // Dispatch key collected event for UI
            window.dispatchEvent(new CustomEvent('keyCollected', {
                detail: {
                    keyId: keyId,
                    collected: this.gameState.keysCollected,
                    total: this.gameState.totalKeys
                }
            }));
            
            // Check if all keys collected
            if (this.gameState.keysCollected >= this.gameState.totalKeys) {
                console.log('LevelManager::collectKey - All keys collected!');
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * Unlock the exit portal
     * Requirement: PROD-005 - Exit Portal
     */
    unlockExitPortal() {
        if (this.exitPortal && this.exitPortal.userData.isLocked) {
            this.exitPortal.userData.isLocked = false;
            this.gameState.exitUnlocked = true;
            
            // Change portal color to unlocked
            this.exitPortal.material.color.set(this.exitPortal.userData.unlockedColor);
            this.exitPortal.material.emissive.set(this.exitPortal.userData.unlockedColor);
            this.exitPortal.material.emissiveIntensity = 0.5;
            
            // Play portal unlock sound - Requirement: PROD-012
            if (window.game?.audioManager) {
                window.game.audioManager.playSound('portalUnlock');
            }
            
            console.log('LevelManager::unlockExitPortal - Exit portal unlocked!');
        }
    }
    
    /**
     * Complete the current level
     * Requirement: PROD-005 - Exit Portal
     */
    completeLevel() {
        if (this.gameState.exitUnlocked && !this.gameState.levelComplete) {
            this.gameState.levelComplete = true;
            console.log('LevelManager::completeLevel - Level Complete!');
            console.log(`LevelManager::completeLevel - Final score: ${this.gameState.keysCollected}/${this.gameState.totalKeys} keys`);
            
            // Get current score from GameState if available
            let currentScore = 0;
            if (window.game && window.game.gameState) {
                currentScore = window.game.gameState.score;
            }
            
            // Dispatch level complete event
            window.dispatchEvent(new CustomEvent('levelComplete', {
                detail: {
                    levelId: this.currentLevel.id,
                    levelName: this.currentLevel.name,
                    keysCollected: this.gameState.keysCollected,
                    totalKeys: this.gameState.totalKeys,
                    score: currentScore
                }
            }));
            
            return true;
        }
        return false;
    }
    
    /**
     * Check collision with hazards
     * Requirement: PROD-007 - Failure Condition: Hazards
     * @param {THREE.Vector3} position - Position to check
     * @param {number} radius - Collision radius
     * @returns {Object|null} Hazard collision data or null
     */
    checkHazardCollision(position, radius = 0.5) {
        for (const [hazardId, hazard] of this.hazards) {
            const distance = position.distanceTo(hazard.position);
            // Check if player is within hazard bounds
            if (distance < radius + Math.max(hazard.size[0], hazard.size[2]) / 2) {
                return hazard.onPlayerCollision();
            }
        }
        return null;
    }
    
    /**
     * Check collision with collectibles
     * @param {THREE.Vector3} position - Position to check
     * @param {number} radius - Collision radius
     */
    checkCollectibles(position, radius = 0.5) {
        // Check key collisions
        this.keys.forEach((key, keyId) => {
            if (!key.userData.collected) {
                const distance = position.distanceTo(key.position);
                if (distance < radius + 0.5) { // 0.5 is approximate key radius
                    this.collectKey(keyId);
                }
            }
        });
        
        // Check coin collisions - Requirement: PROD-010
        this.coins.forEach((coin, coinId) => {
            if (coin.checkCollision(position, radius)) {
                const collectionData = coin.collect();
                if (collectionData) {
                    // Add score through GameState (if available via window.game)
                    if (window.game?.gameState) {
                        window.game.gameState.addScore(collectionData.value, 'coin');
                    }
                    
                    // Play coin collection sound - Requirement: PROD-012
                    if (window.game?.audioManager) {
                        window.game.audioManager.playSound('coinCollect');
                    }
                    
                    // Remove coin from scene after collection animation
                    setTimeout(() => {
                        coin.removeFromScene(this.scene);
                        this.coins.delete(coinId);
                    }, 300);
                    
                    console.log(`LevelManager::checkCollectibles - Collected ${collectionData.type} coin worth ${collectionData.value} points`);
                }
            }
        });
        
        // Check exit portal collision
        if (this.exitPortal && !this.exitPortal.userData.isLocked) {
            const distance = position.distanceTo(this.exitPortal.position);
            if (distance < radius + 1.0) { // 1.0 is approximate portal radius
                this.completeLevel();
            }
        }
    }
    
    /**
     * Clear the current level
     * Requirement: ARCH-002 - Data-Driven Levels
     */
    clear() {
        console.log('LevelManager::clear - Clearing current level');
        
        // Remove all level entities from scene
        this.levelEntities.forEach(entity => {
            this.scene.remove(entity);
            // Dispose of geometry and material to free memory
            if (entity.geometry) entity.geometry.dispose();
            if (entity.material) {
                if (Array.isArray(entity.material)) {
                    entity.material.forEach(mat => mat.dispose());
                } else {
                    entity.material.dispose();
                }
            }
        });
        
        // Clear physics bodies
        this.levelPhysicsBodies.forEach(body => {
            if (this.physicsManager && this.physicsManager.world) {
                this.physicsManager.world.remove(body);
            }
        });
        
        // Dispose of coins
        this.coins.forEach(coin => {
            coin.removeFromScene(this.scene);
            coin.dispose();
        });
        
        // Dispose of hazards
        this.hazards.forEach(hazard => {
            hazard.dispose();
        });
        
        // Dispose of moving platforms
        this.movingPlatforms.forEach(movingPlatform => {
            movingPlatform.dispose();
        });
        
        // Reset collections
        this.levelEntities = [];
        this.levelPhysicsBodies = [];
        this.keys.clear();
        this.platforms.clear();
        this.coins.clear();
        this.hazards.clear();
        this.movingPlatforms.clear();
        this.exitPortal = null;
        
        // Reset game state
        this.gameState = {
            keysCollected: 0,
            totalKeys: 0,
            exitUnlocked: false,
            levelComplete: false,
            playerStartPosition: null,
            playerStartGravity: null
        };
        
        this.currentLevel = null;
        
        console.log('LevelManager::clear - Level cleared');
    }
    
    /**
     * Get current game state
     */
    getGameState() {
        return { ...this.gameState };
    }
    
    /**
     * Get player start position for the current level
     */
    getPlayerStartPosition() {
        return this.gameState.playerStartPosition || new THREE.Vector3(0, 1, 0);
    }
    
    /**
     * Get fall threshold for the current level
     */
    getFallThreshold() {
        return this.levelBounds?.fallThreshold || -10;
    }
}