/**
 * Main Game class - orchestrates the game loop and coordinates all systems
 * Requirements: TECH-P-002, ARCH-001
 */

import { PlayerController } from '../player/PlayerController.js';
import { PhysicsManager } from '../physics/PhysicsManager.js';
import { CameraController } from '../camera/CameraController.js';
import { LevelManager } from '../level/LevelManager.js';
import { UIManager } from '../ui/UIManager.js';

export class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        this.isRunning = false;
        
        // Game systems - Requirement: ARCH-001 (Modular Game Systems)
        this.playerController = null;
        this.physicsManager = null;
        this.cameraController = null;
        this.levelManager = null;
        this.uiManager = null;
        
        // Container for the canvas
        this.container = document.getElementById('game-container');
        
        // Game state - Requirement: PROD-006, PROD-008
        this.gameState = {
            lives: 3,
            score: 0,
            isRespawning: false
        };
    }
    
    /**
     * Initialize the game systems
     * Requirement: TECH-P-002 - Rendering Engine: three.js
     */
    initialize() {
        console.log('Game::initialize - Setting up three.js scene');
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background for clarity
        
        // Setup camera - Requirement: PROD-009 - Camera System
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(0, 0, 0);
        
        // Setup renderer - Requirement: TECH-P-002
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance" // NFR-001: Performance
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add canvas to container
        this.container.appendChild(this.renderer.domElement);
        this.renderer.domElement.id = 'game-canvas';
        
        // Create clock for delta time
        this.clock = new THREE.Clock();
        
        // Initialize game systems first - Requirement: ARCH-001
        this.initializeSystems();
        
        // Load the first level - Requirement: ARCH-002
        this.loadLevel('/levels/test-level.json');
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        console.log('Game::initialize - Three.js scene initialized successfully');
    }
    
    /**
     * Initialize game systems (physics, player controller)
     * Requirement: ARCH-001 - Modular Game Systems
     */
    initializeSystems() {
        console.log('Game::initializeSystems - Initializing game systems');
        
        // Initialize physics manager
        this.physicsManager = new PhysicsManager();
        
        // Initialize level manager - Requirement: ARCH-002
        this.levelManager = new LevelManager(this.scene, this.physicsManager);
        
        // Setup lighting for the scene
        this.setupLighting();
        
        // Create player sphere mesh - will be positioned when level loads
        const playerGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        const playerMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF0000, // Bright red for high visibility - NFR-003
            roughness: 0.3,
            metalness: 0.5
        });
        this.playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.playerMesh.castShadow = true;
        this.playerMesh.receiveShadow = true;
        this.playerMesh.name = 'player';
        this.scene.add(this.playerMesh);
        
        // Player physics body will be created after level loads
        // Initialize player controller (physics body will be set when level loads)
        this.playerController = new PlayerController();
        this.playerController.setCamera(this.camera);
        
        // Connect physics manager with player controller for gravity updates
        this.physicsManager.setPlayerController(this.playerController);
        
        // Initialize camera controller - Requirement: PROD-009
        this.cameraController = new CameraController(this.camera, this.playerMesh);
        
        // Initialize UI manager - Requirement: USER-002
        this.uiManager = new UIManager();
        
        console.log('Game::initializeSystems - All systems initialized');
    }
    
    /**
     * Setup lighting for the scene
     * Requirement: NFR-003 - Visual Identity
     */
    setupLighting() {
        console.log('Game::setupLighting - Setting up scene lighting');
        
        // Add ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Add directional light for shadows and depth
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        console.log('Game::setupLighting - Lighting setup complete');
    }
    
    /**
     * Load a level from JSON
     * Requirement: ARCH-002 - Data-Driven Levels
     * @param {string} levelPath - Path to the level JSON file
     */
    async loadLevel(levelPath) {
        console.log('Game::loadLevel - Loading level:', levelPath);
        
        try {
            // Load the level using LevelManager
            await this.levelManager.load(levelPath);
            
            // Get player start position from level
            const startPos = this.levelManager.getPlayerStartPosition();
            
            // Create player physics body at start position
            const playerPhysicsBody = this.physicsManager.createPlayerBody(startPos);
            this.playerController.setPhysicsBody(playerPhysicsBody);
            
            // Position player mesh
            this.playerMesh.position.copy(startPos);
            
            // Update camera to look at player
            this.camera.position.set(
                startPos.x + 10,
                startPos.y + 10,
                startPos.z + 10
            );
            this.camera.lookAt(startPos);
            
            console.log('Game::loadLevel - Level loaded successfully');
            
            // Initialize game state with level settings
            if (this.levelManager.currentLevel?.gameSettings) {
                this.gameState.lives = this.levelManager.currentLevel.gameSettings.initialLives || 3;
            }
            
            // Initialize UI with current state
            if (this.uiManager) {
                this.uiManager.initialize(this.gameState, {
                    levelName: this.levelManager.currentLevel?.name,
                    keysCollected: this.levelManager.getGameState().keysCollected,
                    totalKeys: this.levelManager.getGameState().totalKeys
                });
            }
            
            // Dispatch level loaded event
            window.dispatchEvent(new CustomEvent('levelLoaded', {
                detail: {
                    levelName: this.levelManager.currentLevel?.name || 'Unknown'
                }
            }));
            
            // Expose level manager and game state to window for testing
            window.game = window.game || {};
            window.game.levelManager = this.levelManager;
            window.game.gameState = this.gameState;
            window.game.uiManager = this.uiManager;
            
        } catch (error) {
            console.error('Game::loadLevel - Failed to load level:', error);
        }
    }
    
    
    /**
     * Start the game loop
     * Requirement: NFR-001 - Maintain 60 FPS
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('Game::start - Starting game loop');
        this.animate();
    }
    
    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
        console.log('Game::stop - Game loop stopped');
    }
    
    /**
     * Main game loop using requestAnimationFrame
     * Requirement: NFR-001 - Performance: Frame Rate (60 FPS target)
     */
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        
        // Update game systems
        this.update(deltaTime, elapsedTime);
        
        // Render the scene
        this.render();
    }
    
    /**
     * Update game logic
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} elapsedTime - Total elapsed time in seconds
     */
    update(deltaTime, elapsedTime) {
        // Update player controller (handles input and applies forces)
        if (this.playerController) {
            this.playerController.update(deltaTime);
        }
        
        // Update physics simulation
        if (this.physicsManager) {
            this.physicsManager.update(deltaTime);
            
            // Sync visual mesh with physics body
            if (this.playerMesh && this.physicsManager.getPlayerBody()) {
                this.physicsManager.syncMeshWithBody(
                    this.playerMesh,
                    this.physicsManager.getPlayerBody()
                );
                
                // Check for collectibles and objectives - Requirements: PROD-004, PROD-005
                if (this.levelManager) {
                    this.levelManager.checkCollectibles(this.playerMesh.position);
                }
                
                // Check for fall condition - Requirement: PROD-006
                if (this.checkFallCondition()) {
                    this.handlePlayerFall();
                }
            }
        }
        
        // Update level manager (animations, etc) - Requirement: ARCH-002
        if (this.levelManager) {
            this.levelManager.update(deltaTime);
        }
        
        // Update camera controller - Requirement: PROD-009
        if (this.cameraController) {
            this.cameraController.update(deltaTime);
        }
    }
    
    /**
     * Render the scene
     * Requirement: TECH-P-002 - three.js rendering
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Check if player has fallen below threshold
     * Requirement: PROD-006 - Failure Condition: Falling
     * @returns {boolean} True if player has fallen
     */
    checkFallCondition() {
        if (!this.playerMesh || !this.levelManager || this.gameState.isRespawning) {
            return false;
        }
        
        const threshold = this.levelManager.getFallThreshold();
        return this.playerMesh.position.y < threshold;
    }
    
    /**
     * Handle player falling - lose life and reset position
     * Requirements: PROD-006, PROD-008 - Lives System
     */
    handlePlayerFall() {
        if (this.gameState.isRespawning) return;
        
        console.log('Game::handlePlayerFall - Player fell! Lives before:', this.gameState.lives);
        
        // Set respawning flag to prevent multiple triggers
        this.gameState.isRespawning = true;
        
        // Lose a life
        this.gameState.lives--;
        console.log('Game::handlePlayerFall - Life Lost! Lives remaining:', this.gameState.lives);
        
        // Dispatch life lost event
        window.dispatchEvent(new CustomEvent('lifeLost', {
            detail: {
                livesRemaining: this.gameState.lives,
                cause: 'fall'
            }
        }));
        
        // Check for game over
        if (this.gameState.lives <= 0) {
            this.handleGameOver();
            return;
        }
        
        // Reset player position
        this.resetPlayerPosition();
        
        // Clear respawning flag after a short delay
        setTimeout(() => {
            this.gameState.isRespawning = false;
        }, 500);
    }
    
    /**
     * Reset player to starting position
     * Requirement: PROD-006 - Player reset after falling
     */
    resetPlayerPosition() {
        const startPos = this.levelManager.getPlayerStartPosition();
        console.log('Game::resetPlayerPosition - Resetting player to:', startPos);
        
        // Reset physics body
        const playerBody = this.physicsManager.getPlayerBody();
        if (playerBody) {
            playerBody.position.set(startPos.x, startPos.y, startPos.z);
            playerBody.velocity.set(0, 0, 0);
            playerBody.angularVelocity.set(0, 0, 0);
        }
        
        // Reset visual mesh
        if (this.playerMesh) {
            this.playerMesh.position.copy(startPos);
            this.playerMesh.rotation.set(0, 0, 0);
        }
        
        // Reset camera
        if (this.camera) {
            this.camera.position.set(
                startPos.x + 10,
                startPos.y + 10,
                startPos.z + 10
            );
            this.camera.lookAt(startPos);
        }
        
        // Reset gravity to default
        if (this.playerController) {
            this.playerController.setGravityDirection(new THREE.Vector3(0, -1, 0));
        }
        
        console.log('Game::resetPlayerPosition - Player reset complete');
    }
    
    /**
     * Handle game over state
     * Requirement: PROD-008 - Game Over state
     */
    handleGameOver() {
        console.log('Game::handleGameOver - GAME OVER!');
        this.gameState.isRespawning = true; // Prevent further updates
        
        // Dispatch game over event
        window.dispatchEvent(new CustomEvent('gameOver', {
            detail: {
                finalScore: this.gameState.score,
                levelReached: this.levelManager.currentLevel?.name
            }
        }));
        
        // Could show game over screen here
        // For now, just stop the game
        this.stop();
    }
    
    /**
     * Handle window resize events
     */
    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
        console.log(`Game::handleResize - Resized to ${width}x${height}`);
    }
}