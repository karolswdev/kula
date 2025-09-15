/**
 * ThemeManager.js
 * 
 * Manages theme switching and provides themed asset resolution.
 * Works in conjunction with AssetRegistry to apply theme-specific asset mappings.
 * Fulfills requirements: ARCH-007, PROD-016
 * 
 * The ThemeManager provides a high-level interface for theme management,
 * allowing the game to switch between different visual themes and retrieve
 * appropriately themed assets for any given block type.
 */

import assetRegistry from '../assets/AssetRegistry.js';

class ThemeManager {
    constructor() {
        // Track the current active theme
        this.currentTheme = 'nature'; // Default theme
        
        // Available themes registry
        this.availableThemes = new Set(['nature']);
        
        // Theme metadata for UI/display purposes
        this.themeMetadata = new Map([
            ['nature', {
                name: 'The Verdant Ruins',
                description: 'A lush, overgrown environment with ancient stone structures',
                primaryColors: ['#4a7c59', '#8b5a3c', '#a8d5ba']
            }]
        ]);
    }
    
    /**
     * Set the active theme
     * @param {string} themeName - The name of the theme to activate
     * @returns {boolean} True if theme was successfully set, false otherwise
     */
    setTheme(themeName) {
        if (!this.availableThemes.has(themeName)) {
            console.warn(`ThemeManager: Theme '${themeName}' is not available`);
            return false;
        }
        
        // Update AssetRegistry's theme
        assetRegistry.setTheme(themeName);
        
        // Update our current theme tracking
        this.currentTheme = themeName;
        
        console.log(`ThemeManager: Theme set to '${themeName}'`);
        
        // Dispatch theme change event for UI updates
        this.dispatchThemeChangeEvent(themeName);
        
        return true;
    }
    
    /**
     * Get the current active theme
     * @returns {string} The name of the current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    /**
     * Get the active theme (alias for getCurrentTheme for API compatibility)
     * @returns {string} The name of the current theme
     */
    getActiveTheme() {
        return this.currentTheme;
    }
    
    /**
     * Get a themed asset for a specific block type
     * @param {string} blockType - The logical block type
     * @returns {Object|null} The themed asset definition
     */
    getThemedAsset(blockType) {
        // Delegate to AssetRegistry which handles the actual mapping
        const definition = assetRegistry.getBlockDefinition(blockType);
        
        if (!definition) {
            console.warn(`ThemeManager: No themed asset found for block type '${blockType}' in theme '${this.currentTheme}'`);
            return null;
        }
        
        // Enhance the definition with theme metadata
        return {
            ...definition,
            theme: this.currentTheme,
            themeMetadata: this.themeMetadata.get(this.currentTheme)
        };
    }
    
    /**
     * Get the model path for a themed block type
     * @param {string} blockType - The logical block type
     * @returns {string|null} The path to the 3D model
     */
    getThemedModelPath(blockType) {
        const asset = this.getThemedAsset(blockType);
        return asset ? asset.model : null;
    }
    
    /**
     * Get physics configuration for a themed block type
     * @param {string} blockType - The logical block type
     * @returns {Object|null} The physics configuration
     */
    getThemedPhysics(blockType) {
        const asset = this.getThemedAsset(blockType);
        return asset ? asset.physics : null;
    }
    
    /**
     * Get all available themes
     * @returns {Array<string>} List of available theme names
     */
    getAvailableThemes() {
        return Array.from(this.availableThemes);
    }
    
    /**
     * Get metadata for a specific theme
     * @param {string} themeName - The name of the theme
     * @returns {Object|null} Theme metadata object
     */
    getThemeMetadata(themeName) {
        return this.themeMetadata.get(themeName) || null;
    }
    
    /**
     * Check if a theme is available
     * @param {string} themeName - The name of the theme to check
     * @returns {boolean} True if the theme is available
     */
    hasTheme(themeName) {
        return this.availableThemes.has(themeName);
    }
    
    /**
     * Register a new theme (for future extensibility)
     * @param {string} themeName - The name of the theme
     * @param {Object} metadata - Theme metadata
     */
    registerTheme(themeName, metadata) {
        this.availableThemes.add(themeName);
        this.themeMetadata.set(themeName, metadata);
        console.log(`ThemeManager: Registered new theme '${themeName}'`);
    }
    
    /**
     * Dispatch a custom event when theme changes
     * @param {string} themeName - The new theme name
     */
    dispatchThemeChangeEvent(themeName) {
        if (typeof window !== 'undefined') {
            const event = new CustomEvent('themeChanged', {
                detail: {
                    theme: themeName,
                    metadata: this.getThemeMetadata(themeName)
                }
            });
            window.dispatchEvent(event);
        }
    }
    
    /**
     * Resolve a block type to its themed variant
     * This allows for theme-specific block type overrides
     * @param {string} blockType - The base block type
     * @returns {string} The themed block type (may be the same as input)
     */
    resolveThemedBlockType(blockType) {
        // For now, return the block type as-is
        // In the future, this could map generic types to theme-specific variants
        // e.g., 'platform' -> 'grass_platform' in nature theme
        return blockType;
    }
    
    /**
     * Get all block types available in the current theme
     * @returns {Array<string>} List of block type identifiers
     */
    getAvailableBlockTypes() {
        return assetRegistry.getAvailableBlockTypes();
    }
    
    /**
     * Preload all assets for a theme (for performance)
     * @param {string} themeName - The theme to preload
     * @returns {Promise} Promise that resolves when all assets are loaded
     */
    async preloadThemeAssets(themeName) {
        // This would integrate with a proper asset loading system
        // For now, we'll just log the intent
        console.log(`ThemeManager: Preloading assets for theme '${themeName}'`);
        
        // In a real implementation, this would:
        // 1. Get all block definitions for the theme
        // 2. Extract all unique model paths
        // 3. Trigger loading of those models
        // 4. Return a promise that resolves when all are loaded
        
        return Promise.resolve();
    }
}

// Export as singleton
const themeManager = new ThemeManager();
export default themeManager;