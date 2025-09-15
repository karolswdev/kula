/**
 * TargetBehavior - Responds to activation signals from switches
 * Requirement: PROD-015 - Declarative Behaviors: Smart Blocks
 * 
 * This behavior allows blocks to perform actions when activated by
 * switches or other triggers.
 */

import * as THREE from 'three';

export class TargetBehavior {
    constructor(targetBlock, config, behaviorId, physicsManager) {
        this.id = behaviorId;
        this.type = 'target';
        this.targetBlock = targetBlock;
        this.config = config;
        this.physicsManager = physicsManager;
        
        // Parse configuration
        this.state = {
            isActive: false,
            actionType: config.actionType || 'move', // move, disappear, rotate, scale
            moveTarget: config.moveTarget ? new THREE.Vector3(...config.moveTarget) : null,
            moveSpeed: config.moveSpeed || 2.0,
            rotateSpeed: config.rotateSpeed || Math.PI / 2, // radians per second
            rotateAxis: config.rotateAxis || 'y',
            scaleTarget: config.scaleTarget || 0,
            scaleSpeed: config.scaleSpeed || 1.0,
            toggleable: config.toggleable !== false, // Can be toggled on/off
            autoReset: config.autoReset || 0, // Time to auto-reset (0 = no auto-reset)
            autoResetTimer: 0,
            currentProgress: 0, // 0 to 1 for animations
            originalState: {
                position: targetBlock.position.clone(),
                rotation: targetBlock.rotation.clone(),
                scale: targetBlock.scale.clone(),
                visible: targetBlock.visible
            }
        };
        
        // Store the physics body reference if it exists
        this.physicsBody = targetBlock.userData.physicsBody || null;
        
        console.log(`TargetBehavior::constructor - Created target for block '${targetBlock.name}'`);
        console.log(`  Action type: ${this.state.actionType}`);
        console.log(`  Toggleable: ${this.state.toggleable}`);
    }
    
    /**
     * Update the target behavior each frame
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Handle auto-reset timer
        if (this.state.autoReset > 0 && this.state.isActive) {
            this.state.autoResetTimer += deltaTime;
            if (this.state.autoResetTimer >= this.state.autoReset) {
                this.deactivate();
                return;
            }
        }
        
        // Perform action based on type
        if (this.state.isActive) {
            switch (this.state.actionType) {
                case 'move':
                    this.updateMove(deltaTime);
                    break;
                case 'rotate':
                    this.updateRotate(deltaTime);
                    break;
                case 'scale':
                    this.updateScale(deltaTime);
                    break;
                case 'disappear':
                    // Disappear is instant, handled in activate/deactivate
                    break;
            }
        } else if (this.state.currentProgress > 0 && this.state.toggleable) {
            // Reverse animations when deactivated
            switch (this.state.actionType) {
                case 'move':
                    this.updateMove(-deltaTime);
                    break;
                case 'rotate':
                    this.updateRotate(-deltaTime);
                    break;
                case 'scale':
                    this.updateScale(-deltaTime);
                    break;
            }
        }
    }
    
    /**
     * Update movement animation
     * @param {number} deltaTime - Time since last frame (can be negative for reverse)
     */
    updateMove(deltaTime) {
        if (!this.state.moveTarget) return;
        
        const distance = this.state.originalState.position.distanceTo(this.state.moveTarget);
        if (distance === 0) return;
        
        const moveAmount = (this.state.moveSpeed * Math.abs(deltaTime)) / distance;
        
        // Update progress
        if (deltaTime > 0) {
            this.state.currentProgress = Math.min(1, this.state.currentProgress + moveAmount);
        } else {
            this.state.currentProgress = Math.max(0, this.state.currentProgress - moveAmount);
        }
        
        // Lerp position
        const newPosition = new THREE.Vector3().lerpVectors(
            this.state.originalState.position,
            this.state.moveTarget,
            this.state.currentProgress
        );
        
        this.targetBlock.position.copy(newPosition);
        
        // Update physics body if it exists
        if (this.physicsBody) {
            this.physicsBody.position.set(newPosition.x, newPosition.y, newPosition.z);
            this.physicsBody.wakeUp();
        }
    }
    
