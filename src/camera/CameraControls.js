/**
 * CameraControls - Handles user input for camera rotation (mouse drag and keyboard)
 * Requirements: USER-001 (Input: Player Control), PROD-009 (Camera System)
 * 
 * This module provides:
 * - Mouse drag rotation around the player
 * - Q/E keyboard rotation
 * - Mouse wheel zoom control
 * - Smooth rotation that respects gravity orientation
 */

export class CameraControls {
    constructor(camera, target, domElement) {
        this.camera = camera;
        this.target = target; // The object to orbit around (player)
        this.domElement = domElement || document;
        
        // Camera spherical coordinates (relative to target)
        this.spherical = {
            radius: 15,     // Distance from target
            theta: Math.PI / 4,    // Horizontal angle (azimuth)
            phi: Math.PI / 3      // Vertical angle (polar)
        };
        
        // Limits
        this.minRadius = 5;
        this.maxRadius = 30;
        this.minPhi = 0.1;  // Prevent looking straight down
        this.maxPhi = Math.PI - 0.1;  // Prevent looking straight up
        
        // Control sensitivity
        this.rotateSpeed = 0.5;
        this.zoomSpeed = 1.2;
        this.keyboardRotateSpeed = 2.0; // radians per second
        
        // Mouse state
        this.isMouseDown = false;
        this.mouseStart = { x: 0, y: 0 };
        this.sphericalDelta = { theta: 0, phi: 0 };
        
        // Keyboard state
        this.keys = {
            rotateLeft: false,  // Q
            rotateRight: false  // E
        };
        
        // Current gravity up vector (for proper rotation axis)
        this.upVector = new THREE.Vector3(0, 1, 0);
        
        // Enable/disable controls
        this.enabled = true;
        
        // Smooth transitions
        this.dampingFactor = 0.1;
        
        // Bind event handlers
        this.bindEvents();
        
        console.log('CameraControls::constructor - Initialized with spherical coords:', this.spherical);
    }
    
    /**
     * Bind mouse and keyboard events
     */
    bindEvents() {
        // Mouse events
        this.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.domElement.addEventListener('mouseleave', (e) => this.onMouseUp(e));
        
        // Mouse wheel for zoom
        this.domElement.addEventListener('wheel', (e) => this.onMouseWheel(e));
        
        // Keyboard events
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Prevent context menu on right click
        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    /**
     * Handle mouse down - start dragging
     */
    onMouseDown(event) {
        if (!this.enabled || event.button !== 0) return; // Only left mouse button
        
        event.preventDefault();
        
        this.isMouseDown = true;
        this.mouseStart.x = event.clientX;
        this.mouseStart.y = event.clientY;
        
        // Change cursor to indicate dragging
        this.domElement.style.cursor = 'grabbing';
    }
    
    /**
     * Handle mouse move - rotate camera if dragging
     */
    onMouseMove(event) {
        if (!this.enabled || !this.isMouseDown) return;
        
        event.preventDefault();
        
        const deltaX = event.clientX - this.mouseStart.x;
        const deltaY = event.clientY - this.mouseStart.y;
        
        // Convert pixel movement to spherical coordinate deltas
        const rotateSpeed = this.rotateSpeed * 0.005;
        this.sphericalDelta.theta -= deltaX * rotateSpeed;
        this.sphericalDelta.phi -= deltaY * rotateSpeed;
        
        // Update mouse position for next frame
        this.mouseStart.x = event.clientX;
        this.mouseStart.y = event.clientY;
    }
    
    /**
     * Handle mouse up - stop dragging
     */
    onMouseUp(event) {
        if (!this.enabled) return;
        
        this.isMouseDown = false;
        this.domElement.style.cursor = 'grab';
    }
    
    /**
     * Handle mouse wheel - zoom in/out
     */
    onMouseWheel(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        // Zoom based on wheel delta
        if (event.deltaY < 0) {
            this.spherical.radius /= this.zoomSpeed;
        } else {
            this.spherical.radius *= this.zoomSpeed;
        }
        
        // Clamp radius to limits
        this.spherical.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.spherical.radius));
        
