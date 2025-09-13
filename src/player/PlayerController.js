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
        this.moveSpeed = 10.0; // Maximum rolling speed
        this.acceleration = 20.0; // How quickly we reach max speed
        this.deceleration = 10.0; // How quickly we slow down
        this.jumpImpulse = 8.0; // Vertical impulse for jumping
        
        // Player physics body reference (will be set by PhysicsManager)
        this.physicsBody = null;
        
        // Track if player can jump (on ground)
        this.canJump = true;
        
        // Previous jump state to detect new jump presses
        this.wasJumpPressed = false;
        
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
     * Update player movement based on input
     * Requirements: PROD-002 (Rolling), PROD-003 (Jumping)
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (!this.physicsBody) return;
        
        // Calculate movement vector based on input
        const moveVector = { x: 0, z: 0 };
        
        if (this.keys.forward) moveVector.z -= 1;
        if (this.keys.backward) moveVector.z += 1;
        if (this.keys.left) moveVector.x -= 1;
        if (this.keys.right) moveVector.x += 1;
        
        // Normalize diagonal movement
        const length = Math.sqrt(moveVector.x * moveVector.x + moveVector.z * moveVector.z);
        if (length > 0) {
            moveVector.x /= length;
            moveVector.z /= length;
        }
        
        // Apply forces for rolling movement - Requirement: PROD-002
        // This creates momentum-based movement with gradual acceleration/deceleration
        if (length > 0) {
            // Apply acceleration force
            const force = new CANNON.Vec3(
                moveVector.x * this.acceleration,
                0,
                moveVector.z * this.acceleration
            );
            this.physicsBody.applyForce(force);
            
            // Log position for TC-1.2 test evidence
            if (Math.random() < 0.1) { // Log occasionally to avoid spam
                console.log(`PlayerController::update - Position: (${this.physicsBody.position.x.toFixed(2)}, ${this.physicsBody.position.y.toFixed(2)}, ${this.physicsBody.position.z.toFixed(2)})`);
            }
        }
        
        // Limit maximum velocity for control
        const velocity = this.physicsBody.velocity;
        const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
        if (horizontalSpeed > this.moveSpeed) {
            const scale = this.moveSpeed / horizontalSpeed;
            this.physicsBody.velocity.x *= scale;
            this.physicsBody.velocity.z *= scale;
        }
        
        // Apply damping when no input (gradual deceleration)
        if (length === 0) {
            this.physicsBody.velocity.x *= (1 - this.deceleration * deltaTime);
            this.physicsBody.velocity.z *= (1 - this.deceleration * deltaTime);
        }
        
        // Handle jumping - Requirement: PROD-003
        // Check if on ground (simple check - Y position near 0.5)
        this.canJump = Math.abs(this.physicsBody.position.y - 0.5) < 0.1;
        
        // Detect new jump press (not held)
        const jumpPressed = this.keys.jump && !this.wasJumpPressed;
        this.wasJumpPressed = this.keys.jump;
        
        if (jumpPressed && this.canJump) {
            // Apply upward impulse for jump
            const jumpForce = new CANNON.Vec3(0, this.jumpImpulse, 0);
            this.physicsBody.velocity.y = this.jumpImpulse;
            
            console.log(`PlayerController::jump - Applied impulse, Y velocity: ${this.jumpImpulse}`);
            console.log(`PlayerController::jump - Starting Y position: ${this.physicsBody.position.y.toFixed(3)}`);
        }
        
        // Log Y position during jump for TC-1.3 test evidence
        if (!this.canJump && Math.random() < 0.2) {
            console.log(`PlayerController::jumping - Y position: ${this.physicsBody.position.y.toFixed(3)}, Y velocity: ${this.physicsBody.velocity.y.toFixed(3)}`);
        }
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
    }
}