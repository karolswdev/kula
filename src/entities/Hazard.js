/**
 * Hazard entity class - creates deadly environmental hazards
 * Requirement: PROD-007 - Failure Condition: Hazards
 */

import * as CANNON from 'cannon-es';

export class Hazard {
    /**
     * Create a new hazard entity
     * @param {Object} config - Hazard configuration
     * @param {Array} config.position - [x, y, z] position in world space
     * @param {Array} config.size - [width, height, depth] dimensions
     * @param {string} config.type - Type of hazard ('spikes', 'lava', etc.)
     * @param {number} config.color - Hex color for the hazard (defaults to red)
     */
    constructor(config) {
        this.type = config.type || 'spikes';
        this.position = new THREE.Vector3(...(config.position || [0, 0, 0]));
        this.size = config.size || [1, 0.5, 1];
        this.color = config.color || 0xFF0000; // Default to red for danger
        
        this.mesh = null;
        this.physicsBody = null;
        this.glowIntensity = 0;
        this.pulseSpeed = 2; // Speed of pulsing animation
        
        this.createVisualMesh();
    }
    
    /**
     * Create the visual representation of the hazard
     * Requirement: NFR-003 - Visual Identity (high contrast, clear danger)
     */
    createVisualMesh() {
        const group = new THREE.Group();
        
        if (this.type === 'spikes') {
            // Create multiple spike cones for a menacing look
            const spikeGeometry = new THREE.ConeGeometry(0.15, 0.8, 4);
            const spikeMaterial = new THREE.MeshStandardMaterial({
                color: this.color,
                metalness: 0.7,
                roughness: 0.3,
                emissive: this.color,
                emissiveIntensity: 0.3
            });
            
            // Create a grid of spikes based on size
            const cols = Math.ceil(this.size[0] * 3);
            const rows = Math.ceil(this.size[2] * 3);
            const spacing = 0.3;
            
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
                    spike.position.set(
                        (i - cols/2) * spacing,
                        0,
                        (j - rows/2) * spacing
                    );
                    spike.castShadow = true;
                    spike.receiveShadow = false;
                    group.add(spike);
                }
            }
            
            // Add a base platform under the spikes
            const baseGeometry = new THREE.BoxGeometry(this.size[0], 0.1, this.size[2]);
            const baseMaterial = new THREE.MeshStandardMaterial({
                color: 0x333333,
                metalness: 0.5,
                roughness: 0.5
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = -0.4;
            base.castShadow = true;
            base.receiveShadow = true;
            group.add(base);
            
        } else if (this.type === 'lava') {
            // Create a lava pool with animated surface
            const lavaGeometry = new THREE.BoxGeometry(...this.size);
            const lavaMaterial = new THREE.MeshStandardMaterial({
                color: 0xFF4500, // Orange-red lava color
                emissive: 0xFF2200,
                emissiveIntensity: 0.5,
                roughness: 0.1,
                metalness: 0.3
            });
            
            const lava = new THREE.Mesh(lavaGeometry, lavaMaterial);
            lava.castShadow = false;
            lava.receiveShadow = false;
            group.add(lava);
            
            // Store material for animation
            this.lavaMaterial = lavaMaterial;
            
        } else {
            // Generic hazard box
            const geometry = new THREE.BoxGeometry(...this.size);
            const material = new THREE.MeshStandardMaterial({
                color: this.color,
                emissive: this.color,
                emissiveIntensity: 0.2,
                metalness: 0.5,
                roughness: 0.5
            });
            
            const hazard = new THREE.Mesh(geometry, material);
            hazard.castShadow = true;
            hazard.receiveShadow = true;
            group.add(hazard);
        }
        
        // Position the group
        group.position.copy(this.position);
        group.name = `hazard_${this.type}`;
        group.userData = {
            type: 'hazard',
            hazardType: this.type,
            entity: this
        };
        
        this.mesh = group;
    }
    
    /**
     * Create physics body for collision detection
     * @param {CANNON.World} physicsWorld - The physics world to add the body to
     */
    createPhysicsBody(physicsWorld) {
        // Create a box shape for collision detection
        const shape = new CANNON.Box(new CANNON.Vec3(
            this.size[0] / 2,
            this.size[1] / 2,
            this.size[2] / 2
        ));
        
        // Create static body (doesn't move)
        this.physicsBody = new CANNON.Body({
            mass: 0, // Static body
            shape: shape,
            position: new CANNON.Vec3(
                this.position.x,
                this.position.y,
                this.position.z
            ),
            type: CANNON.Body.STATIC
        });
        
        // Set collision group and mask for proper collision detection
        this.physicsBody.collisionFilterGroup = 4; // Hazard group
        this.physicsBody.collisionFilterMask = 1; // Collide with player
        
        // Store reference to hazard entity
        this.physicsBody.userData = {
            type: 'hazard',
            hazardType: this.type,
            entity: this
        };
        
        physicsWorld.addBody(this.physicsBody);
    }
    
    /**
     * Update the hazard animation
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     */
    update(deltaTime, elapsedTime) {
        // Pulsing glow animation for all hazards
        this.glowIntensity = Math.sin(elapsedTime * this.pulseSpeed) * 0.2 + 0.3;
        
        if (this.type === 'spikes') {
            // Update spike emissive intensity
            this.mesh.children.forEach(child => {
                if (child.material && child.material.emissive) {
                    child.material.emissiveIntensity = this.glowIntensity;
                }
            });
        } else if (this.type === 'lava' && this.lavaMaterial) {
            // Animate lava surface
            this.lavaMaterial.emissiveIntensity = this.glowIntensity + 0.2;
            
            // Subtle bubbling effect by slightly scaling the mesh
            const lavaScale = 1 + Math.sin(elapsedTime * 3) * 0.02;
            this.mesh.children[0].scale.y = lavaScale;
        }
    }
    
    /**
     * Handle collision with player
     * Requirement: PROD-007 - Collision with hazard results in life loss
     * @returns {Object} Collision result with damage info
     */
    onPlayerCollision() {
        console.log(`Hazard::onPlayerCollision - Player hit ${this.type} hazard!`);
        
        return {
            damage: true,
            type: this.type,
            cause: `hazard_${this.type}`,
            position: this.position.clone()
        };
    }
    
    /**
     * Clean up hazard resources
     */
    dispose() {
        if (this.mesh) {
            // Dispose of geometries and materials
            this.mesh.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
    }
}