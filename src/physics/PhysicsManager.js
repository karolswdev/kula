/**
 * PhysicsManager - Manages physics simulation using Cannon.js
 * Requirements: ARCH-001, PROD-002, PROD-003, ARCH-006 (Physics Optimization)
 */

import * as CANNON from 'cannon-es';

export class PhysicsManager {
    constructor() {
        // Initialize physics world
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0); // Earth gravity
        
        // Use SAPBroadphase for better performance and collision detection
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        
        // Increase solver iterations for more stable physics
        this.world.solver.iterations = 10;
        this.world.solver.tolerance = 0.1;
        
        // Enable default collision behavior
        this.world.defaultContactMaterial.friction = 0.4;
        this.world.defaultContactMaterial.restitution = 0.1;
        
        // Physics bodies
        this.playerBody = null;
        this.floorBody = null;
        this.wallBodies = []; // Track wall bodies for edge detection
        
        // Material for physics interactions
        this.playerMaterial = new CANNON.Material('player');
        this.groundMaterial = new CANNON.Material('ground');
        
        // Create contact material for player-ground interaction
        const playerGroundContact = new CANNON.ContactMaterial(
            this.playerMaterial,
            this.groundMaterial,
            {
                friction: 0.4,
                restitution: 0.1, // Small bounce
                contactEquationStiffness: 1e8,
                contactEquationRelaxation: 3
            }
        );
        this.world.addContactMaterial(playerGroundContact);
        
        // Gravity reorientation tracking - Requirement: PROD-001
        this.currentGravityDirection = new CANNON.Vec3(0, -1, 0); // Normalized gravity direction
        this.gravityMagnitude = 9.82;
        this.isTransitioning = false;
        this.targetGravity = null;
        this.gravityTransitionSpeed = 2.0; // How fast gravity transitions (radians per second)
        
        // Reference to player controller for gravity updates
        this.playerController = null;
        
        // Edge detection parameters
        this.edgeDetectionDistance = 2.0; // Distance to check for edges
        this.surfaceDetectionAngle = Math.PI / 4; // 45 degrees - max angle to consider a surface walkable
        
        // Raycaster for edge detection
        this.raycaster = new CANNON.Ray();
        
