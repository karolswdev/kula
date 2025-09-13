/**
 * Main entry point for Kula Browser game
 * Requirements: TECH-P-001, TECH-P-002
 */

// Import game modules
import { Game } from './core/Game.js';

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
    console.log('Kula Browser - Initializing...');
    
    // Hide loading screen
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    // Initialize and start the game
    const game = new Game();
    game.initialize();
    game.start();
    
    // Expose game instance globally for testing
    window.game = game;
    
    console.log('Kula Browser - Game started successfully');
});