/**
 * MovingPlatform entity class - creates dynamic moving platforms
 * Requirement: PROD-011 - Level Structure: Modular Blocks
 */

import * as CANNON from 'cannon-es';

export class MovingPlatform {
    /**
     * Create a new moving platform
     * @param {Object} config - Platform configuration
     * @param {Object} config.position - Starting position {x, y, z}
     * @param {Object} config.size - Platform dimensions {width, height, depth}
     * @param {number} config.color - Platform color (hex)
     * @param {Object} config.movement - Movement configuration
     * @param {string} config.id - Platform identifier
     */
    constructor(config) {
        this.id = config.id || 'moving_platform';
        this.startPosition = new THREE.Vector3(
            config.position.x || 0,
            config.position.y || 0,
            config.position.z || 0
        );
        this.size = {
            width: config.size?.width || 3,
            height: config.size?.height || 1,
            depth: config.size?.depth || 3
        };
        this.color = config.color || 0x4080FF;
        
        // Movement configuration
        this.movement = {
            type: config.movement?.type || 'linear',
            waypoints: [],
            speed: config.movement?.speed || 2,
            pauseTime: config.movement?.pauseTime || 1,
            currentWaypoint: 0,
            direction: 1,
            pauseTimer: 0,
            isPaused: false,
            progress: 0
        };
        
        // Parse waypoints
        if (config.movement?.waypoints) {
            this.movement.waypoints = config.movement.waypoints.map(wp => 
                new THREE.Vector3(wp[0] || wp.x || 0, wp[1] || wp.y || 0, wp[2] || wp.z || 0)
            );
        } else {
            // Default movement: back and forth along X axis
            this.movement.waypoints = [
                this.startPosition.clone(),
                this.startPosition.clone().add(new THREE.Vector3(5, 0, 0))
            ];
        }
        
        // Visual and physics
        this.mesh = null;
        this.physicsBody = null;
        this.currentPosition = this.startPosition.clone();
        this.previousPosition = this.startPosition.clone();
        this.velocity = new THREE.Vector3();
        
        // Player tracking for sticky movement
        this.playerOnPlatform = false;
        this.playerBody = null;
        
        this.createVisualMesh();
    }
    
    /**
     * Create the visual representation of the platform
     * Requirement: NFR-003 - Visual Identity
     */
    createVisualMesh() {
        // Create platform geometry
        const geometry = new THREE.BoxGeometry(
            this.size.width,
            this.size.height,
            this.size.depth
        );
        
        // Create material with slight transparency to distinguish from static platforms
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            metalness: 0.3,
            roughness: 0.5,
            emissive: this.color,
            emissiveIntensity: 0.1
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.currentPosition);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.name = this.id;
        
        // Store reference to this entity
        this.mesh.userData = {
            type: 'movingPlatform',
            entity: this,
            isMoving: true
        };
        