        console.log('PhysicsManager::constructor - Physics world initialized');
    }
    
    /**
     * Create physics body for the player sphere
     * Requirements: PROD-002, PROD-003
     * @param {THREE.Vector3} position - Initial position
     * @returns {CANNON.Body} The player physics body
     */
    createPlayerBody(position) {
        // Create sphere shape matching visual sphere (radius 0.5)
        const shape = new CANNON.Sphere(0.5);
        
        // Create body with mass (1 kg for responsive movement)
        this.playerBody = new CANNON.Body({
            mass: 1,
            shape: shape,
            material: this.playerMaterial,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            linearDamping: 0.1, // Slight damping for stability
            angularDamping: 0.4  // More angular damping for controlled rolling
        });
        
        this.world.addBody(this.playerBody);
        
        console.log('PhysicsManager::createPlayerBody - Player physics body created');
        console.log(`  Initial position: (${position.x}, ${position.y}, ${position.z})`);
        
        return this.playerBody;
    }
    
    /**
     * Create physics body for the floor
     * @param {THREE.Vector3} position - Floor position
     * @param {THREE.Vector2} size - Floor dimensions (width, depth)
     * @returns {CANNON.Body} The floor physics body
     */
    createFloorBody(position, size) {
        // Create box shape for floor (very thin)
        // Using a thin box instead of a plane for better collision detection
        const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, 0.05, size.y / 2));
        
        // Create static body (mass = 0)
        // Position the floor slightly below y=0 so player starts properly on top
        this.floorBody = new CANNON.Body({
            mass: 0, // Static body
            shape: shape,
            material: this.groundMaterial,
            position: new CANNON.Vec3(position.x, position.y - 0.05, position.z),
            type: CANNON.Body.STATIC // Explicitly set as static
        });
        
        // Store floor normal for gravity reorientation
        this.floorBody.surfaceNormal = new CANNON.Vec3(0, 1, 0); // Floor normal points up
        
        this.world.addBody(this.floorBody);
        
        console.log('PhysicsManager::createFloorBody - Floor physics body created');
        console.log(`  Size: ${size.x}x${size.y}, Position: (${position.x}, ${position.y - 0.05}, ${position.z})`);
        console.log(`  Floor bounds: X[${-size.x/2} to ${size.x/2}], Y[${-0.05} to ${0.05}], Z[${-size.y/2} to ${size.y/2}]`);
        
        return this.floorBody;
    }
    
    /**
     * Create physics body for a wall
     * Requirement: PROD-001 - Gravity Reorientation
     * @param {THREE.Vector3} position - Wall position
     * @param {THREE.Vector2} size - Wall dimensions (width, height)
     * @returns {CANNON.Body} The wall physics body
     */
    createWallBody(position, size) {
        // Create box shape for wall (thin in Z direction, tall in Y)
        const shape = new CANNON.Box(new CANNON.Vec3(0.05, size.y / 2, size.x / 2));
        
        // Create static body for wall
        const wallBody = new CANNON.Body({
            mass: 0, // Static body
            shape: shape,
            material: this.groundMaterial, // Use same material as floor
            position: new CANNON.Vec3(position.x, position.y, position.z),
            type: CANNON.Body.STATIC
        });
        
        // Store wall normal for gravity reorientation
        wallBody.surfaceNormal = new CANNON.Vec3(-1, 0, 0); // Wall faces left, so normal points left
        
        this.world.addBody(wallBody);
        this.wallBodies.push(wallBody); // Track for edge detection
        
        console.log('PhysicsManager::createWallBody - Wall physics body created');
        console.log(`  Size: ${size.x}x${size.y}, Position: (${position.x}, ${position.y}, ${position.z})`);
        console.log(`  Wall bounds: X[${position.x - 0.05} to ${position.x + 0.05}], Y[${position.y - size.y/2} to ${position.y + size.y/2}], Z[${position.z - size.x/2} to ${position.z + size.x/2}]`);
        console.log(`  Surface normal: (${wallBody.surfaceNormal.x}, ${wallBody.surfaceNormal.y}, ${wallBody.surfaceNormal.z})`);
        
        return wallBody;
    }
    
    /**
     * Update physics simulation
     * @param {number} deltaTime - Time step in seconds
     */
    update(deltaTime) {
        // Cap deltaTime to prevent instability
        const clampedDelta = Math.min(deltaTime, 1/30);
        
        // Check for edge transitions - Requirement: PROD-001
        if (this.playerBody) {
            this.checkEdgeTransition();
        }
        
        // Update gravity if transitioning
        if (this.isTransitioning && this.targetGravity) {
            this.updateGravityTransition(clampedDelta);
        }
        
        // Step the physics world
        this.world.step(clampedDelta);
    }
    
    /**
     * Check if player is near an edge and should transition to a new surface
     * Requirement: PROD-001 - Gravity Reorientation
     */
    checkEdgeTransition() {
        if (!this.playerBody) return;
        
        const playerPos = this.playerBody.position;
        const playerVelocity = this.playerBody.velocity;
        
        // Check proximity to walls
        for (const wall of this.wallBodies) {
            const wallPos = wall.position;
            
            // Simple distance check to the wall's X position
            const distanceToWallX = Math.abs(playerPos.x - (wallPos.x - 0.5)); // Account for player radius
            
            // Check if player is approaching the edge where floor meets wall
            const isNearEdge = distanceToWallX < 1.5 && playerPos.y < 2.0;
            const isMovingTowardsWall = playerVelocity.x > 0.1;
            
            // Log for debugging
            if (distanceToWallX < 3.0) {
                console.log(`Edge Detection: Player X=${playerPos.x.toFixed(2)}, Wall X=${wallPos.x.toFixed(2)}, Distance=${distanceToWallX.toFixed(2)}`);
            }
            
            if (isNearEdge && isMovingTowardsWall && !this.isTransitioning) {
                console.log(`PhysicsManager::checkEdgeTransition - Edge crossing detected!`);
                console.log(`  Player position: (${playerPos.x.toFixed(2)}, ${playerPos.y.toFixed(2)}, ${playerPos.z.toFixed(2)})`);
                console.log(`  Player velocity: (${playerVelocity.x.toFixed(2)}, ${playerVelocity.y.toFixed(2)}, ${playerVelocity.z.toFixed(2)})`);
                console.log(`  Distance to wall edge: ${distanceToWallX.toFixed(2)}`);
                
                // Initiate gravity reorientation
                this.reorientGravity(wall.surfaceNormal);
            }
        }
    }
    
    /**
     * Reorient gravity to align with a new surface normal
     * Requirement: PROD-001 - Gravity Reorientation
     * @param {CANNON.Vec3} newNormal - The normal of the new surface
     */
    reorientGravity(newNormal) {
        if (this.isTransitioning) return; // Already transitioning
        
        // Log current gravity for TC-2.1 evidence
        const currentGrav = this.world.gravity;
        console.log(`Gravity: Reorienting from (${currentGrav.x.toFixed(2)}, ${currentGrav.y.toFixed(2)}, ${currentGrav.z.toFixed(2)})`);
        
        // Set target gravity (opposite of surface normal)
        this.targetGravity = newNormal.clone();
        this.targetGravity.scale(-this.gravityMagnitude, this.targetGravity);
        
        console.log(`Gravity: Target set to (${this.targetGravity.x.toFixed(2)}, ${this.targetGravity.y.toFixed(2)}, ${this.targetGravity.z.toFixed(2)})`);
        
        this.isTransitioning = true;
        
        // Notify camera controller if it exists
        if (window.game && window.game.cameraController) {
            window.game.cameraController.onGravityChange(newNormal);
        }
        
        // Notify player controller about gravity change
        if (this.playerController) {
            this.playerController.updateGravity(this.targetGravity);
        }
    }
    
    /**
     * Smoothly transition gravity to the target
     * @param {number} deltaTime - Time step
     */
    updateGravityTransition(deltaTime) {
        if (!this.targetGravity) return;
        
        const current = this.world.gravity;
        const target = this.targetGravity;
        
        // Simple linear interpolation for now
        const lerpFactor = Math.min(1.0, this.gravityTransitionSpeed * deltaTime);
        
        current.x += (target.x - current.x) * lerpFactor;
        current.y += (target.y - current.y) * lerpFactor;
        current.z += (target.z - current.z) * lerpFactor;
        
        // Check if transition is complete
        const diff = current.distanceTo(target);
        if (diff < 0.1) {
            current.copy(target);
            this.isTransitioning = false;
            this.targetGravity = null;
            
            console.log(`Gravity: Reorientation complete! New gravity: (${current.x.toFixed(2)}, ${current.y.toFixed(2)}, ${current.z.toFixed(2)})`);
            
            // Final update to player controller
            if (this.playerController) {
                this.playerController.updateGravity(current);
            }
        }
    }
    
    /**
     * Sync Three.js mesh position with physics body
     * @param {THREE.Mesh} mesh - The Three.js mesh
     * @param {CANNON.Body} body - The physics body
     */
    syncMeshWithBody(mesh, body) {
        // Copy position
        mesh.position.copy(body.position);
        
        // Copy rotation (quaternion)
        mesh.quaternion.copy(body.quaternion);
    }
    
    /**
     * Get player physics body
     * @returns {CANNON.Body} Player body
     */
    getPlayerBody() {
        return this.playerBody;
    }
    
    /**
     * Set player controller reference for gravity updates
     * @param {PlayerController} controller - The player controller
     */
    setPlayerController(controller) {
        this.playerController = controller;
        // Initialize with current gravity
        if (this.playerController) {
            this.playerController.updateGravity(this.world.gravity);
        }
    }
    
    /**
     * Reset physics simulation
     */
    reset() {
        // Reset player position and velocity
        if (this.playerBody) {
            this.playerBody.position.set(0, 0.5, 0);
            this.playerBody.velocity.set(0, 0, 0);
            this.playerBody.angularVelocity.set(0, 0, 0);
            this.playerBody.quaternion.set(0, 0, 0, 1);
        }
        
        console.log('PhysicsManager::reset - Physics state reset');
    }
}