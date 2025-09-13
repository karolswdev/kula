/**
 * UIManager - Manages the game's HUD and UI elements
 * Requirements: USER-002 (Heads-Up Display), PROD-004 (Key Collection), PROD-008 (Lives System), PROD-010 (Scoring)
 */

export class UIManager {
    constructor() {
        this.hudElement = null;
        this.keysElement = null;
        this.livesElement = null;
        this.scoreElement = null;
        this.levelElement = null;
        this.messageElement = null;
        
        this.createHUD();
        this.setupEventListeners();
        
        console.log('UIManager::constructor - UI manager initialized');
    }
    
    /**
     * Create the HUD elements
     * Requirement: USER-002 - Heads-Up Display
     */
    createHUD() {
        // Check if HUD already exists
        this.hudElement = document.getElementById('hud');
        if (!this.hudElement) {
            // Create HUD container
            this.hudElement = document.createElement('div');
            this.hudElement.id = 'hud';
            this.hudElement.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                right: 20px;
                color: white;
                font-family: 'Courier New', monospace;
                font-size: 18px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                pointer-events: none;
                z-index: 1000;
                user-select: none;
            `;
            document.body.appendChild(this.hudElement);
        }
        
        // Create HUD layout
        this.hudElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div id="hud-level" style="color: #FFD700;">Level: Loading...</div>
                    <div id="hud-keys" style="color: #FFD700;">Keys: 0/0</div>
                    <div id="hud-lives" style="color: #FF6B6B;">Lives: ♥♥♥</div>
                </div>
                <div style="text-align: right;">
                    <div id="hud-score" style="color: #4ECDC4; font-size: 24px;">Score: 0</div>
                </div>
            </div>
            <div id="hud-message" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 48px;
                color: #FFD700;
                text-align: center;
                display: none;
                animation: pulse 1s ease-in-out infinite;
            "></div>
        `;
        
        // Add pulse animation for messages
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        // Get references to elements
        this.levelElement = document.getElementById('hud-level');
        this.keysElement = document.getElementById('hud-keys');
        this.livesElement = document.getElementById('hud-lives');
        this.scoreElement = document.getElementById('hud-score');
        this.messageElement = document.getElementById('hud-message');
        
        console.log('UIManager::createHUD - HUD created');
    }
    
    /**
     * Setup event listeners for game events
     */
    setupEventListeners() {
        // Listen for level loaded event
        window.addEventListener('levelLoaded', (event) => {
            this.updateLevel(event.detail.levelName);
        });
        
        // Listen for key collection
        window.addEventListener('keyCollected', (event) => {
            this.updateKeys(event.detail.collected, event.detail.total);
        });
        
        // Listen for life lost
        window.addEventListener('lifeLost', (event) => {
            this.updateLives(event.detail.livesRemaining);
            this.showMessage('Life Lost!', 1500);
        });
        
        // Listen for score changes - Requirement: PROD-010
        window.addEventListener('scoreChanged', (event) => {
            this.setScore(event.detail.score);
            // Show bonus message for large scores
            if (event.detail.delta >= 50) {
                this.showBonusMessage(`+${event.detail.delta}`, 1000);
            }
        });
        
        // Listen for level complete
        window.addEventListener('levelComplete', (event) => {
            this.showMessage('Level Complete!', 3000);
            // Score is now handled by GameState
        });
        
        // Listen for game over
        window.addEventListener('gameOver', (event) => {
            this.showMessage(`GAME OVER\nFinal Score: ${event.detail.finalScore}`, 5000);
        });
    }
    
    /**
     * Update the level display
     * @param {string} levelName - Name of the current level
     */
    updateLevel(levelName) {
        if (this.levelElement) {
            this.levelElement.textContent = `Level: ${levelName}`;
        }
    }
    
    /**
     * Update the keys display
     * Requirement: PROD-004 - Key Collection
     * @param {number} collected - Number of keys collected
     * @param {number} total - Total number of keys in level
     */
    updateKeys(collected, total) {
        if (this.keysElement) {
            this.keysElement.textContent = `Keys: ${collected}/${total}`;
            
            // Add collection animation
            this.keysElement.style.animation = 'none';
            setTimeout(() => {
                this.keysElement.style.animation = 'pulse 0.5s ease-in-out';
            }, 10);
        }
    }
    
    /**
     * Update the lives display
     * Requirement: PROD-008 - Lives System
     * @param {number} lives - Number of lives remaining
     */
    updateLives(lives) {
        if (this.livesElement) {
            const hearts = '♥'.repeat(Math.max(0, lives));
            const emptyHearts = '♡'.repeat(Math.max(0, 3 - lives));
            this.livesElement.innerHTML = `Lives: <span style="color: #FF6B6B">${hearts}</span><span style="color: #666">${emptyHearts}</span>`;
            
            // Add damage animation
            this.livesElement.style.animation = 'none';
            setTimeout(() => {
                this.livesElement.style.animation = 'pulse 0.5s ease-in-out';
            }, 10);
        }
    }
    
    /**
     * Update the score display (additive)
     * @param {number} points - Points to add to score
     */
    updateScore(points) {
        if (this.scoreElement) {
            const currentScore = parseInt(this.scoreElement.textContent.replace('Score: ', '')) || 0;
            const newScore = currentScore + points;
            this.setScore(newScore);
        }
    }
    
    /**
     * Set the score display to a specific value
     * Requirement: PROD-010 - Scoring
     * @param {number} score - The score value to display
     */
    setScore(score) {
        if (this.scoreElement) {
            this.scoreElement.textContent = `Score: ${score}`;
            
            // Add score animation
            this.scoreElement.style.animation = 'none';
            setTimeout(() => {
                this.scoreElement.style.animation = 'pulse 0.5s ease-in-out';
            }, 10);
        }
    }
    
    /**
     * Show a bonus score message
     * @param {string} message - Bonus message to display
     * @param {number} duration - Duration in milliseconds
     */
    showBonusMessage(message, duration = 1000) {
        // Create a temporary bonus element
        const bonusElement = document.createElement('div');
        bonusElement.style.cssText = `
            position: fixed;
            top: 60px;
            right: 30px;
            color: #FFD700;
            font-size: 32px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            pointer-events: none;
            z-index: 1001;
            animation: floatUp 1s ease-out forwards;
        `;
        bonusElement.textContent = message;
        
        // Add float up animation if not already defined
        if (!document.getElementById('float-up-style')) {
            const style = document.createElement('style');
            style.id = 'float-up-style';
            style.textContent = `
                @keyframes floatUp {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(-30px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(bonusElement);
        
        setTimeout(() => {
            bonusElement.remove();
        }, duration);
    }
    
    /**
     * Show a temporary message
     * @param {string} message - Message to display
     * @param {number} duration - Duration in milliseconds
     */
    showMessage(message, duration = 2000) {
        if (this.messageElement) {
            this.messageElement.textContent = message;
            this.messageElement.style.display = 'block';
            
            setTimeout(() => {
                this.messageElement.style.display = 'none';
            }, duration);
        }
    }
    
    /**
     * Initialize HUD with game state
     * @param {Object} gameState - Current game state
     * @param {Object} levelState - Current level state
     */
    initialize(gameState, levelState) {
        if (levelState) {
            this.updateLevel(levelState.levelName || 'Unknown');
            this.updateKeys(levelState.keysCollected || 0, levelState.totalKeys || 0);
        }
        
        if (gameState) {
            this.updateLives(gameState.lives || 3);
            this.setScore(gameState.score || 0);
        }
    }
    
    /**
     * Hide the HUD
     */
    hide() {
        if (this.hudElement) {
            this.hudElement.style.display = 'none';
        }
    }
    
    /**
     * Show the HUD
     */
    show() {
        if (this.hudElement) {
            this.hudElement.style.display = 'block';
        }
    }
}