    /**
     * Update rotation animation
     * @param {number} deltaTime - Time since last frame
     */
    updateRotate(deltaTime) {
        const rotateAmount = this.state.rotateSpeed * deltaTime;
        
        switch (this.state.rotateAxis) {
            case 'x':
                this.targetBlock.rotation.x += rotateAmount;
                break;
            case 'y':
                this.targetBlock.rotation.y += rotateAmount;
                break;
            case 'z':
                this.targetBlock.rotation.z += rotateAmount;
                break;
        }
        
        // Update physics body rotation if needed
        if (this.physicsBody) {
            // Convert THREE.js rotation to Cannon quaternion
            const quaternion = new THREE.Quaternion();
            quaternion.setFromEuler(this.targetBlock.rotation);
            this.physicsBody.quaternion.set(
                quaternion.x,
                quaternion.y,
                quaternion.z,
                quaternion.w
            );
            this.physicsBody.wakeUp();
        }
    }
    
    /**
     * Update scale animation
     * @param {number} deltaTime - Time since last frame
     */
    updateScale(deltaTime) {
        const scaleAmount = this.state.scaleSpeed * Math.abs(deltaTime);
        
        if (deltaTime > 0) {
            this.state.currentProgress = Math.min(1, this.state.currentProgress + scaleAmount);
        } else {
            this.state.currentProgress = Math.max(0, this.state.currentProgress - scaleAmount);
        }
        
        // Lerp scale
        const targetScale = this.state.scaleTarget;
        const newScale = this.state.originalState.scale.x * (1 - this.state.currentProgress) + 
                        targetScale * this.state.currentProgress;
        
        this.targetBlock.scale.set(newScale, newScale, newScale);
        
        // Note: Scaling physics bodies is complex and not directly supported
        // Would need to recreate the physics body with new dimensions
    }
    
    /**
     * Activate the target behavior
     */
    activate() {
        console.log(`TargetBehavior '${this.id}' - Activated (${this.state.actionType})`);
        
        if (this.state.toggleable && this.state.isActive) {
            // Toggle off if already active
            this.deactivate();
            return;
        }
        
        this.state.isActive = true;
        this.state.autoResetTimer = 0;
        
        // Handle instant actions
        if (this.state.actionType === 'disappear') {
            this.targetBlock.visible = false;
            if (this.physicsBody) {
                this.physicsBody.collisionResponse = false;
            }
        }
    }
    
    /**
     * Deactivate the target behavior
     */
    deactivate() {
        console.log(`TargetBehavior '${this.id}' - Deactivated`);
        
        this.state.isActive = false;
        this.state.autoResetTimer = 0;
        
        // Handle instant actions
        if (this.state.actionType === 'disappear') {
            this.targetBlock.visible = true;
            if (this.physicsBody) {
                this.physicsBody.collisionResponse = true;
            }
        }
    }
    
    /**
     * Toggle the target behavior on/off
     */
    toggle() {
        if (this.state.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    }
    
    /**
     * Reset the target to its original state
     */
    reset() {
        console.log(`TargetBehavior '${this.id}' - Reset to original state`);
        
        this.state.isActive = false;
        this.state.currentProgress = 0;
        this.state.autoResetTimer = 0;
        
        // Restore original state
        this.targetBlock.position.copy(this.state.originalState.position);
        this.targetBlock.rotation.copy(this.state.originalState.rotation);
        this.targetBlock.scale.copy(this.state.originalState.scale);
        this.targetBlock.visible = this.state.originalState.visible;
        
        // Update physics body
        if (this.physicsBody) {
            this.physicsBody.position.set(
                this.state.originalState.position.x,
                this.state.originalState.position.y,
                this.state.originalState.position.z
            );
            this.physicsBody.collisionResponse = this.state.originalState.visible;
            this.physicsBody.wakeUp();
        }
    }
}