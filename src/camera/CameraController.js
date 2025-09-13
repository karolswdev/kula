/**
 * CameraController - Manages camera following and rotation based on gravity
 * Requirements: PROD-009 (Camera System: Automated Tracking)
 */

export class CameraController {
    constructor(camera, target) {
        this.camera = camera;
        this.target = target; // The target to follow (player mesh)
        
        // Camera offset from player (in player's local space)
        this.offset = new THREE.Vector3(10, 10, 10);
        this.lookAtOffset = new THREE.Vector3(0, 0, 0);
        
        // Current "up" vector for the camera
        this.currentUp = new THREE.Vector3(0, 1, 0);
        this.targetUp = new THREE.Vector3(0, 1, 0);
        
        // Smooth transition parameters
        this.isTransitioning = false;
        this.transitionSpeed = 2.0; // radians per second
        
        // Store initial camera state
        this.initialPosition = camera.position.clone();
        this.initialRotation = camera.rotation.clone();
        
        console.log('CameraController::constructor - Initialized');
    }
    
    /**
     * Update camera position and orientation
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (!this.target) return;
        
        // Update up vector if transitioning
        if (this.isTransitioning) {
            this.updateUpTransition(deltaTime);
        }
        
        // Calculate desired camera position based on current up vector
        const desiredPosition = this.calculateCameraPosition();
        
        // Smoothly interpolate camera position
        this.camera.position.lerp(desiredPosition, 5.0 * deltaTime);
        
        // Look at the target with the correct up vector
        const lookAtTarget = this.target.position.clone().add(this.lookAtOffset);
        this.camera.up.copy(this.currentUp);
        this.camera.lookAt(lookAtTarget);
        
        // Log camera state occasionally for debugging
        if (Math.random() < 0.01) {
            console.log(`Camera: Pos(${this.camera.position.x.toFixed(1)}, ${this.camera.position.y.toFixed(1)}, ${this.camera.position.z.toFixed(1)}), Up(${this.currentUp.x.toFixed(1)}, ${this.currentUp.y.toFixed(1)}, ${this.currentUp.z.toFixed(1)})`);
        }
    }
    
    /**
     * Calculate camera position based on current gravity/up direction
     * @returns {THREE.Vector3} Desired camera position
     */
    calculateCameraPosition() {
        if (!this.target) return this.camera.position.clone();
        
        // Create a rotation that aligns Y-axis with currentUp
        const quaternion = new THREE.Quaternion();
        const defaultUp = new THREE.Vector3(0, 1, 0);
        quaternion.setFromUnitVectors(defaultUp, this.currentUp);
        
        // Apply rotation to offset
        const rotatedOffset = this.offset.clone();
        rotatedOffset.applyQuaternion(quaternion);
        
        // Add to target position
        return this.target.position.clone().add(rotatedOffset);
    }
    
    /**
     * Handle gravity change event
     * Requirement: PROD-009 - Camera must smoothly reorient when gravity changes
     * @param {THREE.Vector3} newSurfaceNormal - The normal of the new surface
     */
    onGravityChange(newSurfaceNormal) {
        console.log(`CameraController::onGravityChange - New surface normal: (${newSurfaceNormal.x.toFixed(2)}, ${newSurfaceNormal.y.toFixed(2)}, ${newSurfaceNormal.z.toFixed(2)})`);
        
        // The new "up" is the surface normal (opposite of gravity direction)
        this.targetUp = new THREE.Vector3(newSurfaceNormal.x, newSurfaceNormal.y, newSurfaceNormal.z);
        this.targetUp.normalize();
        
        // Start transitioning
        this.isTransitioning = true;
        
        console.log(`Camera: Starting rotation from Up(${this.currentUp.x.toFixed(2)}, ${this.currentUp.y.toFixed(2)}, ${this.currentUp.z.toFixed(2)}) to Up(${this.targetUp.x.toFixed(2)}, ${this.targetUp.y.toFixed(2)}, ${this.targetUp.z.toFixed(2)})`);
    }
    
    /**
     * Smoothly transition the up vector
     * @param {number} deltaTime - Time step
     */
    updateUpTransition(deltaTime) {
        // Use spherical linear interpolation for smooth rotation
        const lerpFactor = Math.min(1.0, this.transitionSpeed * deltaTime);
        
        // SLERP between current and target up vectors
        const dot = this.currentUp.dot(this.targetUp);
        
        // If vectors are already aligned, complete transition
        if (Math.abs(dot) > 0.999) {
            this.currentUp.copy(this.targetUp);
            this.isTransitioning = false;
            console.log(`Camera: Rotation complete! Final Up(${this.currentUp.x.toFixed(2)}, ${this.currentUp.y.toFixed(2)}, ${this.currentUp.z.toFixed(2)})`);
            return;
        }
        
        // Perform SLERP
        const theta = Math.acos(Math.max(-1, Math.min(1, dot)));
        const sinTheta = Math.sin(theta);
        
        if (sinTheta > 0.001) {
            const a = Math.sin((1 - lerpFactor) * theta) / sinTheta;
            const b = Math.sin(lerpFactor * theta) / sinTheta;
            
            this.currentUp.multiplyScalar(a);
            const tempUp = this.targetUp.clone().multiplyScalar(b);
            this.currentUp.add(tempUp);
            this.currentUp.normalize();
        } else {
            // Vectors are too close, use linear interpolation
            this.currentUp.lerp(this.targetUp, lerpFactor);
            this.currentUp.normalize();
        }
        
        // Check if transition is complete
        if (this.currentUp.distanceTo(this.targetUp) < 0.01) {
            this.currentUp.copy(this.targetUp);
            this.isTransitioning = false;
            console.log(`Camera: Rotation complete! Final Up(${this.currentUp.x.toFixed(2)}, ${this.currentUp.y.toFixed(2)}, ${this.currentUp.z.toFixed(2)})`);
        }
    }
    
    /**
     * Set the target to follow
     * @param {THREE.Object3D} target - The target object (usually player mesh)
     */
    setTarget(target) {
        this.target = target;
    }
    
    /**
     * Reset camera to initial state
     */
    reset() {
        this.camera.position.copy(this.initialPosition);
        this.camera.rotation.copy(this.initialRotation);
        this.currentUp.set(0, 1, 0);
        this.targetUp.set(0, 1, 0);
        this.isTransitioning = false;
        console.log('CameraController::reset - Camera reset to initial state');
    }
}