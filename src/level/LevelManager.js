/**
 * LevelManager - Handles loading and management of game levels from JSON data
 * Requirements: ARCH-002 (Data-Driven Levels), PROD-004 (Key Collection), PROD-005 (Exit Portal)
 */

export class LevelManager {
    constructor(scene, physicsManager) {
        this.scene = scene;
        this.physicsManager = physicsManager;
        
        // Current level data
        this.currentLevel = null;
        this.levelEntities = [];
        this.levelPhysicsBodies = [];
        
        // Game state for objectives - Requirement: PROD-004, PROD-005
        this.gameState = {
            keysCollected: 0,
            totalKeys: 0,
            exitUnlocked: false,
            levelComplete: false,
            playerStartPosition: null,
            playerStartGravity: null
        };
        
        // Entity collections
        this.keys = new Map();
        this.platforms = new Map();
        this.exitPortal = null;
        
        console.log('LevelManager::constructor - Level manager initialized');
    }
    
    /**
     * Load a level from JSON data
     * Requirement: ARCH-002 - Data-Driven Levels
     * @param {Object|string} levelData - Level data object or path to JSON file
     * @returns {Promise<void>}
     */
    async load(levelData) {
        console.log('LevelManager::load - Loading level data');
        
        // Clear any existing level
        this.clear();
        
        // Parse level data if it's a string (file path)
        if (typeof levelData === 'string') {
            try {
                const response = await fetch(levelData);
                this.currentLevel = await response.json();
            } catch (error) {
                console.error('LevelManager::load - Failed to load level file:', error);
                throw error;
            }
        } else {
            this.currentLevel = levelData;
        }
        
        console.log('LevelManager::load - Level data loaded:', this.currentLevel.name);
        
        // Set player start position and gravity
        if (this.currentLevel.playerStart) {
            this.gameState.playerStartPosition = new THREE.Vector3(
                this.currentLevel.playerStart.position.x,
                this.currentLevel.playerStart.position.y,
                this.currentLevel.playerStart.position.z
            );
            
            if (this.currentLevel.playerStart.gravity) {
                this.gameState.playerStartGravity = new THREE.Vector3(
                    this.currentLevel.playerStart.gravity.x,
                    this.currentLevel.playerStart.gravity.y,
                    this.currentLevel.playerStart.gravity.z
                );
            } else {
                this.gameState.playerStartGravity = new THREE.Vector3(0, -1, 0);
            }
        }
        
        // Create platforms - Requirement: PROD-011 (Modular Blocks)
        if (this.currentLevel.platforms) {
            this.createPlatforms(this.currentLevel.platforms);
        }
        
        // Create keys - Requirement: PROD-004
        if (this.currentLevel.keys) {
            this.createKeys(this.currentLevel.keys);
            this.gameState.totalKeys = this.currentLevel.keys.length;
        }
        
        // Create exit portal - Requirement: PROD-005
        if (this.currentLevel.exit) {
            this.createExitPortal(this.currentLevel.exit);
        }
        
        // Set level bounds
        if (this.currentLevel.levelBounds) {
            this.levelBounds = this.currentLevel.levelBounds;
        }
        
        console.log(`LevelManager::load - Level loaded with ${this.platforms.size} platforms, ${this.keys.size} keys`);
        console.log('LevelManager::load - Game state:', this.gameState);
    }
    
