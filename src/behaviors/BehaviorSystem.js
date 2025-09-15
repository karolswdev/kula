/**
 * BehaviorSystem - Manages declarative behaviors attached to blocks
 * Requirements: ARCH-005 (Behavior System Architecture), PROD-015 (Declarative Behaviors)
 * 
 * This system parses behavior definitions from level data and attaches
 * them to blocks at runtime, enabling dynamic, interactive puzzles.
 */

export class BehaviorSystem {
    constructor(scene, physicsManager) {
        this.scene = scene;
        this.physicsManager = physicsManager;
        
        // Track all active behaviors
        this.behaviors = new Map();
        
        // Track blocks by grid position for quick lookup
        this.blocksByPosition = new Map();
        
        // Counter for unique behavior IDs
        this.behaviorIdCounter = 0;
        
        console.log('BehaviorSystem::constructor - Behavior system initialized');
    }
    
    /**
     * Parse behaviors from level data and attach to blocks
     * Requirement: ARCH-005 - Parse declarative behavior definitions from level data
     * @param {Object} levelData - The complete level data object
     * @param {Map} platforms - Map of platform/block meshes from LevelManager
     */
    parseBehaviors(levelData, platforms) {
        // First, build a map of blocks by their grid positions
        this.buildBlockPositionMap(platforms);
        
        // Check if level has behaviors array
        if (!levelData.behaviors || !Array.isArray(levelData.behaviors)) {
            console.log('BehaviorSystem::parseBehaviors - No behaviors found in level data');
            return;
        }
        
        console.log(`BehaviorSystem::parseBehaviors - Parsing ${levelData.behaviors.length} behaviors`);
        
        // Parse each behavior definition
        levelData.behaviors.forEach((behaviorDef, index) => {
            this.parseSingleBehavior(behaviorDef, index);
        });
        
        console.log(`BehaviorSystem::parseBehaviors - Successfully attached ${this.behaviors.size} behaviors`);
    }
    
    /**
     * Build a map of blocks indexed by their grid position
     * @param {Map} platforms - Map of platform/block meshes
     */
    buildBlockPositionMap(platforms) {
        this.blocksByPosition.clear();
        
        platforms.forEach((mesh, key) => {
            if (mesh.userData && mesh.userData.gridPosition) {
                const pos = mesh.userData.gridPosition;
                const posKey = `${pos[0]},${pos[1]},${pos[2]}`;
                this.blocksByPosition.set(posKey, mesh);
                
                console.log(`BehaviorSystem::buildBlockPositionMap - Mapped block at [${pos[0]},${pos[1]},${pos[2]}] -> ${mesh.name}`);
            }
        });
        
        console.log(`BehaviorSystem::buildBlockPositionMap - Mapped ${this.blocksByPosition.size} blocks by position`);
    }
    
    /**
     * Parse and attach a single behavior to its target block
     * @param {Object} behaviorDef - Behavior definition from level data
     * @param {number} index - Index in behaviors array
     */
    parseSingleBehavior(behaviorDef, index) {
        const { type, target, config } = behaviorDef;
        
        if (!type || !target || !config) {
            console.warn(`BehaviorSystem::parseSingleBehavior - Invalid behavior definition at index ${index}:`, behaviorDef);
            return;
        }
        
        // Find the target block by grid position
        const posKey = `${target[0]},${target[1]},${target[2]}`;
        const targetBlock = this.blocksByPosition.get(posKey);
        
        if (!targetBlock) {
            console.warn(`BehaviorSystem::parseSingleBehavior - No block found at grid position [${target[0]},${target[1]},${target[2]}] for behavior '${type}'`);
            return;
        }
        
        // Log the parsing process (required for TC-9.1)
        console.log(`Parsing behavior '${type}' for target block at [${target[0]},${target[1]},${target[2]}].`);
        
        // Create behavior instance based on type
        const behaviorId = `behavior_${this.behaviorIdCounter++}`;
        const behavior = this.createBehavior(type, targetBlock, config, behaviorId);
        
        if (behavior) {
            // Attach behavior to block
            this.attachBehaviorToBlock(targetBlock, behavior, behaviorId);
            
            // Store behavior for updates
            this.behaviors.set(behaviorId, behavior);
            
            // Log successful attachment (required for TC-9.1)
            console.log(`Behavior attached successfully.`);
        } else {
            console.warn(`BehaviorSystem::parseSingleBehavior - Failed to create behavior of type '${type}'`);
        }
    }
    
    /**
     * Create a behavior instance based on type
     * @param {string} type - Behavior type
     * @param {THREE.Mesh} targetBlock - Target block mesh
     * @param {Object} config - Behavior configuration
     * @param {string} behaviorId - Unique behavior ID
     * @returns {Object} Behavior instance or null
     */
    createBehavior(type, targetBlock, config, behaviorId) {
        switch (type) {
            case 'elevator':
                return this.createElevatorBehavior(targetBlock, config, behaviorId);
            
            case 'timed_disappear':
                return this.createTimedDisappearBehavior(targetBlock, config, behaviorId);
            
            case 'switch':
                return this.createSwitchBehavior(targetBlock, config, behaviorId);
            
            default:
                console.warn(`BehaviorSystem::createBehavior - Unknown behavior type: ${type}`);
                return null;
        }
    }
    
