/**
 * Minimal GLTFLoader stub for Three.js
 * This provides a fallback when the actual GLTFLoader isn't available
 * Real GLTFLoader would be loaded from Three.js examples
 */

(function() {
    if (typeof THREE === 'undefined') {
        console.error('THREE is not defined. GLTFLoader requires Three.js');
        return;
    }

    /**
     * Stub GLTFLoader that creates placeholder geometry
     * Replace this with actual GLTFLoader from Three.js examples in production
     */
    THREE.GLTFLoader = function() {
        this.load = function(url, onLoad, onProgress, onError) {
            console.log(`GLTFLoader stub: Loading ${url}`);
            
            // Create a placeholder mesh based on the filename
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            let color = 0x808080;
            
            // Vary color based on asset type (from filename)
            if (url.includes('Rock')) color = 0x666666;
            else if (url.includes('Grass')) color = 0x4a7c59;
            else if (url.includes('Tree')) color = 0x8b4513;
            else if (url.includes('Bush')) color = 0x228b22;
            else if (url.includes('Coin')) color = 0xffd700;
            else if (url.includes('Stone')) color = 0x8b8680;
            else if (url.includes('Brick')) color = 0x8b4513;
            
            const material = new THREE.MeshStandardMaterial({ 
                color: color,
                metalness: 0.3,
                roughness: 0.7
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            const scene = new THREE.Group();
            scene.add(mesh);
            
            // Simulate async loading
            setTimeout(() => {
                if (onLoad) {
                    onLoad({ 
                        scene: scene,
                        scenes: [scene],
                        animations: [],
                        cameras: [],
                        asset: {},
                        parser: null,
                        userData: {}
                    });
                }
            }, 10);
        };
    };

    console.log('GLTFLoader stub initialized');
})();