        // Add visual indicators (arrows or lines showing path)
        this.createPathIndicators();
    }
    
    /**
     * Create visual indicators showing the platform's path
     */
    createPathIndicators() {
        if (this.movement.waypoints.length < 2) return;
        
        // Create a line showing the path
        const points = this.movement.waypoints;
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: this.color,
            opacity: 0.3,
            transparent: true
        });
        
        this.pathLine = new THREE.Line(geometry, material);
        this.pathLine.name = `${this.id}_path`;
    }
    
    /**
     * Add platform to the scene
     * @param {THREE.Scene} scene - The scene to add to
     */
    addToScene(scene) {
        if (this.mesh) {
            scene.add(this.mesh);
        }
        if (this.pathLine) {
            scene.add(this.pathLine);
        }
    }
    
    /**
     * Create physics body for the platform
     * @param {CANNON.World} physicsWorld - The physics world
     */
    createPhysicsBody(physicsWorld) {
        // Create box shape
        const shape = new CANNON.Box(new CANNON.Vec3(
            this.size.width / 2,
            this.size.height / 2,
            this.size.depth / 2
        ));
        
        // Create kinematic body (controlled by code, not physics)
        this.physicsBody = new CANNON.Body({
            mass: 0, // Kinematic body
            shape: shape,
            position: new CANNON.Vec3(
                this.currentPosition.x,
                this.currentPosition.y,
                this.currentPosition.z
            ),
            type: CANNON.Body.KINEMATIC
        });
        
        // Set collision properties
        this.physicsBody.collisionFilterGroup = 2; // Platform group
        this.physicsBody.collisionFilterMask = 1 | 4; // Collide with player and hazards
        
        // Store reference
        this.physicsBody.userData = {
            type: 'movingPlatform',
            entity: this
        };
        
        physicsWorld.addBody(this.physicsBody);
    }
    
    /**
     * Update platform movement
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     */
    update(deltaTime, elapsedTime) {
        if (this.movement.waypoints.length < 2) return;
        
        // Store previous position for velocity calculation
        this.previousPosition.copy(this.currentPosition);
        
        // Handle pause at waypoints
        if (this.movement.isPaused) {
            this.movement.pauseTimer -= deltaTime;
            if (this.movement.pauseTimer <= 0) {
                this.movement.isPaused = false;
                this.nextWaypoint();
            }
            return;
        }
        
        // Get current and target waypoints
        const currentWP = this.movement.waypoints[this.movement.currentWaypoint];
        const nextIndex = (this.movement.currentWaypoint + this.movement.direction + 
                          this.movement.waypoints.length) % this.movement.waypoints.length;
        const targetWP = this.movement.waypoints[nextIndex];
        
        // Move based on movement type
        if (this.movement.type === 'linear') {
            this.updateLinearMovement(currentWP, targetWP, deltaTime);
        } else if (this.movement.type === 'circular') {
            this.updateCircularMovement(elapsedTime);
        } else if (this.movement.type === 'sine') {
            this.updateSineMovement(elapsedTime);
        }
        
        // Calculate velocity for player movement
        this.velocity.subVectors(this.currentPosition, this.previousPosition);
        this.velocity.divideScalar(deltaTime);
        
        // Update mesh position
        if (this.mesh) {
            this.mesh.position.copy(this.currentPosition);
        }
        
        // Update physics body position
        if (this.physicsBody) {
            this.physicsBody.position.set(
                this.currentPosition.x,
                this.currentPosition.y,
                this.currentPosition.z
            );
            
            // Set velocity for proper collision response
            this.physicsBody.velocity.set(
                this.velocity.x,
                this.velocity.y,
                this.velocity.z
            );
        }
    }
    
    /**
     * Update linear movement between waypoints
     */
    updateLinearMovement(currentWP, targetWP, deltaTime) {
        // Calculate direction to target
        const direction = new THREE.Vector3().subVectors(targetWP, currentWP);
        const distance = direction.length();
        direction.normalize();
        
        // Move towards target
        const moveDistance = this.movement.speed * deltaTime;
        this.movement.progress += moveDistance / distance;
        
        if (this.movement.progress >= 1) {
            // Reached waypoint
            this.currentPosition.copy(targetWP);
            this.movement.progress = 0;
            
            // Pause at waypoint if configured
            if (this.movement.pauseTime > 0) {
                this.movement.isPaused = true;
                this.movement.pauseTimer = this.movement.pauseTime;
            } else {
                this.nextWaypoint();
            }
        } else {
            // Interpolate position
            this.currentPosition.lerpVectors(currentWP, targetWP, this.movement.progress);
        }
    }
    
    /**
     * Update circular movement pattern
     */
    updateCircularMovement(elapsedTime) {
        const radius = 5;
        const angle = elapsedTime * this.movement.speed;
        
        this.currentPosition.x = this.startPosition.x + Math.cos(angle) * radius;
        this.currentPosition.z = this.startPosition.z + Math.sin(angle) * radius;
        this.currentPosition.y = this.startPosition.y;
    }
    
    /**
     * Update sine wave movement pattern
     */
    updateSineMovement(elapsedTime) {
        const amplitude = 3;
        const frequency = this.movement.speed;
        
        // Move along X axis with sine wave on Y
        this.currentPosition.x = this.startPosition.x + elapsedTime * this.movement.speed;
        this.currentPosition.y = this.startPosition.y + Math.sin(elapsedTime * frequency) * amplitude;
        this.currentPosition.z = this.startPosition.z;
        
        // Wrap around after certain distance
        if (this.currentPosition.x > this.startPosition.x + 10) {
            this.currentPosition.x = this.startPosition.x - 10;
        }
    }
    
    /**
     * Move to next waypoint
     */
    nextWaypoint() {
        if (this.movement.type === 'linear') {
            // Check if we're at the end of the path
            if (this.movement.direction > 0 && 
                this.movement.currentWaypoint >= this.movement.waypoints.length - 2) {
                // Reverse direction
                this.movement.direction = -1;
            } else if (this.movement.direction < 0 && 
                       this.movement.currentWaypoint <= 0) {
                // Reverse direction
                this.movement.direction = 1;
            } else {
                // Continue in current direction
                this.movement.currentWaypoint += this.movement.direction;
            }
        }
    }
    
    /**
     * Get platform velocity for player movement
     * @returns {THREE.Vector3} Current platform velocity
     */
    getPlatformVelocity() {
        return this.velocity.clone();
    }
    
    /**
     * Check if a position is on the platform
     * @param {THREE.Vector3} position - Position to check
     * @param {number} margin - Margin for detection
     * @returns {boolean} True if position is on platform
     */
    isPositionOnPlatform(position, margin = 0.1) {
        const halfWidth = this.size.width / 2 + margin;
        const halfHeight = this.size.height / 2 + margin;
        const halfDepth = this.size.depth / 2 + margin;
        
        return Math.abs(position.x - this.currentPosition.x) <= halfWidth &&
               Math.abs(position.y - this.currentPosition.y) <= halfHeight &&
               Math.abs(position.z - this.currentPosition.z) <= halfDepth;
    }
    
    /**
     * Clean up platform resources
     */
    dispose() {
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
        }
        
        if (this.pathLine) {
            if (this.pathLine.geometry) this.pathLine.geometry.dispose();
            if (this.pathLine.material) this.pathLine.material.dispose();
        }
    }
}