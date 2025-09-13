/**
 * Main Game class - orchestrates the game loop and coordinates all systems
 * Requirements: TECH-P-002, ARCH-001
 */

export class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        this.isRunning = false;
        
        // Container for the canvas
        this.container = document.getElementById('game-container');
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
        
        // Setup the static level elements
        this.setupLevel();
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        console.log('Game::initialize - Three.js scene initialized successfully');
    }
    
    /**
     * Setup the static level with floor, player, and lights
     * Requirements: TECH-P-002, NFR-003 (Visual Identity)
     */
    setupLevel() {
        console.log('Game::setupLevel - Creating level elements');
        
        // Create floor plane - Requirement: PROD-011 (Modular Blocks)
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080, // Gray floor for contrast
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2; // Rotate to horizontal
        floor.position.y = 0;
        floor.receiveShadow = true;
        floor.name = 'floor';
        this.scene.add(floor);
        console.log('Game::setupLevel - Floor created at position:', floor.position);
        
        // Create player sphere - Requirements: NFR-003 (bright, distinguishable)
        const playerGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        const playerMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF0000, // Bright red for high visibility
            roughness: 0.3,
            metalness: 0.5
        });
        this.playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.playerMesh.position.set(0, 0.5, 0); // Start at center, half-radius above floor
        this.playerMesh.castShadow = true;
        this.playerMesh.receiveShadow = true;
        this.playerMesh.name = 'player';
        this.scene.add(this.playerMesh);
        console.log('Game::setupLevel - Player sphere created at position:', this.playerMesh.position);
        
        // Add ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        console.log('Game::setupLevel - Ambient light added');
        
        // Add directional light for shadows and depth
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        console.log('Game::setupLevel - Directional light added at position:', directionalLight.position);
        
        // Log scene contents for verification
        console.log('Game::setupLevel - Scene contains', this.scene.children.length, 'objects');
        this.scene.children.forEach(child => {
            if (child.name) {
                console.log(`  - ${child.name}: type=${child.type}, position=(${child.position.x}, ${child.position.y}, ${child.position.z})`);
            }
        });
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
        // Placeholder for game updates
        // Will be expanded with PlayerController, PhysicsManager, etc.
    }
    
    /**
     * Render the scene
     * Requirement: TECH-P-002 - three.js rendering
     */
    render() {
        this.renderer.render(this.scene, this.camera);
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