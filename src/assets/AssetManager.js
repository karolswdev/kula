/**
 * AssetManager.js
 * 
 * Manages loading and caching of 3D model assets (.glb files) using Three.js GLTFLoader.
 * Fulfills requirements: NFR-004 - Asset Loading & Instancing
 * 
 * This manager ensures that each model is loaded only once from the network,
 * then cached in memory for efficient instancing when placing multiple copies.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class AssetManager {
    constructor() {
        // Cache for loaded models
        this.modelCache = new Map();
        
        // GLTF loader instance
        this.gltfLoader = new GLTFLoader();
        
        // Loading state tracking
        this.loadingQueue = new Map(); // Track in-progress loads to prevent duplicate requests
        
        // Statistics for tracking efficiency
        this.stats = {
            totalLoads: 0,
            cacheHits: 0,
            networkLoads: 0
        };
        
        console.log('AssetManager: Initialized with GLTFLoader');
    }
    
    /**
     * Preload a list of model files
     * @param {Array<string>} modelPaths - Array of paths to .glb files
     * @returns {Promise<void>} Resolves when all models are loaded
     */
    async preloadModels(modelPaths) {
        console.log(`AssetManager: Preloading ${modelPaths.length} models...`);
        
        const loadPromises = modelPaths.map(path => this.loadModel(path));
        await Promise.all(loadPromises);
        
        console.log(`AssetManager: Preloading complete. Cache size: ${this.modelCache.size}`);
        this.logStats();
    }
    
    /**
     * Load a single model file
     * @param {string} modelPath - Path to the .glb file
     * @returns {Promise<THREE.Group>} The loaded model scene
     */
    async loadModel(modelPath) {
        // Check if model is already cached
        if (this.modelCache.has(modelPath)) {
            this.stats.cacheHits++;
            console.log(`AssetManager: Cache hit for '${modelPath}'`);
            return this.modelCache.get(modelPath);
        }
        
        // Check if model is currently being loaded
        if (this.loadingQueue.has(modelPath)) {
            console.log(`AssetManager: Already loading '${modelPath}', waiting...`);
            return this.loadingQueue.get(modelPath);
        }
        
        // Create loading promise
        const loadPromise = new Promise((resolve, reject) => {
            console.log(`AssetManager: Loading model from network: '${modelPath}'`);
            this.stats.networkLoads++;
            
            this.gltfLoader.load(
                modelPath,
                (gltf) => {
                    // Successfully loaded
                    console.log(`AssetManager: Successfully loaded '${modelPath}'`);
                    
                    // Store the entire scene in cache
                    const model = gltf.scene;
                    
                    // Traverse and prepare materials for instancing
                    model.traverse((child) => {
                        if (child.isMesh) {
                            // Enable shadows
                            child.castShadow = true;
                            child.receiveShadow = true;
                            
                            // Store original material for cloning
                            if (child.material) {
                                child.userData.originalMaterial = child.material.clone();
                            }
                        }
                    });
                    
                    this.modelCache.set(modelPath, model);
                    this.loadingQueue.delete(modelPath);
                    this.stats.totalLoads++;
                    
                    resolve(model);
                },
                (progress) => {
                    // Loading progress
                    const percentComplete = (progress.loaded / progress.total * 100).toFixed(2);
                    console.log(`AssetManager: Loading '${modelPath}' - ${percentComplete}%`);
                },
                (error) => {
                    // Loading error
                    console.error(`AssetManager: Failed to load '${modelPath}':`, error);
                    this.loadingQueue.delete(modelPath);
                    reject(error);
                }
            );
        });
        
        // Add to loading queue
        this.loadingQueue.set(modelPath, loadPromise);
        
        return loadPromise;
    }
    
    /**
     * Get a clone/instance of a cached model
     * @param {string} modelPath - Path to the .glb file
     * @returns {THREE.Group|null} A clone of the cached model, or null if not cached
     */
    getInstance(modelPath) {
        if (!this.modelCache.has(modelPath)) {
            console.warn(`AssetManager: Model '${modelPath}' not in cache. Load it first.`);
            return null;
        }
        
        const cachedModel = this.modelCache.get(modelPath);
        
        // Clone the cached model for instancing
        const instance = cachedModel.clone();
        
        // Clone materials to allow per-instance customization if needed
        instance.traverse((child) => {
            if (child.isMesh && child.userData.originalMaterial) {
                child.material = child.userData.originalMaterial.clone();
            }
        });
        
        console.log(`AssetManager: Created instance of '${modelPath}'`);
        
        return instance;
    }
    
    /**
     * Get or load a model, then return an instance
     * @param {string} modelPath - Path to the .glb file
     * @returns {Promise<THREE.Group>} An instance of the model
     */
    async getOrLoadInstance(modelPath) {
        // Ensure model is loaded
        await this.loadModel(modelPath);
        
        // Return an instance
        return this.getInstance(modelPath);
    }
    
    /**
     * Clear the model cache
     */
    clearCache() {
        // Dispose of cached models to free memory
        this.modelCache.forEach((model, path) => {
            model.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => mat.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
        });
        
        this.modelCache.clear();
        console.log('AssetManager: Cache cleared');
    }
    
    /**
     * Get cache statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            ...this.stats,
            cacheSize: this.modelCache.size,
            cachedModels: Array.from(this.modelCache.keys())
        };
    }
    
    /**
     * Log current statistics
     */
    logStats() {
        console.log('AssetManager Statistics:');
        console.log(`  Total loads: ${this.stats.totalLoads}`);
        console.log(`  Network loads: ${this.stats.networkLoads}`);
        console.log(`  Cache hits: ${this.stats.cacheHits}`);
        console.log(`  Cache size: ${this.modelCache.size} models`);
        console.log(`  Cache efficiency: ${(this.stats.cacheHits / (this.stats.cacheHits + this.stats.networkLoads) * 100).toFixed(1)}%`);
    }
    
    /**
     * Check if a model is cached
     * @param {string} modelPath - Path to the .glb file
     * @returns {boolean} True if model is in cache
     */
    isCached(modelPath) {
        return this.modelCache.has(modelPath);
    }
    
    /**
     * Get list of all cached model paths
     * @returns {Array<string>} Array of cached model paths
     */
    getCachedModelPaths() {
        return Array.from(this.modelCache.keys());
    }
}

// Export as singleton
const assetManager = new AssetManager();
export default assetManager;