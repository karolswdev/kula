/**
 * AssetRegistry.js
 * 
 * Centralized registry that maps logical block types to their visual models and physics shapes.
 * Fulfills requirements: ARCH-004, PROD-014
 * 
 * The registry decouples the logical representation of blocks from their physical implementation,
 * enabling theming, asset normalization, and performance optimization through simplified collision geometry.
 */

import * as CANNON from 'cannon-es';

class AssetRegistry {
    constructor() {
        // Initialize the registry with hardcoded definitions for different themes
        this.registry = new Map();
        this.themes = new Map();
        
        // Initialize with nature theme definitions
        this.initializeNatureTheme();
        
        // Set default theme
        this.currentTheme = 'nature';
    }
    
    /**
     * Initialize definitions for the nature theme
     * Maps logical block types to their visual models and physics primitives
     */
    initializeNatureTheme() {
        const natureDefinitions = new Map();
        
        // Standard platform block in nature theme
        natureDefinitions.set('standard', {
            model: 'assets/Stone Platform.glb',
            physics: {
                shape: 'Box',
                dimensions: [2, 2, 2] // Half-extents for CANNON.Box
            },
            gridFootprint: [1, 1, 1]
        });
        
        // Rock platform variant
        natureDefinitions.set('nature_rock_platform', {
            model: 'assets/Rock Medium.glb',
            physics: {
                shape: 'Box',
                dimensions: [2, 2, 2] // Simplified box collider for complex rock model
            },
            gridFootprint: [1, 1, 1]
        });
        
        // Large rock variant
        natureDefinitions.set('nature_rock_large', {
            model: 'assets/Rock Large.glb',
            physics: {
                shape: 'Box',
                dimensions: [4, 2, 4] // Larger footprint
            },
            gridFootprint: [2, 1, 2]
        });
        
        // Brick cube variant
        natureDefinitions.set('brick_cube', {
            model: 'assets/Cube Bricks.glb',
            physics: {
                shape: 'Box',
                dimensions: [2, 2, 2]
            },
            gridFootprint: [1, 1, 1]
        });
        
        // Hazard spike trap
        natureDefinitions.set('hazard_spike', {
            model: 'assets/Hazard Spike Trap.glb',
            physics: {
                shape: 'Box',
                dimensions: [2, 1, 2], // Lower height for spike trap
                isTrigger: true // This is a trigger zone, not solid collision
            },
            gridFootprint: [1, 1, 1],
            behavior: 'hazard'
        });
        
        this.themes.set('nature', natureDefinitions);
    }
    
    /**
     * Get the definition for a specific block type
     * @param {string} blockType - The logical block type identifier
     * @returns {Object|null} The block definition containing model path and physics info
     */
    getBlockDefinition(blockType) {
        const themeDefinitions = this.themes.get(this.currentTheme);
        if (!themeDefinitions) {
            console.warn(`Theme '${this.currentTheme}' not found in registry`);
            return null;
        }
        
        const definition = themeDefinitions.get(blockType);
        if (!definition) {
            console.warn(`Block type '${blockType}' not found in theme '${this.currentTheme}'`);
            // Return a default fallback definition
            return this.getDefaultDefinition();
        }
        
        return definition;
    }
    
    /**
     * Get default block definition as fallback
     * @returns {Object} A basic cube definition
     */
    getDefaultDefinition() {
        return {
            model: 'assets/Cube Bricks.glb',
            physics: {
                shape: 'Box',
                dimensions: [2, 2, 2]
            },
            gridFootprint: [1, 1, 1]
        };
    }
    
    /**
     * Set the current theme
     * @param {string} themeName - The name of the theme to activate
     */
    setTheme(themeName) {
        if (this.themes.has(themeName)) {
            this.currentTheme = themeName;
            console.log(`AssetRegistry: Theme switched to '${themeName}'`);
        } else {
            console.warn(`AssetRegistry: Theme '${themeName}' not found`);
        }
    }
    
    /**
     * Create a physics shape based on the definition
     * @param {Object} physicsConfig - The physics configuration from block definition
     * @returns {CANNON.Shape} The created physics shape
     */
    createPhysicsShape(physicsConfig) {
        switch (physicsConfig.shape) {
            case 'Box':
                return new CANNON.Box(
                    new CANNON.Vec3(
                        physicsConfig.dimensions[0],
                        physicsConfig.dimensions[1],
                        physicsConfig.dimensions[2]
                    )
                );
            case 'Sphere':
                return new CANNON.Sphere(physicsConfig.radius || 1);
            default:
                // Default to box shape
                console.warn(`Unknown physics shape '${physicsConfig.shape}', defaulting to Box`);
                return new CANNON.Box(new CANNON.Vec3(2, 2, 2));
        }
    }
    
    /**
     * Get all available block types for the current theme
     * @returns {Array<string>} List of block type identifiers
     */
    getAvailableBlockTypes() {
        const themeDefinitions = this.themes.get(this.currentTheme);
        return themeDefinitions ? Array.from(themeDefinitions.keys()) : [];
    }
}

// Export as singleton
const assetRegistry = new AssetRegistry();
export default assetRegistry;