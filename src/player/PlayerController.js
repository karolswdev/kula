/**
 * PlayerController - Manages user input and player movement
 * Requirements: USER-001, PROD-002, PROD-003, NFR-002
 */

export class PlayerController {
    constructor() {
        // Input state tracking
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };
        
        // Physics parameters - Requirement: NFR-002 (Control Precision)
        this.moveSpeed = 5.0; // Maximum rolling speed (reduced for better control)
        this.acceleration = 10.0; // How quickly we reach max speed (reduced for better control)
        this.deceleration = 5.0; // How quickly we slow down (reduced for smoother stops)
        this.jumpImpulse = 8.0; // Vertical impulse for jumping
        
        // Player physics body reference (will be set by PhysicsManager)
        this.physicsBody = null;
        
        // Track if player can jump (on ground)
        this.canJump = true;
        
        // Previous jump state to detect new jump presses
        this.wasJumpPressed = false;
        
        // Gravity-oriented coordinate system - Requirement: PROD-001 (Gravity Reorientation)
        this.currentGravity = new CANNON.Vec3(0, -9.82, 0); // Current gravity vector
        this.upVector = new CANNON.Vec3(0, 1, 0); // Current "up" direction (opposite of gravity)
        this.forwardVector = new CANNON.Vec3(0, 0, -1); // Forward in local space
        this.rightVector = new CANNON.Vec3(1, 0, 0); // Right in local space
        
        // Camera reference for movement direction
        this.camera = null;
        
        this.setupEventListeners();
        