        console.log(`CameraControls: Zoom - radius: ${this.spherical.radius.toFixed(1)}`);
    }
    
    /**
     * Handle key down events
     */
    onKeyDown(event) {
        if (!this.enabled) return;
        
        switch(event.key.toLowerCase()) {
            case 'q':
                this.keys.rotateLeft = true;
                event.preventDefault();
                break;
            case 'e':
                this.keys.rotateRight = true;
                event.preventDefault();
                break;
        }
    }
    
    /**
     * Handle key up events
     */
    onKeyUp(event) {
        switch(event.key.toLowerCase()) {
            case 'q':
                this.keys.rotateLeft = false;
                break;
            case 'e':
                this.keys.rotateRight = false;
                break;
        }
    }
    
    /**
     * Update camera position based on controls
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (!this.enabled || !this.target) return;
        
        // Apply keyboard rotation
        if (this.keys.rotateLeft) {
            this.sphericalDelta.theta += this.keyboardRotateSpeed * deltaTime;
        }
        if (this.keys.rotateRight) {
            this.sphericalDelta.theta -= this.keyboardRotateSpeed * deltaTime;
        }
        
        // Apply spherical deltas with damping
        this.spherical.theta += this.sphericalDelta.theta;
        this.spherical.phi += this.sphericalDelta.phi;
        
        // Clamp phi to prevent flipping
        this.spherical.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this.spherical.phi));
        
        // Dampen the deltas for smooth motion
        this.sphericalDelta.theta *= (1 - this.dampingFactor);
        this.sphericalDelta.phi *= (1 - this.dampingFactor);
        
        // Convert spherical coordinates to Cartesian
        const position = this.sphericalToCartesian();
        
        // Update camera position relative to target
        if (this.target.position) {
            this.camera.position.copy(this.target.position).add(position);
        } else {
            this.camera.position.copy(position);
        }
        
        // Always look at the target
        const lookTarget = this.target.position || new THREE.Vector3();
        this.camera.lookAt(lookTarget);
        
        // Update camera up vector to match current gravity orientation
        this.camera.up.copy(this.upVector);
    }
    
    /**
     * Convert spherical coordinates to Cartesian position
     * Takes into account the current up vector for proper orientation
     */
    sphericalToCartesian() {
        const sinPhiRadius = Math.sin(this.spherical.phi) * this.spherical.radius;
        
        // Standard spherical to Cartesian conversion
        const x = sinPhiRadius * Math.sin(this.spherical.theta);
        const y = Math.cos(this.spherical.phi) * this.spherical.radius;
        const z = sinPhiRadius * Math.cos(this.spherical.theta);
        
        const position = new THREE.Vector3(x, y, z);
        
        // If gravity has changed, rotate the position to align with new up vector
        if (!this.upVector.equals(new THREE.Vector3(0, 1, 0))) {
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.upVector);
            position.applyQuaternion(quaternion);
        }
        
        return position;
    }
    
    /**
     * Set the camera distance from target
     * @param {number} distance - Distance in world units
     */
    setDistance(distance) {
        this.spherical.radius = Math.max(this.minRadius, Math.min(this.maxRadius, distance));
    }
    
    /**
     * Set the up vector (for gravity changes)
     * @param {THREE.Vector3} upVector - New up direction
     */
    setUpVector(upVector) {
        this.upVector.copy(upVector);
        console.log(`CameraControls: Up vector changed to (${upVector.x.toFixed(2)}, ${upVector.y.toFixed(2)}, ${upVector.z.toFixed(2)})`);
    }
    
    /**
     * Reset camera to default position
     */
    reset() {
        this.spherical.radius = 15;
        this.spherical.theta = Math.PI / 4;
        this.spherical.phi = Math.PI / 3;
        this.sphericalDelta.theta = 0;
        this.sphericalDelta.phi = 0;
        this.upVector.set(0, 1, 0);
        console.log('CameraControls::reset - Camera controls reset to default');
    }
    
    /**
     * Enable or disable controls
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.isMouseDown = false;
            this.keys.rotateLeft = false;
            this.keys.rotateRight = false;
            this.domElement.style.cursor = 'default';
        } else {
            this.domElement.style.cursor = 'grab';
        }
    }
    
    /**
     * Clean up event listeners
     */
    dispose() {
        this.domElement.removeEventListener('mousedown', this.onMouseDown);
        this.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('mouseup', this.onMouseUp);
        this.domElement.removeEventListener('mouseleave', this.onMouseUp);
        this.domElement.removeEventListener('wheel', this.onMouseWheel);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        this.domElement.removeEventListener('contextmenu', (e) => e.preventDefault());
    }
}