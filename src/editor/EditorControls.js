/**
 * EditorControls.js
 * 
 * Dedicated camera control system for the level editor
 * Implements orbit, pan, and zoom functionality
 * Fulfills requirements: USER-004 (Editor Camera Controls), TC-11.2
 */

import * as THREE from 'three';

export class EditorControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        // Control state
        this.enabled = true;
        
        // Orbit controls
        this.isOrbiting = false;
        this.orbitSpeed = 0.5;
        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();
        
        // Pan controls
        this.isPanning = false;
        this.panSpeed = 0.002;
        this.panOffset = new THREE.Vector3();
        
        // Zoom controls
        this.zoomSpeed = 0.1;
        this.minDistance = 10;
        this.maxDistance = 100;
        
        // Target position (what we're looking at)
        this.target = new THREE.Vector3(0, 0, 0);
        
        // Mouse tracking
        this.mouse = new THREE.Vector2();
        this.mouseStart = new THREE.Vector2();
        
        // Touch support
        this.touches = [];
        this.prevTouchDistance = 0;
        
        // Damping
        this.enableDamping = true;
        this.dampingFactor = 0.05;
        
        // Rotation limits
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI * 0.49; // Slightly less than 90 degrees
        
        // Initialize camera position
        this.updateSpherical();
        
        // Bind event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        // Add event listeners
        this.addEventListeners();
        
        console.log('EditorControls initialized');
    }
    
    addEventListeners() {
        this.domElement.addEventListener('mousedown', this.handleMouseDown);
        this.domElement.addEventListener('mousemove', this.handleMouseMove);
        this.domElement.addEventListener('mouseup', this.handleMouseUp);
        this.domElement.addEventListener('wheel', this.handleWheel, { passive: false });
        this.domElement.addEventListener('contextmenu', this.handleContextMenu);
        
        // Touch events for mobile support
        this.domElement.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.domElement.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.domElement.addEventListener('touchend', this.handleTouchEnd);
        
        // Handle mouse leave
        this.domElement.addEventListener('mouseleave', this.handleMouseUp);
    }
    
    removeEventListeners() {
        this.domElement.removeEventListener('mousedown', this.handleMouseDown);
        this.domElement.removeEventListener('mousemove', this.handleMouseMove);
        this.domElement.removeEventListener('mouseup', this.handleMouseUp);
        this.domElement.removeEventListener('wheel', this.handleWheel);
        this.domElement.removeEventListener('contextmenu', this.handleContextMenu);
        this.domElement.removeEventListener('touchstart', this.handleTouchStart);
        this.domElement.removeEventListener('touchmove', this.handleTouchMove);
        this.domElement.removeEventListener('touchend', this.handleTouchEnd);
        this.domElement.removeEventListener('mouseleave', this.handleMouseUp);
    }
    
    handleMouseDown(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        // Store initial mouse position
        this.mouseStart.x = event.clientX;
        this.mouseStart.y = event.clientY;
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
        
        // Right mouse button - orbit
        if (event.button === 2) {
            this.isOrbiting = true;
            this.domElement.style.cursor = 'move';
            
            console.log('=== TEST CASE TC-11.2: Orbit control activated ===');
        }
        // Middle mouse button - pan
        else if (event.button === 1) {
            this.isPanning = true;
            this.domElement.style.cursor = 'move';
            
            console.log('=== TEST CASE TC-11.2: Pan control activated ===');
        }
    }
    
    handleMouseMove(event) {
        if (!this.enabled) return;
        
        const deltaX = event.clientX - this.mouse.x;
        const deltaY = event.clientY - this.mouse.y;
        
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
        
        if (this.isOrbiting) {
            // Orbit camera around target
            this.rotateCamera(deltaX, deltaY);
        } else if (this.isPanning) {
            // Pan camera and target
            this.panCamera(deltaX, deltaY);
        }
    }
    
    handleMouseUp(event) {
        this.isOrbiting = false;
        this.isPanning = false;
        this.domElement.style.cursor = 'crosshair';
        
        if (event && (event.button === 2 || event.button === 1)) {
            console.log('=== TEST CASE TC-11.2: Camera control released ===');
        }
    }
    
    handleWheel(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        // Zoom based on wheel delta
        const delta = event.deltaY > 0 ? 1 : -1;
        this.zoomCamera(delta);
        
        console.log('=== TEST CASE TC-11.2: Zoom control used ===');
    }
    
    handleContextMenu(event) {
        // Prevent context menu on right click
        event.preventDefault();
    }
    
    handleTouchStart(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        this.touches = Array.from(event.touches);
        
        if (this.touches.length === 1) {
            // Single touch - orbit
            this.isOrbiting = true;
            this.mouseStart.x = this.touches[0].clientX;
            this.mouseStart.y = this.touches[0].clientY;
            this.mouse.x = this.touches[0].clientX;
            this.mouse.y = this.touches[0].clientY;
        } else if (this.touches.length === 2) {
            // Two finger - pinch zoom or pan
            const dx = this.touches[0].clientX - this.touches[1].clientX;
            const dy = this.touches[0].clientY - this.touches[1].clientY;
            this.prevTouchDistance = Math.sqrt(dx * dx + dy * dy);
            
            // Center point for panning
            this.mouse.x = (this.touches[0].clientX + this.touches[1].clientX) / 2;
            this.mouse.y = (this.touches[0].clientY + this.touches[1].clientY) / 2;
        }
    }
    
    handleTouchMove(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        this.touches = Array.from(event.touches);
        
        if (this.touches.length === 1 && this.isOrbiting) {
            // Single touch orbit
            const deltaX = this.touches[0].clientX - this.mouse.x;
            const deltaY = this.touches[0].clientY - this.mouse.y;
            
            this.mouse.x = this.touches[0].clientX;
            this.mouse.y = this.touches[0].clientY;
            
            this.rotateCamera(deltaX, deltaY);
        } else if (this.touches.length === 2) {
            // Two finger pinch zoom
            const dx = this.touches[0].clientX - this.touches[1].clientX;
            const dy = this.touches[0].clientY - this.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (this.prevTouchDistance > 0) {
                const delta = (this.prevTouchDistance - distance) * 0.01;
                this.zoomCamera(delta);
            }
            
            this.prevTouchDistance = distance;
            
            // Two finger pan
            const centerX = (this.touches[0].clientX + this.touches[1].clientX) / 2;
            const centerY = (this.touches[0].clientY + this.touches[1].clientY) / 2;
            const deltaX = centerX - this.mouse.x;
            const deltaY = centerY - this.mouse.y;
            
            this.mouse.x = centerX;
            this.mouse.y = centerY;
            
            this.panCamera(deltaX * 0.5, deltaY * 0.5);
        }
    }
    
    handleTouchEnd(event) {
        this.touches = Array.from(event.touches);
        
        if (this.touches.length === 0) {
            this.isOrbiting = false;
            this.isPanning = false;
            this.prevTouchDistance = 0;
        }
    }
    
    rotateCamera(deltaX, deltaY) {
        // Update spherical delta based on mouse movement
        this.sphericalDelta.theta -= deltaX * this.orbitSpeed * Math.PI / 180;
        this.sphericalDelta.phi -= deltaY * this.orbitSpeed * Math.PI / 180;
    }
    
    panCamera(deltaX, deltaY) {
        // Calculate pan offset in camera space
        const offset = new THREE.Vector3();
        const distance = this.camera.position.distanceTo(this.target);
        
        // Get camera's right and up vectors
        const right = new THREE.Vector3();
        const up = new THREE.Vector3();
        
        this.camera.getWorldDirection(offset);
        right.crossVectors(offset, this.camera.up).normalize();
        up.crossVectors(right, offset).normalize();
        
        // Apply pan based on mouse delta
        right.multiplyScalar(-deltaX * distance * this.panSpeed);
        up.multiplyScalar(deltaY * distance * this.panSpeed);
        
        this.panOffset.add(right);
        this.panOffset.add(up);
    }
    
    zoomCamera(delta) {
        // Zoom by adjusting spherical radius
        const zoomFactor = 1 + delta * this.zoomSpeed;
        this.sphericalDelta.radius = this.spherical.radius * zoomFactor - this.spherical.radius;
    }
    
    updateSpherical() {
        // Convert camera position to spherical coordinates relative to target
        const offset = new THREE.Vector3();
        offset.copy(this.camera.position).sub(this.target);
        this.spherical.setFromVector3(offset);
    }
    
    update() {
        if (!this.enabled) return;
        
        // Update spherical position
        this.updateSpherical();
        
        // Apply deltas
        if (this.enableDamping) {
            this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor;
            this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor;
            this.spherical.radius += this.sphericalDelta.radius * this.dampingFactor;
            
            this.sphericalDelta.theta *= (1 - this.dampingFactor);
            this.sphericalDelta.phi *= (1 - this.dampingFactor);
            this.sphericalDelta.radius *= (1 - this.dampingFactor);
        } else {
            this.spherical.theta += this.sphericalDelta.theta;
            this.spherical.phi += this.sphericalDelta.phi;
            this.spherical.radius += this.sphericalDelta.radius;
            
            this.sphericalDelta.set(0, 0, 0);
        }
        
        // Apply constraints
        this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));
        this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
        
        // Apply pan offset
        if (this.enableDamping) {
            this.target.add(this.panOffset.multiplyScalar(this.dampingFactor));
            this.panOffset.multiplyScalar(1 - this.dampingFactor);
        } else {
            this.target.add(this.panOffset);
            this.panOffset.set(0, 0, 0);
        }
        
        // Update camera position from spherical coordinates
        const offset = new THREE.Vector3();
        offset.setFromSpherical(this.spherical);
        this.camera.position.copy(this.target).add(offset);
        
        // Look at target
        this.camera.lookAt(this.target);
        
        // Check if we need to continue updating (for damping)
        const needsUpdate = 
            Math.abs(this.sphericalDelta.theta) > 0.0001 ||
            Math.abs(this.sphericalDelta.phi) > 0.0001 ||
            Math.abs(this.sphericalDelta.radius) > 0.0001 ||
            this.panOffset.length() > 0.0001;
            
        return needsUpdate;
    }
    
    // Public API
    setTarget(x, y, z) {
        if (typeof x === 'object') {
            this.target.copy(x);
        } else {
            this.target.set(x, y, z);
        }
    }
    
    getTarget() {
        return this.target.clone();
    }
    
    reset() {
        this.target.set(0, 0, 0);
        this.camera.position.set(30, 40, 30);
        this.camera.lookAt(this.target);
        this.updateSpherical();
        this.sphericalDelta.set(0, 0, 0);
        this.panOffset.set(0, 0, 0);
    }
    
    dispose() {
        this.removeEventListeners();
    }
}