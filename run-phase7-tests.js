/**
 * Node.js test runner for PHASE-7 tests
 * This script runs the test cases and outputs results to console
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up global THREE and CANNON
global.THREE = {
    Vector3: class Vector3 {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        copy(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        }
    },
    Vector2: class Vector2 {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
    },
    BoxGeometry: class BoxGeometry {
        constructor(width, height, depth) {
            this.width = width;
            this.height = height;
            this.depth = depth;
        }
        dispose() {}
    },
    MeshStandardMaterial: class MeshStandardMaterial {
        constructor(params) {
            this.color = params.color;
            this.roughness = params.roughness;
            this.metalness = params.metalness;
        }
        dispose() {}
    },
    Mesh: class Mesh {
        constructor(geometry, material) {
            this.geometry = geometry;
            this.material = material;
            this.position = new global.THREE.Vector3();
            this.rotation = new global.THREE.Vector3();
            this.scale = new global.THREE.Vector3(1, 1, 1);
            this.userData = {};
            this.name = '';
            this.castShadow = false;
            this.receiveShadow = false;
        }
    },
    TorusGeometry: class TorusGeometry {
        constructor() {}
        dispose() {}
    },
    CylinderGeometry: class CylinderGeometry {
        constructor() {}
        dispose() {}
    }
};

global.CANNON = {
    Vec3: class Vec3 {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    },
    Box: class Box {
        constructor(halfExtents) {
            this.halfExtents = halfExtents;
            this.type = 'Box';
        }
    },
    Sphere: class Sphere {
        constructor(radius) {
            this.radius = radius;
            this.type = 'Sphere';
        }
    },
    World: class World {
        constructor() {}
        remove() {}
    },
    Body: class Body {
        constructor(options) {
            this.mass = options?.mass || 0;
        }
    }
};

// Mock fetch for loading JSON files
global.fetch = async function(path) {
    const fs = require('fs');
    const filePath = join(__dirname, path.replace(/^\//, ''));
    
    return {
        json: async () => {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    };
};

// Import and run tests
import { runStory71Tests } from './tests/test-grid-system.js';

console.log('========================================');
console.log('PHASE 7 - STORY 7.1 TEST EXECUTION');
console.log('========================================');
console.log('Date:', new Date().toISOString());
console.log('========================================\n');

// Run the tests
runStory71Tests().then(result => {
    console.log('\n========================================');
    console.log('TEST EXECUTION COMPLETE');
    console.log(`Overall Result: ${result ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);
    console.log('========================================');
    process.exit(result ? 0 : 1);
}).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});