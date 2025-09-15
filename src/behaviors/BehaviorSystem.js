/**
 * BehaviorSystem - Manages declarative behaviors attached to blocks
 * Requirements: ARCH-005 (Behavior System Architecture), PROD-015 (Declarative Behaviors)
 * 
 * This system parses behavior definitions from level data and attaches
 * them to blocks at runtime, enabling dynamic, interactive puzzles.
 */

import { ElevatorBehavior } from './ElevatorBehavior.js';
import { TimedDisappearBehavior } from './TimedDisappearBehavior.js';
import { SwitchBehavior } from './SwitchBehavior.js';
import { TargetBehavior } from './TargetBehavior.js';
import * as THREE from 'three';

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
     * @param {Array} physicsBodies - Array of physics bodies corresponding to platforms
     */
    parseBehaviors(levelData, platforms, physicsBodies = []) {
        // First, build a map of blocks by their grid positions
        this.buildBlockPositionMap(platforms, physicsBodies);
        
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
     * @param {Array} physicsBodies - Array of physics bodies
     */
    buildBlockPositionMap(platforms, physicsBodies) {
        this.blocksByPosition.clear();
        
        // Create a map to associate meshes with physics bodies by position
        const physicsBodyMap = new Map();
        physicsBodies.forEach(body => {
            if (body && body.position) {
                // Round position to nearest grid unit (4.0 units)
                const gridX = Math.round(body.position.x / 4.0);
                const gridY = Math.round(body.position.y / 4.0);
                const gridZ = Math.round(body.position.z / 4.0);
                const posKey = `${gridX},${gridY},${gridZ}`;
                physicsBodyMap.set(posKey, body);
            }
        });
        
        platforms.forEach((mesh, key) => {
            if (mesh.userData && mesh.userData.gridPosition) {
                const pos = mesh.userData.gridPosition;
                const posKey = `${pos[0]},${pos[1]},${pos[2]}`;
                this.blocksByPosition.set(posKey, mesh);
                
                // Try to find and attach the corresponding physics body
                const physicsBody = physicsBodyMap.get(posKey);
                if (physicsBody) {
                    mesh.userData.physicsBody = physicsBody;
                    console.log(`BehaviorSystem::buildBlockPositionMap - Linked physics body to block at [${pos[0]},${pos[1]},${pos[2]}]`);
                }
                
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
                return new ElevatorBehavior(targetBlock, config, behaviorId, this.physicsManager);
            
            case 'timed_disappear':
                return new TimedDisappearBehavior(targetBlock, config, behaviorId, this.physicsManager);
            
            case 'switch':
                return new SwitchBehavior(targetBlock, config, behaviorId, this);
            
            case 'target':
                return new TargetBehavior(targetBlock, config, behaviorId, this.physicsManager);
            
            default:
                console.warn(`BehaviorSystem::createBehavior - Unknown behavior type: ${type}`);
                return null;
        }
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
            if (behavior.config && behavior.config.trigger === 'onPlayerContact' && behavior.targetBlock) {
                const distance = position.distanceTo(behavior.targetBlock.position);
                const blockSize = behavior.targetBlock.geometry?.parameters?.width || 4;
                
                // Check if player is close enough to trigger
                if (distance < radius + blockSize / 2) {
                    // Check if player is on top of the block (for elevators)
                    const yDiff = position.y - behavior.targetBlock.position.y;
                    const isOnTop = yDiff > 0 && yDiff < 3; // Within reasonable range above block
                    
                    if (behavior.onPlayerContact) {
                        // Different trigger conditions for different behaviors
                        if (behavior.type === 'elevator' && isOnTop) {
                            behavior.onPlayerContact();
                        } else if (behavior.type === 'switch') {
                            behavior.onPlayerContact();
                        }
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