    /**
     * Create platform entities from level data
     * Requirement: PROD-011 - Modular Blocks
     */
    createPlatforms(platformsData) {
        platformsData.forEach(platformData => {
            // Create geometry based on size
            const geometry = new THREE.BoxGeometry(
                platformData.size.width,
                platformData.size.height,
                platformData.size.depth
            );
            
            // Create material with specified properties
            const material = new THREE.MeshStandardMaterial({
                color: platformData.material.color || '#808080',
                roughness: platformData.material.roughness || 0.8,
                metalness: platformData.material.metalness || 0.2
            });
            
            // Create mesh
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                platformData.position.x,
                platformData.position.y,
                platformData.position.z
            );
            
            // Apply rotation if specified
            if (platformData.rotation) {
                mesh.rotation.set(
                    platformData.rotation.x || 0,
                    platformData.rotation.y || 0,
                    platformData.rotation.z || 0
                );
            }
            
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.name = `platform-${platformData.id}`;
            
            // Add to scene and track
            this.scene.add(mesh);
            this.levelEntities.push(mesh);
            this.platforms.set(platformData.id, mesh);
            
            // Create physics body if physics manager is available
            if (this.physicsManager && platformData.physics) {
                const physicsBody = this.createPlatformPhysicsBody(platformData);
                if (physicsBody) {
                    this.levelPhysicsBodies.push(physicsBody);
                }
            }
            
            console.log(`LevelManager::createPlatforms - Created platform: ${platformData.id} at`, mesh.position);
        });
    }
    
    /**
     * Create physics body for a platform
     * Requirement: PROD-001 - Gravity Reorientation
     */
    createPlatformPhysicsBody(platformData) {
        // Determine platform orientation based on size and position
        const isFloor = platformData.size.height < platformData.size.width && 
                       platformData.size.height < platformData.size.depth;
        const isWall = platformData.size.width < platformData.size.height || 
                      platformData.size.depth < platformData.size.height;
        
        let body = null;
        
        if (isFloor || platformData.id.includes('floor') || platformData.id.includes('ceiling')) {
            // Create floor/ceiling body
            body = this.physicsManager.createFloorBody(
                new THREE.Vector3(
                    platformData.position.x,
                    platformData.position.y,
                    platformData.position.z
                ),
                new THREE.Vector2(
                    platformData.size.width,
                    platformData.size.depth
                )
            );
        } else if (isWall || platformData.id.includes('wall')) {
            // Create wall body
            body = this.physicsManager.createWallBody(
                new THREE.Vector3(
                    platformData.position.x,
                    platformData.position.y,
                    platformData.position.z
                ),
                new THREE.Vector2(
                    Math.max(platformData.size.width, platformData.size.depth),
                    platformData.size.height
                )
            );
        }
        
        if (body && platformData.physics.isGravitySurface) {
            body.isGravitySurface = true;
        }
        
        return body;
    }
    
    /**
     * Create key entities from level data
     * Requirement: PROD-004 - Key Collection
     */
    createKeys(keysData) {
        keysData.forEach(keyData => {
            // Create key geometry - a simple torus for now, will enhance later
            const geometry = new THREE.TorusGeometry(0.4, 0.1, 8, 16);
            
            // Create golden material with emissive glow
            const material = new THREE.MeshStandardMaterial({
                color: keyData.color || '#FFD700',
                emissive: keyData.color || '#FFD700',
                emissiveIntensity: 0.3,
                metalness: 0.8,
                roughness: 0.2
            });
            
            // Create mesh
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                keyData.position.x,
                keyData.position.y,
                keyData.position.z
            );
            
            // Apply scale if specified
            if (keyData.scale) {
                mesh.scale.setScalar(keyData.scale);
            }
            
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.name = `key-${keyData.id}`;
            
            // Store key metadata
            mesh.userData = {
                id: keyData.id,
                rotationSpeed: keyData.rotationSpeed || 2.0,
                collected: false,
                isKey: true
            };
            
            // Add to scene and track
            this.scene.add(mesh);
            this.levelEntities.push(mesh);
            this.keys.set(keyData.id, mesh);
            
            console.log(`LevelManager::createKeys - Created key: ${keyData.id} at`, mesh.position);
        });
    }
    
    /**
     * Create exit portal from level data
     * Requirement: PROD-005 - Exit Portal
     */
    createExitPortal(exitData) {
        // Create portal geometry - a cylinder for now
        const geometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32);
        
        // Create material - starts locked (red)
        const material = new THREE.MeshStandardMaterial({
            color: exitData.lockedColor || '#FF0000',
            emissive: exitData.lockedColor || '#FF0000',
            emissiveIntensity: 0.2,
            metalness: 0.5,
            roughness: 0.3
        });
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            exitData.position.x,
            exitData.position.y,
            exitData.position.z
        );
        
        // Rotate to lie flat
        mesh.rotation.x = Math.PI / 2;
        
        // Apply scale if specified
        if (exitData.scale) {
            mesh.scale.setScalar(exitData.scale);
        }
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = 'exit-portal';
        
        // Store portal metadata
        mesh.userData = {
            requiredKeys: exitData.requiredKeys || this.gameState.totalKeys,
            lockedColor: exitData.lockedColor || '#FF0000',
            unlockedColor: exitData.unlockedColor || '#00FF00',
            isLocked: true,
            isExitPortal: true
        };
        
        // Add to scene and track
        this.scene.add(mesh);
        this.levelEntities.push(mesh);
        this.exitPortal = mesh;
        
        console.log(`LevelManager::createExitPortal - Created exit portal at`, mesh.position);
        console.log(`LevelManager::createExitPortal - Requires ${mesh.userData.requiredKeys} keys`);
    }
    
    /**
     * Update level entities (animations, state changes)
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Animate keys (rotation)
        this.keys.forEach(key => {
            if (!key.userData.collected) {
                key.rotation.y += key.userData.rotationSpeed * deltaTime;
                // Subtle floating animation
                key.position.y += Math.sin(Date.now() * 0.001) * 0.005;
            }
        });
        
        // Update exit portal state
        if (this.exitPortal && this.exitPortal.userData.isLocked) {
            // Check if enough keys collected to unlock
            if (this.gameState.keysCollected >= this.exitPortal.userData.requiredKeys) {
                this.unlockExitPortal();
            }
        }
        
        // Animate unlocked portal
        if (this.exitPortal && !this.exitPortal.userData.isLocked) {
            this.exitPortal.rotation.z += deltaTime * 2;
            // Pulsing effect
            const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.1;
            this.exitPortal.scale.setScalar((this.currentLevel.exit?.scale || 1.5) * pulse);
        }
    }
    
    /**
     * Collect a key
     * Requirement: PROD-004 - Key Collection
     */
    collectKey(keyId) {
        const key = this.keys.get(keyId);
        if (key && !key.userData.collected) {
            key.userData.collected = true;
            this.gameState.keysCollected++;
            
            // Remove key from scene with a simple fade effect
            this.scene.remove(key);
            
            console.log(`LevelManager::collectKey - Collected key: ${keyId}`);
            console.log(`LevelManager::collectKey - Keys: ${this.gameState.keysCollected}/${this.gameState.totalKeys}`);
            
            // Dispatch key collected event for UI
            window.dispatchEvent(new CustomEvent('keyCollected', {
                detail: {
                    keyId: keyId,
                    collected: this.gameState.keysCollected,
                    total: this.gameState.totalKeys
                }
            }));
            
            // Check if all keys collected
            if (this.gameState.keysCollected >= this.gameState.totalKeys) {
                console.log('LevelManager::collectKey - All keys collected!');
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * Unlock the exit portal
     * Requirement: PROD-005 - Exit Portal
     */
    unlockExitPortal() {
        if (this.exitPortal && this.exitPortal.userData.isLocked) {
            this.exitPortal.userData.isLocked = false;
            this.gameState.exitUnlocked = true;
            
            // Change portal color to unlocked
            this.exitPortal.material.color.set(this.exitPortal.userData.unlockedColor);
            this.exitPortal.material.emissive.set(this.exitPortal.userData.unlockedColor);
            this.exitPortal.material.emissiveIntensity = 0.5;
            
            console.log('LevelManager::unlockExitPortal - Exit portal unlocked!');
        }
    }
    
    /**
     * Complete the current level
     * Requirement: PROD-005 - Exit Portal
     */
    completeLevel() {
        if (this.gameState.exitUnlocked && !this.gameState.levelComplete) {
            this.gameState.levelComplete = true;
            console.log('LevelManager::completeLevel - Level Complete!');
            console.log(`LevelManager::completeLevel - Final score: ${this.gameState.keysCollected}/${this.gameState.totalKeys} keys`);
            
            // Dispatch level complete event
            window.dispatchEvent(new CustomEvent('levelComplete', {
                detail: {
                    levelId: this.currentLevel.id,
                    levelName: this.currentLevel.name,
                    keysCollected: this.gameState.keysCollected,
                    totalKeys: this.gameState.totalKeys
                }
            }));
            
            return true;
        }
        return false;
    }
    
    /**
     * Check collision with collectibles
     * @param {THREE.Vector3} position - Position to check
     * @param {number} radius - Collision radius
     */
    checkCollectibles(position, radius = 0.5) {
        // Check key collisions
        this.keys.forEach((key, keyId) => {
            if (!key.userData.collected) {
                const distance = position.distanceTo(key.position);
                if (distance < radius + 0.5) { // 0.5 is approximate key radius
                    this.collectKey(keyId);
                }
            }
        });
        
        // Check exit portal collision
        if (this.exitPortal && !this.exitPortal.userData.isLocked) {
            const distance = position.distanceTo(this.exitPortal.position);
            if (distance < radius + 1.0) { // 1.0 is approximate portal radius
                this.completeLevel();
            }
        }
    }
    
    /**
     * Clear the current level
     * Requirement: ARCH-002 - Data-Driven Levels
     */
    clear() {
        console.log('LevelManager::clear - Clearing current level');
        
        // Remove all level entities from scene
        this.levelEntities.forEach(entity => {
            this.scene.remove(entity);
            // Dispose of geometry and material to free memory
            if (entity.geometry) entity.geometry.dispose();
            if (entity.material) {
                if (Array.isArray(entity.material)) {
                    entity.material.forEach(mat => mat.dispose());
                } else {
                    entity.material.dispose();
                }
            }
        });
        
        // Clear physics bodies
        this.levelPhysicsBodies.forEach(body => {
            if (this.physicsManager && this.physicsManager.world) {
                this.physicsManager.world.remove(body);
            }
        });
        
        // Reset collections
        this.levelEntities = [];
        this.levelPhysicsBodies = [];
        this.keys.clear();
        this.platforms.clear();
        this.exitPortal = null;
        
        // Reset game state
        this.gameState = {
            keysCollected: 0,
            totalKeys: 0,
            exitUnlocked: false,
            levelComplete: false,
            playerStartPosition: null,
            playerStartGravity: null
        };
        
        this.currentLevel = null;
        
        console.log('LevelManager::clear - Level cleared');
    }
    
    /**
     * Get current game state
     */
    getGameState() {
        return { ...this.gameState };
    }
    
    /**
     * Get player start position for the current level
     */
    getPlayerStartPosition() {
        return this.gameState.playerStartPosition || new THREE.Vector3(0, 1, 0);
    }
    
    /**
     * Get fall threshold for the current level
     */
    getFallThreshold() {
        return this.levelBounds?.fallThreshold || -10;
    }
}