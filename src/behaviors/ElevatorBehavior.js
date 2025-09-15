/**
 * ElevatorBehavior - Handles platform movement between two positions
 * Requirement: PROD-015 - Declarative Behaviors: Smart Blocks
 * 
 * This behavior allows blocks to move smoothly between a start and end position
 * when triggered by player contact or other conditions.
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class ElevatorBehavior {
    constructor(targetBlock, config, behaviorId, physicsManager) {
        this.id = behaviorId;
        this.type = 'elevator';
        this.targetBlock = targetBlock;
        this.config = config;
        this.physicsManager = physicsManager;
        
        // Parse configuration
        this.state = {
            isActive: false,
            isTriggered: false,
            currentPosition: targetBlock.position.clone(),
            startPosition: new THREE.Vector3(
                ...(config.startPosition || [targetBlock.position.x, targetBlock.position.y, targetBlock.position.z])
            ),
            endPosition: new THREE.Vector3(
                ...(config.endPosition || [targetBlock.position.x, targetBlock.position.y + 10, targetBlock.position.z])
            ),
            speed: config.speed || 2.0,
            returnDelay: config.returnDelay || 3.0,
            autoReturn: config.autoReturn !== false, // Default to true
            delayTimer: 0,
            direction: 1, // 1 = moving to end, -1 = moving to start
            progress: 0 // 0 to 1, representing position between start and end
        };
        
        // Store the physics body reference if it exists
        this.physicsBody = targetBlock.userData.physicsBody || null;
        
        console.log(`ElevatorBehavior::constructor - Created elevator for block '${targetBlock.name}'`);
        console.log(`  Start: ${this.state.startPosition.toArray()}`);
        console.log(`  End: ${this.state.endPosition.toArray()}`);
        console.log(`  Speed: ${this.state.speed}, Trigger: ${config.trigger}`);
    }
    
    /**
     * Update the elevator behavior each frame
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (!this.state.isActive) return;
        
        // Handle return delay if at end position
        if (this.state.autoReturn && this.state.progress >= 1 && this.state.direction === 1) {
            this.state.delayTimer += deltaTime;
            if (this.state.delayTimer >= this.state.returnDelay) {
                this.state.direction = -1; // Start moving back
                this.state.delayTimer = 0;
            }
            return;
        }
        
        // Calculate movement
        const moveDistance = (this.state.speed * deltaTime) / this.state.startPosition.distanceTo(this.state.endPosition);
        
        // Update progress based on direction
        this.state.progress += moveDistance * this.state.direction;
        this.state.progress = Math.max(0, Math.min(1, this.state.progress));
        
        // Lerp between start and end positions
        const newPosition = new THREE.Vector3().lerpVectors(
            this.state.startPosition,
            this.state.endPosition,
            this.state.progress
        );
        
        // Update mesh position
        this.targetBlock.position.copy(newPosition);
        this.state.currentPosition.copy(newPosition);
        
        // Update physics body position if it exists
        if (this.physicsBody) {
            this.physicsBody.position.set(newPosition.x, newPosition.y, newPosition.z);
            // Wake up the physics body to ensure proper collision detection
            this.physicsBody.wakeUp();
        }
        
        // Check if reached destination
        if (this.state.progress <= 0 && this.state.direction === -1) {
            // Reached start position
            if (!this.config.loop) {
                this.state.isActive = false;
                this.state.isTriggered = false; // Allow re-triggering
            } else {
                this.state.direction = 1; // Loop back to end
            }
        } else if (this.state.progress >= 1 && this.state.direction === 1 && !this.state.autoReturn) {
            // Reached end position and not auto-returning
            if (this.config.loop) {
                this.state.direction = -1; // Loop back to start
            } else {
                this.state.isActive = false;
            }
        }
    }
    
    /**
     * Trigger the elevator when player makes contact
     */
    onPlayerContact() {
        if (!this.state.isTriggered || this.config.retriggerable) {
            console.log(`ElevatorBehavior '${this.id}' triggered by player contact`);
            this.state.isActive = true;
            this.state.isTriggered = true;
            this.state.direction = 1; // Always start moving toward end
            this.state.delayTimer = 0;
        }
    }
    
    /**
     * Reset the elevator to its start position
     */
    reset() {
        this.state.isActive = false;
        this.state.isTriggered = false;
        this.state.progress = 0;
        this.state.direction = 1;
        this.state.delayTimer = 0;
        
        // Reset positions
        this.targetBlock.position.copy(this.state.startPosition);
        this.state.currentPosition.copy(this.state.startPosition);
        
        if (this.physicsBody) {
            this.physicsBody.position.set(
                this.state.startPosition.x,
                this.state.startPosition.y,
                this.state.startPosition.z
            );
        }
    }
    
    /**
     * Activate the elevator programmatically (e.g., from a switch)
     */
    activate() {
        console.log(`ElevatorBehavior '${this.id}' activated programmatically`);
        this.state.isActive = true;
        this.state.isTriggered = true;
        this.state.direction = 1;
        this.state.delayTimer = 0;
    }
}