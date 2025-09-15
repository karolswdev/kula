/**
 * Main entry point for Kula Browser game
 * Requirements: TECH-P-001, TECH-P-002, USER-002, USER-003
 */

// Import game modules
import { Game } from './core/Game.js';
import { GameFlowManager } from './game/GameFlowManager.js';

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
    console.log('Kula Browser - Initializing...');
    
    // Hide loading screen
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    // Initialize the game flow manager
    const gameFlowManager = new GameFlowManager();
    
    // Initialize the game but don't start it yet
    const game = new Game();
    game.initialize();
    
    // Connect game and flow manager
    gameFlowManager.setGame(game);
    
    // The game will be started when a level is selected from the menu
    // gameFlowManager handles the initial state (main menu)
    
    // Expose instances globally for testing
    window.game = game;
    window.gameFlowManager = gameFlowManager;
    
    console.log('Kula Browser - Game initialized, showing main menu');
});