    /**
     * Create an elevator behavior
     * @param {THREE.Mesh} targetBlock - Target block mesh
     * @param {Object} config - Elevator configuration
     * @param {string} behaviorId - Unique behavior ID
     * @returns {Object} Elevator behavior instance
     */
    createElevatorBehavior(targetBlock, config, behaviorId) {
        return {
            id: behaviorId,
            type: 'elevator',
            targetBlock: targetBlock,
            config: config,
            state: {
                isActive: false,
                currentPosition: targetBlock.position.clone(),
                startPosition: new THREE.Vector3(...(config.startPosition || [targetBlock.position.x, targetBlock.position.y, targetBlock.position.z])),
                endPosition: new THREE.Vector3(...(config.endPosition || [targetBlock.position.x, targetBlock.position.y + 10, targetBlock.position.z])),
                speed: config.speed || 2.0,
                returnDelay: config.returnDelay || 3.0,
                delayTimer: 0,
                direction: 1 // 1 = moving to end, -1 = moving to start
            },
            update: function(deltaTime) {
                // Elevator update logic will be implemented in Story 9.2
                // For now, just a placeholder
                if (this.state.isActive) {
                    // Move between start and end positions
                }
            },
            onPlayerContact: function() {
                console.log(`Elevator behavior '${this.id}' triggered by player contact`);
                this.state.isActive = true;
            }
        };
    }
    
    /**
     * Create a timed disappear behavior
     * @param {THREE.Mesh} targetBlock - Target block mesh
     * @param {Object} config - Timed disappear configuration
     * @param {string} behaviorId - Unique behavior ID
     * @returns {Object} Timed disappear behavior instance
     */
    createTimedDisappearBehavior(targetBlock, config, behaviorId) {
        return {
            id: behaviorId,
            type: 'timed_disappear',
            targetBlock: targetBlock,
            config: config,
            state: {
                isVisible: true,
                timer: 0,
                interval: config.interval || 2.0,
                visibleDuration: config.visibleDuration || 1.5,
                invisibleDuration: config.invisibleDuration || 0.5
            },
            update: function(deltaTime) {
                // Timed disappear update logic will be implemented in Story 9.2
                // For now, just a placeholder
                this.state.timer += deltaTime;
                if (this.state.timer >= this.state.interval) {
                    this.state.timer = 0;
                    this.state.isVisible = !this.state.isVisible;
                }
            }
        };
    }
    
    /**
     * Create a switch behavior
     * @param {THREE.Mesh} targetBlock - Target block mesh
     * @param {Object} config - Switch configuration
     * @param {string} behaviorId - Unique behavior ID
     * @returns {Object} Switch behavior instance
     */
    createSwitchBehavior(targetBlock, config, behaviorId) {
        return {
            id: behaviorId,
            type: 'switch',
            targetBlock: targetBlock,
            config: config,
            state: {
                isActivated: false,
                targetBlockPosition: config.targetBlock,
                action: config.action || 'activate',
                visual: config.visual || 'button'
            },
            update: function(deltaTime) {
                // Switch update logic will be implemented in Story 9.2
                // Visual feedback for switch state
            },
            onPlayerContact: function() {
                if (!this.state.isActivated) {
                    console.log(`Switch behavior '${this.id}' activated, triggering action '${this.state.action}' on target at [${this.state.targetBlockPosition}]`);
                    this.state.isActivated = true;
                    // Will trigger the target block's action in Story 9.2
                }
            }
        };
    }
    
    /**
     * Attach a behavior to a block
     * @param {THREE.Mesh} block - Target block mesh
     * @param {Object} behavior - Behavior instance
     * @param {string} behaviorId - Unique behavior ID
     */
    attachBehaviorToBlock(block, behavior, behaviorId) {
        // Store behavior reference on the block
        if (!block.userData.behaviors) {
            block.userData.behaviors = [];
        }
        block.userData.behaviors.push(behaviorId);
        
        // Store reference for collision detection
        block.userData.hasBehavior = true;
        
        console.log(`BehaviorSystem::attachBehaviorToBlock - Attached behavior '${behavior.type}' to block '${block.name}'`);
    }
    
    /**
     * Update all active behaviors
     * Requirement: ARCH-005 - Behavior system integrated into game loop
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Update each active behavior
        this.behaviors.forEach(behavior => {
            if (behavior.update) {
                behavior.update(deltaTime);
            }
        });
    }
    
    /**
     * Check if a block at position has behaviors and trigger them
     * @param {THREE.Vector3} position - Position to check (usually player position)
     * @param {number} radius - Collision radius
     */
    checkBehaviorTriggers(position, radius = 0.5) {
        this.behaviors.forEach(behavior => {
            if (behavior.config.trigger === 'onPlayerContact' && behavior.targetBlock) {
                const distance = position.distanceTo(behavior.targetBlock.position);
                const blockSize = behavior.targetBlock.geometry?.parameters?.width || 4;
                
                if (distance < radius + blockSize / 2) {
                    if (behavior.onPlayerContact && !behavior.state.isTriggered) {
                        behavior.onPlayerContact();
                        behavior.state.isTriggered = true;
                    }
                }
            }
        });
    }
    
    /**
     * Get behavior by ID
     * @param {string} behaviorId - Behavior ID
     * @returns {Object|null} Behavior instance or null
     */
    getBehavior(behaviorId) {
        return this.behaviors.get(behaviorId) || null;
    }
    
    /**
     * Clear all behaviors
     */
    clear() {
        console.log('BehaviorSystem::clear - Clearing all behaviors');
        this.behaviors.clear();
        this.blocksByPosition.clear();
        this.behaviorIdCounter = 0;
    }
}