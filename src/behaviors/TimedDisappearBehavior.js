/**
 * TimedDisappearBehavior - Makes blocks cyclically appear and disappear
 * Requirement: PROD-015 - Declarative Behaviors: Smart Blocks
 * 
 * This behavior toggles both the visibility of a block's mesh and its physics
 * collision response on a timed interval, creating disappearing platforms.
 */

import * as THREE from 'three';

export class TimedDisappearBehavior {
    constructor(targetBlock, config, behaviorId, physicsManager) {
        this.id = behaviorId;
        this.type = 'timed_disappear';
        this.targetBlock = targetBlock;
        this.config = config;
        this.physicsManager = physicsManager;
        
        // Parse configuration with defaults
        this.state = {
            isVisible: config.startVisible !== false, // Default to visible
            timer: 0,
            interval: config.interval || 2.0, // Total cycle time in seconds
            visibleDuration: config.visibleDuration || null, // If null, use interval/2
            invisibleDuration: config.invisibleDuration || null, // If null, use interval/2
            phaseTimer: 0, // Timer for current phase (visible or invisible)
            fadeSpeed: config.fadeSpeed || 0, // 0 = instant, >0 = fade duration
            currentOpacity: 1.0,
            warningTime: config.warningTime || 0.5, // Time to show warning before disappearing
            isWarning: false
        };
        
        // Calculate phase durations if not specified
        if (this.state.visibleDuration === null && this.state.invisibleDuration === null) {
            // Split interval equally
            this.state.visibleDuration = this.state.interval / 2;
            this.state.invisibleDuration = this.state.interval / 2;
        } else if (this.state.visibleDuration === null) {
            this.state.visibleDuration = this.state.interval - this.state.invisibleDuration;
        } else if (this.state.invisibleDuration === null) {
            this.state.invisibleDuration = this.state.interval - this.state.visibleDuration;
        }
        
        // Store the physics body reference if it exists
        this.physicsBody = targetBlock.userData.physicsBody || null;
        
        // Store original material for warning effects
        this.originalMaterial = targetBlock.material;
        this.warningMaterial = null;
        
        // Create warning material if warning time is set
        if (this.state.warningTime > 0 && this.originalMaterial) {
            this.warningMaterial = this.originalMaterial.clone();
            this.warningMaterial.emissive = new THREE.Color(0xff0000);
            this.warningMaterial.emissiveIntensity = 0.3;
        }
        
        // Apply initial state
        this.applyVisibilityState(this.state.isVisible);
        
        console.log(`TimedDisappearBehavior::constructor - Created for block '${targetBlock.name}'`);
        console.log(`  Interval: ${this.state.interval}s (${this.state.visibleDuration}s visible, ${this.state.invisibleDuration}s invisible)`);
        console.log(`  Warning time: ${this.state.warningTime}s`);
    }
    
    /**
     * Update the timed disappear behavior each frame
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Update phase timer
        this.state.phaseTimer += deltaTime;
        
        if (this.state.isVisible) {
            // Currently visible phase
            const timeUntilDisappear = this.state.visibleDuration - this.state.phaseTimer;
            
            // Check for warning phase
            if (this.state.warningTime > 0 && timeUntilDisappear <= this.state.warningTime && !this.state.isWarning) {
                this.state.isWarning = true;
                this.startWarning();
            }
            
            // Check if should transition to invisible
            if (this.state.phaseTimer >= this.state.visibleDuration) {
                this.state.isVisible = false;
                this.state.phaseTimer = 0;
                this.state.isWarning = false;
                this.stopWarning();
                this.applyVisibilityState(false);
                console.log(`TimedDisappearBehavior '${this.id}' - Block disappeared`);
            }
        } else {
            // Currently invisible phase
            if (this.state.phaseTimer >= this.state.invisibleDuration) {
                this.state.isVisible = true;
                this.state.phaseTimer = 0;
                this.applyVisibilityState(true);
                console.log(`TimedDisappearBehavior '${this.id}' - Block reappeared`);
            }
        }
        
        // Handle fade effects if enabled
        if (this.state.fadeSpeed > 0) {
            this.updateFade(deltaTime);
        }
    }
    
    /**
     * Apply visibility state to both mesh and physics body
     * @param {boolean} visible - Whether the block should be visible
     */
    applyVisibilityState(visible) {
        // Toggle mesh visibility
        this.targetBlock.visible = visible;
        
        // Toggle physics collision
        if (this.physicsBody) {
            if (visible) {
                // Re-enable collisions
                this.physicsBody.collisionResponse = true;
                this.physicsBody.type = 2; // STATIC type
            } else {
                // Disable collisions
                this.physicsBody.collisionResponse = false;
                // We could also remove from world, but disabling collision response is cleaner
            }
            // Wake up the physics world to ensure changes are applied
            this.physicsBody.wakeUp();
        }
        
        // Reset opacity for fade effect
        if (this.state.fadeSpeed > 0) {
            this.state.currentOpacity = visible ? 1.0 : 0.0;
            this.updateMaterialOpacity();
        }
    }
    
    /**
     * Start warning effect before disappearing
     */
    startWarning() {
        if (this.warningMaterial && this.targetBlock.material) {
            // Flash the material
            this.flashWarning();
        }
    }
    
    /**
     * Flash warning effect
     */
    flashWarning() {
        if (!this.state.isWarning) return;
        
        // Alternate between normal and warning material
        const flashRate = 0.2; // Flash every 200ms
        const flashPhase = Math.floor(this.state.phaseTimer / flashRate) % 2;
        
        if (flashPhase === 0) {
            this.targetBlock.material = this.warningMaterial;
        } else {
            this.targetBlock.material = this.originalMaterial;
        }
        
        // Schedule next flash
        if (this.state.isWarning) {
            setTimeout(() => this.flashWarning(), flashRate * 1000);
        }
    }
    
    /**
     * Stop warning effect
     */
    stopWarning() {
        this.targetBlock.material = this.originalMaterial;
    }
    
    /**
     * Update fade effect
     * @param {number} deltaTime - Time since last frame
     */
    updateFade(deltaTime) {
        const targetOpacity = this.state.isVisible ? 1.0 : 0.0;
        const fadeRate = 1.0 / this.state.fadeSpeed;
        
        if (this.state.currentOpacity !== targetOpacity) {
            const delta = fadeRate * deltaTime;
            if (targetOpacity > this.state.currentOpacity) {
                this.state.currentOpacity = Math.min(targetOpacity, this.state.currentOpacity + delta);
            } else {
                this.state.currentOpacity = Math.max(targetOpacity, this.state.currentOpacity - delta);
            }
            
            this.updateMaterialOpacity();
        }
    }
    
    /**
     * Update material opacity for fade effect
     */
    updateMaterialOpacity() {
        if (this.targetBlock.material) {
            this.targetBlock.material.opacity = this.state.currentOpacity;
            this.targetBlock.material.transparent = this.state.currentOpacity < 1.0;
        }
    }
    
    /**
     * Reset the behavior to initial state
     */
    reset() {
        this.state.isVisible = this.config.startVisible !== false;
        this.state.phaseTimer = 0;
        this.state.isWarning = false;
        this.stopWarning();
        this.applyVisibilityState(this.state.isVisible);
    }
}