/**
 * SwitchBehavior - Triggers actions on other blocks when activated
 * Requirement: PROD-015 - Declarative Behaviors: Smart Blocks
 * 
 * This behavior detects player contact and sends activation signals to
 * target blocks identified by their grid coordinates.
 */

import * as THREE from 'three';

export class SwitchBehavior {
    constructor(targetBlock, config, behaviorId, behaviorSystem) {
        this.id = behaviorId;
        this.type = 'switch';
        this.targetBlock = targetBlock;
        this.config = config;
        this.behaviorSystem = behaviorSystem;
        
        // Parse configuration
        this.state = {
            isActivated: false,
            targetBlockPosition: config.targetBlock || null, // Grid coordinates [x, y, z]
            action: config.action || 'activate', // Action to perform on target
            visual: config.visual || 'button', // Visual style: button, lever, pressure_plate
            oneTime: config.oneTime !== false, // Default to one-time use
            resetTime: config.resetTime || 0, // Time before switch can be used again (0 = no reset)
            resetTimer: 0,
            activationCount: 0
        };
        
        // Visual feedback properties
        this.originalPosition = targetBlock.position.clone();
        this.originalMaterial = targetBlock.material;
        this.activeMaterial = null;
        
        // Create active material for visual feedback
        if (this.originalMaterial) {
            this.activeMaterial = this.originalMaterial.clone();
            this.activeMaterial.emissive = new THREE.Color(0x00ff00);
            this.activeMaterial.emissiveIntensity = 0.5;
        }
        
        console.log(`SwitchBehavior::constructor - Created switch for block '${targetBlock.name}'`);
        console.log(`  Target: [${this.state.targetBlockPosition}]`);
        console.log(`  Action: ${this.state.action}`);
        console.log(`  One-time: ${this.state.oneTime}`);
    }
    
    /**
     * Update the switch behavior each frame
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Handle reset timer if applicable
        if (this.state.resetTime > 0 && this.state.isActivated && !this.state.oneTime) {
            this.state.resetTimer += deltaTime;
            
            if (this.state.resetTimer >= this.state.resetTime) {
                this.reset();
            }
        }
        
        // Visual feedback based on state
        this.updateVisual();
    }
    
    /**
     * Trigger the switch when player makes contact
     */
    onPlayerContact() {
        // Check if switch can be activated
        if (this.state.oneTime && this.state.isActivated) {
            return; // Already used and is one-time only
        }
        
        if (this.state.isActivated && this.state.resetTime === 0) {
            return; // Already activated with no reset
        }
        
        // Activate the switch
        this.activate();
    }
    
    /**
     * Activate the switch and trigger target actions
     */
    activate() {
        console.log(`SwitchBehavior '${this.id}' activated`);
        
        this.state.isActivated = true;
        this.state.activationCount++;
        this.state.resetTimer = 0;
        
        // Apply visual feedback
        this.applyActiveVisual();
        
        // Find and activate target block
        if (this.state.targetBlockPosition) {
            this.triggerTarget();
        }
        
        // Log activation
        console.log(`  Activation #${this.state.activationCount}`);
        console.log(`  Triggering action '${this.state.action}' on target at [${this.state.targetBlockPosition}]`);
    }
    
    /**
     * Trigger the action on the target block
     */
    triggerTarget() {
        if (!this.behaviorSystem) {
            console.warn(`SwitchBehavior '${this.id}' - No behavior system reference`);
            return;
        }
        
        // Convert target position to string key
        const targetKey = `${this.state.targetBlockPosition[0]},${this.state.targetBlockPosition[1]},${this.state.targetBlockPosition[2]}`;
        
        // Find the target block
        const targetBlockMesh = this.behaviorSystem.blocksByPosition.get(targetKey);
        
        if (!targetBlockMesh) {
            console.warn(`SwitchBehavior '${this.id}' - No block found at position [${this.state.targetBlockPosition}]`);
            return;
        }
        
        // Find behaviors attached to the target block
        if (targetBlockMesh.userData.behaviors) {
            targetBlockMesh.userData.behaviors.forEach(behaviorId => {
                const behavior = this.behaviorSystem.getBehavior(behaviorId);
                if (behavior) {
                    // Call the appropriate action on the behavior
                    this.executeAction(behavior, this.state.action);
                }
            });
        } else {
            console.warn(`SwitchBehavior '${this.id}' - Target block has no behaviors`);
        }
    }
    
    /**
     * Execute an action on a target behavior
     * @param {Object} behavior - Target behavior instance
     * @param {string} action - Action to execute
     */
    executeAction(behavior, action) {
        console.log(`SwitchBehavior '${this.id}' - Executing '${action}' on behavior '${behavior.id}' (${behavior.type})`);
        
        switch (action) {
            case 'activate':
                if (behavior.activate) {
                    behavior.activate();
                } else if (behavior.onPlayerContact) {
                    // Fallback to onPlayerContact if no activate method
                    behavior.onPlayerContact();
                }
                break;
                
            case 'deactivate':
                if (behavior.deactivate) {
                    behavior.deactivate();
                }
                break;
                
            case 'toggle':
                if (behavior.toggle) {
                    behavior.toggle();
                } else if (behavior.state) {
                    // Generic toggle for behaviors with isActive state
                    behavior.state.isActive = !behavior.state.isActive;
                }
                break;
                
            case 'reset':
                if (behavior.reset) {
                    behavior.reset();
                }
                break;
                
            default:
                console.warn(`SwitchBehavior '${this.id}' - Unknown action '${action}'`);
        }
    }
    
    /**
     * Apply visual feedback when activated
     */
    applyActiveVisual() {
        if (this.activeMaterial) {
            this.targetBlock.material = this.activeMaterial;
        }
        
        // Apply physical movement based on visual type
        switch (this.state.visual) {
            case 'button':
                // Push button in slightly
                this.targetBlock.position.y = this.originalPosition.y - 0.1;
                break;
                
            case 'pressure_plate':
                // Depress plate
                this.targetBlock.position.y = this.originalPosition.y - 0.05;
                break;
                
            case 'lever':
                // Rotate lever
                this.targetBlock.rotation.z = Math.PI / 4;
                break;
        }
    }
    
    /**
     * Update visual feedback based on current state
     */
    updateVisual() {
        if (!this.state.isActivated && this.targetBlock.material !== this.originalMaterial) {
            // Reset visual if no longer activated
            this.targetBlock.material = this.originalMaterial;
            this.targetBlock.position.copy(this.originalPosition);
            this.targetBlock.rotation.z = 0;
        }
    }
    
    /**
     * Reset the switch to inactive state
     */
    reset() {
        console.log(`SwitchBehavior '${this.id}' - Resetting`);
        
        this.state.isActivated = false;
        this.state.resetTimer = 0;
        
        // Reset visual
        this.targetBlock.material = this.originalMaterial;
        this.targetBlock.position.copy(this.originalPosition);
        this.targetBlock.rotation.z = 0;
    }
    
    /**
     * Force deactivation of the switch
     */
    deactivate() {
        this.reset();
    }
}