        console.log('PlayerController::constructor - Initialized with input listeners');
    }
    
    /**
     * Setup keyboard event listeners
     * Requirement: USER-001 - Input: Player Control
     */
    setupEventListeners() {
        // Keydown events
        window.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.keys.forward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.keys.backward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.keys.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.keys.right = true;
                    break;
                case 'Space':
                    this.keys.jump = true;
                    event.preventDefault(); // Prevent page scroll
                    break;
            }
        });
        
        // Keyup events
        window.addEventListener('keyup', (event) => {
            switch(event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.keys.forward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.keys.backward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.keys.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.keys.right = false;
                    break;
                case 'Space':
                    this.keys.jump = false;
                    break;
            }
        });
        
        console.log('PlayerController::setupEventListeners - Keyboard controls ready');
        console.log('  Controls: WASD/Arrows for movement, Space for jump');
    }
    
    /**
     * Set the physics body for the player
     * @param {CANNON.Body} body - The Cannon.js physics body
     */
    setPhysicsBody(body) {
        this.physicsBody = body;
        console.log('PlayerController::setPhysicsBody - Physics body connected');
    }
    
    /**
     * Set camera reference for movement direction
     * @param {THREE.Camera} camera - The camera object
     */
    setCamera(camera) {
        this.camera = camera;
        console.log('PlayerController::setCamera - Camera reference set');
    }
    
    /**
     * Update gravity orientation - called by PhysicsManager
     * Requirement: PROD-001 - Gravity Reorientation
     * @param {CANNON.Vec3} gravityVector - The new gravity vector
     */
    updateGravity(gravityVector) {
        this.currentGravity.copy(gravityVector);
        
        // Calculate up vector (opposite of gravity)
        this.upVector.copy(gravityVector);
        this.upVector.normalize();
        this.upVector.scale(-1, this.upVector); // Invert to get "up"
        
        // Recalculate movement basis vectors
        this.updateMovementBasis();
        
        console.log(`PlayerController::updateGravity - Gravity updated to (${gravityVector.x.toFixed(2)}, ${gravityVector.y.toFixed(2)}, ${gravityVector.z.toFixed(2)})`);
        console.log(`  Up vector: (${this.upVector.x.toFixed(2)}, ${this.upVector.y.toFixed(2)}, ${this.upVector.z.toFixed(2)})`);
    }
    
    /**
     * Update movement basis vectors based on current gravity and camera
     * Creates a coordinate system where movement is relative to the current "floor"
     */
    updateMovementBasis() {
        // If we don't have a camera, use world-aligned defaults modified by gravity
        if (!this.camera) {
            // Create arbitrary forward perpendicular to up
            const worldForward = new CANNON.Vec3(0, 0, -1);
            const worldRight = new CANNON.Vec3(1, 0, 0);
            
            // If gravity is mostly vertical, use world X/Z for movement
            if (Math.abs(this.upVector.y) > 0.9) {
                this.forwardVector.set(0, 0, -1);
                this.rightVector.set(1, 0, 0);
            }
            // If gravity is mostly horizontal in X, use Y/Z for movement
            else if (Math.abs(this.upVector.x) > 0.9) {
                this.forwardVector.set(0, 0, -1);
                this.rightVector.set(0, 1, 0);
            }
            // If gravity is mostly horizontal in Z, use X/Y for movement
            else if (Math.abs(this.upVector.z) > 0.9) {
                this.forwardVector.set(1, 0, 0);
                this.rightVector.set(0, 1, 0);
            }
            return;
        }
        
        // Get camera forward direction
        const cameraForward = new THREE.Vector3(0, 0, -1);
        cameraForward.applyQuaternion(this.camera.quaternion);
        
        // Convert to CANNON.Vec3
        const camForward = new CANNON.Vec3(cameraForward.x, cameraForward.y, cameraForward.z);
        
        // Project camera forward onto the plane perpendicular to up vector
        // This gives us the forward direction along the current "floor"
        const dot = camForward.dot(this.upVector);
        this.forwardVector.copy(camForward);
        const scaledUp = this.upVector.clone();
        scaledUp.scale(dot, scaledUp);
        this.forwardVector.vsub(scaledUp, this.forwardVector);
        this.forwardVector.normalize();
        
        // Calculate right vector (perpendicular to forward and up)
        this.rightVector.copy(this.forwardVector);
        this.rightVector.cross(this.upVector, this.rightVector);
        this.rightVector.normalize();
        
        console.log(`PlayerController::updateMovementBasis - Basis updated`);
        console.log(`  Forward: (${this.forwardVector.x.toFixed(2)}, ${this.forwardVector.y.toFixed(2)}, ${this.forwardVector.z.toFixed(2)})`);
        console.log(`  Right: (${this.rightVector.x.toFixed(2)}, ${this.rightVector.y.toFixed(2)}, ${this.rightVector.z.toFixed(2)})`);
    }
    
    /**
     * Update player movement based on input
     * Requirements: PROD-002 (Rolling), PROD-003 (Jumping), PROD-001 (Gravity Reorientation)
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (!this.physicsBody) return;
        
        // Update movement basis in case camera has moved
        this.updateMovementBasis();
        
        // Calculate movement input in local space
        let moveForward = 0;
        let moveRight = 0;
        
        if (this.keys.forward) moveForward += 1;  // W key moves forward (away from camera)
        if (this.keys.backward) moveForward -= 1; // S key moves backward (toward camera)
        if (this.keys.left) moveRight -= 1;
        if (this.keys.right) moveRight += 1;
        
        // Normalize diagonal movement
        const inputLength = Math.sqrt(moveForward * moveForward + moveRight * moveRight);
        if (inputLength > 0) {
            moveForward /= inputLength;
            moveRight /= inputLength;
        }
        
        // Apply forces for rolling movement - Requirement: PROD-002
        // Calculate force in gravity-relative coordinate system
        if (inputLength > 0) {
            // Combine forward and right vectors based on input
            const force = new CANNON.Vec3();
            
            // Add forward component
            const forwardForce = this.forwardVector.clone();
            forwardForce.scale(moveForward * this.acceleration, forwardForce);
            force.vadd(forwardForce, force);
            
            // Add right component
            const rightForce = this.rightVector.clone();
            rightForce.scale(moveRight * this.acceleration, rightForce);
            force.vadd(rightForce, force);
            
            // Apply force at center of mass
            this.physicsBody.applyForce(force, this.physicsBody.position);
            
            // Log position for TC-1.2 test evidence
            if (Math.random() < 0.1) { // Log occasionally to avoid spam
                console.log(`PlayerController::update - Position: (${this.physicsBody.position.x.toFixed(2)}, ${this.physicsBody.position.y.toFixed(2)}, ${this.physicsBody.position.z.toFixed(2)})`);
            }
        }
        
        // Limit maximum velocity for control (relative to current plane)
        // Project velocity onto movement plane (perpendicular to up vector)
        const velocity = this.physicsBody.velocity;
        const velocityOnPlane = velocity.clone();
        const velocityAlongUp = this.upVector.dot(velocity);
        const upComponent = this.upVector.clone();
        upComponent.scale(velocityAlongUp, upComponent);
        velocityOnPlane.vsub(upComponent, velocityOnPlane);
        
        const planeSpeed = velocityOnPlane.length();
        if (planeSpeed > this.moveSpeed) {
            const scale = this.moveSpeed / planeSpeed;
            velocityOnPlane.scale(scale, velocityOnPlane);
            // Reconstruct velocity with clamped plane component
            this.physicsBody.velocity.copy(velocityOnPlane);
            this.physicsBody.velocity.vadd(upComponent, this.physicsBody.velocity);
        }
        
        // Apply damping when no input (gradual deceleration)
        if (inputLength === 0) {
            // Damp only the velocity component on the movement plane
            const velocityOnPlane = this.physicsBody.velocity.clone();
            const velocityAlongUp = this.upVector.dot(this.physicsBody.velocity);
            const upComponent = this.upVector.clone();
            upComponent.scale(velocityAlongUp, upComponent);
            velocityOnPlane.vsub(upComponent, velocityOnPlane);
            
            // Apply damping to plane velocity
            velocityOnPlane.scale(1 - this.deceleration * deltaTime, velocityOnPlane);
            
            // Reconstruct velocity
            this.physicsBody.velocity.copy(velocityOnPlane);
            this.physicsBody.velocity.vadd(upComponent, this.physicsBody.velocity);
        }
        
        // Handle jumping - Requirements: PROD-003, PROD-001 (Gravity-relative jumping)
        // Check if on ground using gravity-relative detection
        this.checkGroundContact();
        
        // Detect new jump press (not held)
        const jumpPressed = this.keys.jump && !this.wasJumpPressed;
        this.wasJumpPressed = this.keys.jump;
        
        if (jumpPressed && this.canJump) {
            // Apply jump impulse in the opposite direction of gravity (i.e., "up")
            const jumpDirection = this.upVector.clone();
            jumpDirection.scale(this.jumpImpulse, jumpDirection);
            
            // Set velocity component in jump direction
            const currentVelAlongUp = this.upVector.dot(this.physicsBody.velocity);
            const upComponent = this.upVector.clone();
            upComponent.scale(this.jumpImpulse - currentVelAlongUp, upComponent);
            this.physicsBody.velocity.vadd(upComponent, this.physicsBody.velocity);
            
            console.log(`PlayerController::jump - Applied impulse in direction (${jumpDirection.x.toFixed(2)}, ${jumpDirection.y.toFixed(2)}, ${jumpDirection.z.toFixed(2)})`);
            console.log(`PlayerController::jump - New velocity: (${this.physicsBody.velocity.x.toFixed(2)}, ${this.physicsBody.velocity.y.toFixed(2)}, ${this.physicsBody.velocity.z.toFixed(2)})`);
        }
        
        // Log position during jump for debugging
        if (!this.canJump && Math.random() < 0.1) {
            const vel = this.physicsBody.velocity;
            const pos = this.physicsBody.position;
            console.log(`PlayerController::jumping - Pos: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}), Vel: (${vel.x.toFixed(2)}, ${vel.y.toFixed(2)}, ${vel.z.toFixed(2)})`);
        }
    }
    
    /**
     * Check if player is in contact with ground (relative to current gravity)
     * Requirement: PROD-001 - Gravity-relative ground detection
     */
    checkGroundContact() {
        if (!this.physicsBody) {
            this.canJump = false;
            return;
        }
        
        // Simple approach: check velocity component along gravity direction
        // If we're moving in gravity direction and slow enough, we're likely on ground
        const gravityNormalized = this.currentGravity.clone();
        gravityNormalized.normalize();
        
        // Velocity component in gravity direction (positive = falling)
        const velocityAlongGravity = gravityNormalized.dot(this.physicsBody.velocity);
        
        // Check if we're not moving much in gravity direction
        // This works for any gravity orientation
        this.canJump = Math.abs(velocityAlongGravity) < 0.5;
        
        // Additional check: ray cast would be more accurate but this is simpler for now
        // Could be enhanced with actual collision detection in the future
    }
    
    /**
     * Get current input state (for debugging/testing)
     * @returns {Object} Current key states
     */
    getInputState() {
        return { ...this.keys };
    }
    
    /**
     * Reset all input states
     */
    reset() {
        this.keys.forward = false;
        this.keys.backward = false;
        this.keys.left = false;
        this.keys.right = false;
        this.keys.jump = false;
        this.wasJumpPressed = false;
        
        // Reset gravity to default
        this.currentGravity.set(0, -9.82, 0);
        this.upVector.set(0, 1, 0);
        this.forwardVector.set(0, 0, -1);
        this.rightVector.set(1, 0, 0);
    }
}