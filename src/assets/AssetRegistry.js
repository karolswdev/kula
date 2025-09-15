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
     * Fulfills requirements: ARCH-007, PROD-016
     */
    initializeNatureTheme() {
        const natureDefinitions = new Map();
        
        // Standard platform block - mapped to Rock Medium as per requirements
        natureDefinitions.set('standard_platform', {
            model: 'assets/Rock Medium.glb',
            physics: {
                shape: 'Box',
                dimensions: [2, 2, 2] // Half-extents for CANNON.Box
            },
            gridFootprint: [1, 1, 1]
        });
        
        // Brick wall block - mapped to Cube Bricks
        natureDefinitions.set('brick_wall', {
            model: 'assets/Cube Bricks.glb',
            physics: {
                shape: 'Box',
                dimensions: [2, 2, 2] // Simplified box collider
            },
            gridFootprint: [1, 1, 1]
        });
        
        // Decorative bush - non-collidable decoration
        natureDefinitions.set('decorative_bush', {
            model: 'assets/Bush.glb',
            physics: {
                shape: 'Box',
                dimensions: [1, 1, 1], // Smaller collider for decoration
                isTrigger: true // Non-blocking decoration
            },
            gridFootprint: [1, 1, 1],
            behavior: 'decoration'
        });
        
        // Stone platform block
        natureDefinitions.set('stone_platform', {
            model: 'assets/Stone Platform.glb',
            physics: {
                shape: 'Box',
                dimensions: [2, 2, 2] // Half-extents for CANNON.Box
            },
            gridFootprint: [1, 1, 1]
        });
        
        // Grass platform
        natureDefinitions.set('grass_platform', {
            model: 'assets/Grass Platform.glb',
            physics: {
                shape: 'Box',
                dimensions: [2, 2, 2]
            },
            gridFootprint: [1, 1, 1]
        });
        
        // Hazard - spike trap
        natureDefinitions.set('hazard', {
            model: 'assets/Hazard Spike Trap.glb',
            physics: {
                shape: 'Box',
                dimensions: [2, 1, 2], // Lower height for spike trap
                isTrigger: true // This is a trigger zone, not solid collision
            },
            gridFootprint: [1, 1, 1],
            behavior: 'hazard'
        });
        
        // Tree decoration (standard tree) - mapped to Tree.glb
        natureDefinitions.set('tree', {
            model: 'assets/Tree.glb',
            physics: {
                shape: 'Box',
                dimensions: [1, 4, 1], // Tall collider for tree trunk
            },
            gridFootprint: [1, 2, 1],
            behavior: 'decoration'
        });
        
        // Pine tree decoration variant - mapped to Pine Tree.glb
        natureDefinitions.set('pine_tree', {
            model: 'assets/Pine Tree.glb',
            physics: {
                shape: 'Box',
                dimensions: [1, 4, 1], // Tall collider for pine tree
            },
            gridFootprint: [1, 2, 1],
            behavior: 'decoration'
        });
        
        // Fern decoration - mapped to Fern.glb
        natureDefinitions.set('fern', {
            model: 'assets/Fern.glb',
            physics: {
                shape: 'Box',
                dimensions: [0.5, 0.5, 0.5], // Small collider
                isTrigger: true // Non-blocking decoration
            },
            gridFootprint: [1, 1, 1],
            behavior: 'decoration'
        });
        
        // Flower decoration - mapped to Flower Single.glb
        natureDefinitions.set('flower', {
            model: 'assets/Flower Single.glb',
            physics: {
                shape: 'Box',
                dimensions: [0.5, 0.5, 0.5], // Small collider
                isTrigger: true // Non-blocking decoration
            },
            gridFootprint: [1, 1, 1],
            behavior: 'decoration'
        });
        
        // Mushroom decoration - mapped to Mushroom.glb
        natureDefinitions.set('mushroom', {
            model: 'assets/Mushroom.glb',
            physics: {
                shape: 'Box',
                dimensions: [0.5, 0.5, 0.5], // Small collider
                isTrigger: true // Non-blocking decoration
            },
            gridFootprint: [1, 1, 1],
            behavior: 'decoration'
        });
        
        // Flower decoration
        natureDefinitions.set('flower_decoration', {
            model: 'assets/Flower Single.glb',
            physics: {
                shape: 'Box',
                dimensions: [0.5, 0.5, 0.5], // Small collider
                isTrigger: true // Non-blocking decoration
            },
            gridFootprint: [1, 1, 1],
            behavior: 'decoration'
        });
        
        // Tree decoration (standard tree)
        natureDefinitions.set('tree_decoration', {
            model: 'assets/Tree.glb',
            physics: {
                shape: 'Box',
                dimensions: [1, 4, 1], // Tall collider for tree trunk
            },
            gridFootprint: [1, 2, 1],
            behavior: 'decoration'
        });
        
        // Pine tree decoration variant
        natureDefinitions.set('pine_tree_decoration', {
            model: 'assets/Pine Tree.glb',
            physics: {
                shape: 'Box',
                dimensions: [1, 4, 1], // Tall collider for pine tree
            },
            gridFootprint: [1, 2, 1],
            behavior: 'decoration'
        });
        
        // Fern decoration
        natureDefinitions.set('fern_decoration', {
            model: 'assets/Fern.glb',
            physics: {
                shape: 'Box',
                dimensions: [0.5, 0.5, 0.5], // Small collider
                isTrigger: true // Non-blocking decoration
            },
            gridFootprint: [1, 1, 1],
            behavior: 'decoration'
        });
        
        // Mushroom decoration
        natureDefinitions.set('mushroom_decoration', {
            model: 'assets/Mushroom.glb',
            physics: {
                shape: 'Box',
                dimensions: [0.5, 0.5, 0.5], // Small collider
                isTrigger: true // Non-blocking decoration
            },
            gridFootprint: [1, 1, 1],
            behavior: 'decoration'
        });
        
        // Grass decoration
        natureDefinitions.set('grass_decoration', {
            model: 'assets/Grass.glb',
            physics: {
                shape: 'Box',
                dimensions: [0.5, 0.3, 0.5], // Very low collider
                isTrigger: true // Non-blocking decoration
            },
            gridFootprint: [1, 1, 1],
            behavior: 'decoration'
        });
        
        // Keep legacy mappings for backwards compatibility
        natureDefinitions.set('standard', natureDefinitions.get('standard_platform'));
        natureDefinitions.set('nature_rock_platform', natureDefinitions.get('decorative_rock'));
        natureDefinitions.set('nature_rock_large', {
            model: 'assets/Rock Large.glb',
            physics: {
                shape: 'Box',
                dimensions: [4, 2, 4] // Larger footprint
            },
            gridFootprint: [2, 1, 2]
        });
        natureDefinitions.set('brick_cube', {
            model: 'assets/Cube Bricks.glb',
            physics: {
                shape: 'Box',
                dimensions: [2, 2, 2]
            },
            gridFootprint: [1, 1, 1]
        });
        natureDefinitions.set('hazard_spike', natureDefinitions.get('hazard'));
        
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
    
    /**
     * Get theme definitions for testing and inspection
     * @param {string} themeName - The name of the theme
     * @returns {Map|null} The theme definitions map
     */
    getThemeDefinitions(themeName) {
        return this.themes.get(themeName);
    }
}

// Export as singleton
const assetRegistry = new AssetRegistry();
export default assetRegistry;