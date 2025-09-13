/**
 * PhysicsManager - Manages physics simulation using Cannon.js
 * Requirements: ARCH-001, PROD-002, PROD-003
 */

export class PhysicsManager {
    constructor() {
        // Initialize physics world
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0); // Earth gravity
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;
        
        // Physics bodies
        this.playerBody = null;
        this.floorBody = null;
        
        // Material for physics interactions
        this.defaultMaterial = new CANNON.Material('default');
        const defaultContactMaterial = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.defaultMaterial,
            {
                friction: 0.4,
                restitution: 0.1 // Small bounce
            }
        );
        this.world.addContactMaterial(defaultContactMaterial);
        
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
            material: this.defaultMaterial,
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
        const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, 0.1, size.y / 2));
        
        // Create static body (mass = 0)
        this.floorBody = new CANNON.Body({
            mass: 0, // Static body
            shape: shape,
            material: this.defaultMaterial,
            position: new CANNON.Vec3(position.x, position.y - 0.1, position.z)
        });
        
        this.world.addBody(this.floorBody);
        
        console.log('PhysicsManager::createFloorBody - Floor physics body created');
        console.log(`  Size: ${size.x}x${size.y}, Position: (${position.x}, ${position.y}, ${position.z})`);
        
        return this.floorBody;
    }
    
    /**
     * Update physics simulation
     * @param {number} deltaTime - Time step in seconds
     */
    update(deltaTime) {
        // Cap deltaTime to prevent instability
        const clampedDelta = Math.min(deltaTime, 1/30);
        
        // Step the physics world
        this.world.step(clampedDelta);
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