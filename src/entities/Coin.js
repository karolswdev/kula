/**
 * Coin - Collectible entity for scoring
 * Requirement: PROD-010 - Collectibles: Scoring
 * 
 * Coins are secondary collectibles that increase the player's score.
 * Silver coins = 10 points, Gold coins = 50 points
 */

export class Coin {
    constructor(id, position, value = 10, type = 'silver') {
        this.id = id;
        this.position = new THREE.Vector3(position[0], position[1], position[2]);
        this.value = value;
        this.type = type; // 'silver' or 'gold'
        this.isCollected = false;
        
        // Visual properties
        this.mesh = null;
        this.rotationSpeed = 2.0; // radians per second
        this.floatAmplitude = 0.1;
        this.floatSpeed = 2.0;
        this.initialY = position[1];
        
        // Particle system for collection effect
        this.particles = null;
        
        this.createMesh();
    }
    
    /**
     * Create the coin mesh with appropriate materials
     */
    createMesh() {
        // Coin geometry - flat cylinder
        const geometry = new THREE.CylinderGeometry(
            this.type === 'gold' ? 0.4 : 0.3,  // Top radius
            this.type === 'gold' ? 0.4 : 0.3,  // Bottom radius
            0.1,  // Height
            16    // Segments
        );
        
        // Coin material with metallic appearance
        const material = new THREE.MeshStandardMaterial({
            color: this.type === 'gold' ? 0xFFD700 : 0xC0C0C0,
            metalness: 0.8,
            roughness: 0.2,
            emissive: this.type === 'gold' ? 0xFFD700 : 0xC0C0C0,
            emissiveIntensity: this.type === 'gold' ? 0.3 : 0.1
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Add user data for identification
        this.mesh.userData = {
            type: 'coin',
            id: this.id,
            value: this.value,
            coinType: this.type
        };
        
        // Add a glow effect for gold coins
        if (this.type === 'gold') {
            this.addGlowEffect();
        }
        
        console.log(`Coin::createMesh - Created ${this.type} coin worth ${this.value} points at position:`, this.position);
    }
    
    /**
     * Add glow effect to gold coins
     */
    addGlowEffect() {
        // Create a slightly larger sphere for glow effect
        const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(glowMesh);
    }
    
    /**
     * Update coin animation
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     */
    update(deltaTime, elapsedTime) {
        if (!this.mesh || this.isCollected) return;
        
        // Rotate the coin
        this.mesh.rotation.y += this.rotationSpeed * deltaTime;
        
        // Float up and down
        const floatOffset = Math.sin(elapsedTime * this.floatSpeed) * this.floatAmplitude;
        this.mesh.position.y = this.initialY + floatOffset;
    }
    
    /**
     * Check collision with player
     * @param {THREE.Vector3} playerPosition - Player's current position
     * @param {number} playerRadius - Player's collision radius
     * @returns {boolean} True if player is colliding with coin
     */
    checkCollision(playerPosition, playerRadius = 0.5) {
        if (this.isCollected) return false;
        
        const distance = this.mesh.position.distanceTo(playerPosition);
        const collisionDistance = playerRadius + 0.4; // Coin radius + player radius
        
        return distance < collisionDistance;
    }
    
    /**
     * Collect the coin
     * @returns {Object} Collection data (value, type)
     */
    collect() {
        if (this.isCollected) return null;
        
        this.isCollected = true;
        console.log(`Coin::collect - ${this.type} coin collected! Value: ${this.value}`);
        
        // Create collection effect
        this.createCollectionEffect();
        
        // Return collection data
        return {
            value: this.value,
            type: this.type,
            id: this.id
        };
    }
    
    /**
     * Create particle effect when coin is collected
     */
    createCollectionEffect() {
        // Simple scale down animation for now
        // In a full implementation, this would create particles
        if (this.mesh) {
            const startScale = this.mesh.scale.x;
            const animationDuration = 300; // ms
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / animationDuration, 1);
                
                // Scale down and fade out
                const scale = startScale * (1 - progress);
                this.mesh.scale.set(scale, scale, scale);
                
                // Rotate faster as it disappears
                this.mesh.rotation.y += 0.3;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
        }
    }
    
    /**
     * Add coin to scene
     * @param {THREE.Scene} scene
     */
    addToScene(scene) {
        if (this.mesh && !this.isCollected) {
            scene.add(this.mesh);
        }
    }
    
    /**
     * Remove coin from scene
     * @param {THREE.Scene} scene
     */
    removeFromScene(scene) {
        if (this.mesh) {
            scene.remove(this.mesh);
        }
    }
    
    /**
     * Dispose of coin resources
     */
    dispose() {
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
            
            // Dispose of glow effect if present
            this.mesh.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
    }
}