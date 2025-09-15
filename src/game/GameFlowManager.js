/**
 * GameFlowManager - Manages overall game flow and state transitions
 * Requirements: USER-002, USER-003, PROD-004, PROD-005
 */

export class GameFlowManager {
    constructor() {
        // Game states
        this.GameStates = {
            IN_MENU: 'IN_MENU',
            LEVEL_SELECT: 'LEVEL_SELECT',
            IN_GAME: 'IN_GAME',
            LEVEL_COMPLETE: 'LEVEL_COMPLETE',
            GAME_OVER: 'GAME_OVER',
            PAUSED: 'PAUSED'
        };
        
        // Current state
        this.currentState = this.GameStates.IN_MENU;
        
        // Level definitions
        this.levels = [
            {
                id: 1,
                name: 'Verdant Ruins 1',
                file: '/levels/verdant-ruins-01.json',
                unlocked: true,
                completed: false,
                bestScore: 0
            },
            {
                id: 2,
                name: 'Verdant Ruins 2',
                file: '/levels/verdant-ruins-02.json',
                unlocked: false,
                completed: false,
                bestScore: 0
            },
            {
                id: 3,
                name: 'Verdant Ruins 3',
                file: '/levels/verdant-ruins-03.json',
                unlocked: false,
                completed: false,
                bestScore: 0
            }
        ];
        
        // Current level info
        this.currentLevelIndex = 0;
        
        // References to UI elements
        this.mainMenuElement = null;
        this.levelSelectElement = null;
        this.levelGridElement = null;
        this.gameContainerElement = null;
        
        // Reference to the game instance
        this.game = null;
        
        // Initialize UI references
        this.initializeUIReferences();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load saved progress
        this.loadProgress();
        
        console.log('GameFlowManager::constructor - Game flow manager initialized');
    }
    
    /**
     * Initialize references to UI elements
     */
    initializeUIReferences() {
        this.mainMenuElement = document.getElementById('main-menu');
        this.levelSelectElement = document.getElementById('level-select');
        this.levelGridElement = document.getElementById('level-grid');
        this.gameContainerElement = document.getElementById('game-container');
        
        // Hide game container initially
        if (this.gameContainerElement) {
            this.gameContainerElement.style.display = 'none';
        }
    }
    
    /**
     * Setup event listeners for UI interactions and game events
     */
    setupEventListeners() {
        // Main menu buttons
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => this.showLevelSelect());
        }
        
        const creditsButton = document.getElementById('credits-button');
        if (creditsButton) {
            creditsButton.addEventListener('click', () => this.showCredits());
        }
        
        // Level select back button
        const backButton = document.getElementById('back-to-menu');
        if (backButton) {
            backButton.addEventListener('click', () => this.showMainMenu());
        }
        
        // Listen for level complete events
        window.addEventListener('levelComplete', (event) => {
            this.handleLevelComplete(event.detail);
        });
        
        // Listen for game over events
        window.addEventListener('gameOver', (event) => {
            this.handleGameOver(event.detail);
        });
        
        // Listen for ESC key to pause/unpause
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.currentState === this.GameStates.IN_GAME) {
                this.togglePause();
            }
        });
    }
    
    /**
     * Set the game instance reference
     * @param {Game} game - The main game instance
     */
    setGame(game) {
        this.game = game;
    }
    
    /**
     * Transition to a new game state
     * @param {string} newState - The new state to transition to
     */
    transitionToState(newState) {
        console.log(`GameFlowManager::transitionToState - Transitioning from ${this.currentState} to ${newState}`);
        
        const previousState = this.currentState;
        this.currentState = newState;
        
        // Handle state transitions
        switch (newState) {
            case this.GameStates.IN_MENU:
                this.showMainMenu();
                break;
            case this.GameStates.LEVEL_SELECT:
                this.showLevelSelect();
                break;
            case this.GameStates.IN_GAME:
                this.startGame();
                break;
            case this.GameStates.LEVEL_COMPLETE:
                this.showLevelCompleteScreen();
                break;
            case this.GameStates.GAME_OVER:
                this.showGameOverScreen();
                break;
        }
        
        // Dispatch state change event
        window.dispatchEvent(new CustomEvent('gameStateChanged', {
            detail: {
                previousState,
                currentState: newState
            }
        }));
    }
    
    /**
     * Show the main menu
     */
    showMainMenu() {
        console.log('GameFlowManager::showMainMenu - Showing main menu');
        
        this.currentState = this.GameStates.IN_MENU;
        
        // Hide all screens
        this.hideAllScreens();
        
        // Show main menu
        if (this.mainMenuElement) {
            this.mainMenuElement.classList.remove('hidden');
        }
        
        // Stop game if running
        if (this.game && this.game.isRunning) {
            this.game.stop();
        }
    }
    
    /**
     * Show the level select screen
     */
    showLevelSelect() {
        console.log('GameFlowManager::showLevelSelect - Showing level select');
        
        this.currentState = this.GameStates.LEVEL_SELECT;
        
        // Hide all screens
        this.hideAllScreens();
        
        // Update level grid
        this.updateLevelGrid();
        
        // Show level select
        if (this.levelSelectElement) {
            this.levelSelectElement.classList.remove('hidden');
        }
    }
    
    /**
     * Update the level grid with current level data
     */
    updateLevelGrid() {
        if (!this.levelGridElement) return;
        
        // Clear existing content
        this.levelGridElement.innerHTML = '';
        
        // Create level cards
        this.levels.forEach((level, index) => {
            const card = document.createElement('div');
            card.className = 'level-card';
            
            // Add status classes
            if (!level.unlocked) {
                card.classList.add('locked');
            }
            if (level.completed) {
                card.classList.add('completed');
            }
            
            // Create card content
            let cardHTML = `
                <div class="level-number">${level.id}</div>
                <h3>${level.name}</h3>
            `;
            
            if (!level.unlocked) {
                cardHTML += '<div class="lock-icon">🔒</div>';
            } else if (level.completed) {
                cardHTML += `
                    <div class="star-rating">⭐⭐⭐</div>
                    <p style="color: #4ECDC4; font-size: 14px;">Best: ${level.bestScore}</p>
                `;
            }
            
            card.innerHTML = cardHTML;
            
            // Add click handler for unlocked levels
            if (level.unlocked) {
                card.addEventListener('click', () => this.selectLevel(index));
            }
            
            this.levelGridElement.appendChild(card);
        });
    }
    
    /**
     * Select and start a level
     * @param {number} levelIndex - Index of the level to start
     */
    selectLevel(levelIndex) {
        console.log(`GameFlowManager::selectLevel - Selected level ${levelIndex}`);
        
        this.currentLevelIndex = levelIndex;
        const level = this.levels[levelIndex];
        
        if (!level.unlocked) {
            console.warn('GameFlowManager::selectLevel - Level is locked');
            return;
        }
        
        // Transition to in-game state
        this.transitionToState(this.GameStates.IN_GAME);
        
        // Load the level
        if (this.game) {
            this.game.loadLevel(level.file);
        }
    }
    
    /**
     * Start the game
     */
    startGame() {
        console.log('GameFlowManager::startGame - Starting game');
        
        // Hide all menu screens
        this.hideAllScreens();
        
        // Show game container
        if (this.gameContainerElement) {
            this.gameContainerElement.style.display = 'block';
        }
        
        // Start the game loop if not already running
        if (this.game && !this.game.isRunning) {
            this.game.start();
        }
        
        // Show HUD
        if (this.game && this.game.uiManager) {
            this.game.uiManager.show();
        }
    }
    
    /**
     * Handle level completion
     * @param {Object} details - Level completion details
     */
    handleLevelComplete(details) {
        console.log('GameFlowManager::handleLevelComplete - Level completed:', details);
        
        const currentLevel = this.levels[this.currentLevelIndex];
        if (currentLevel) {
            // Mark level as completed
            currentLevel.completed = true;
            
            // Update best score
            if (details.score && details.score > currentLevel.bestScore) {
                currentLevel.bestScore = details.score;
            }
            
            // Unlock next level
            if (this.currentLevelIndex < this.levels.length - 1) {
                const nextLevel = this.levels[this.currentLevelIndex + 1];
                if (!nextLevel.unlocked) {
                    nextLevel.unlocked = true;
                    console.log(`GameFlowManager::handleLevelComplete - Unlocked level ${nextLevel.id}`);
                    
                    // Show unlock notification
                    this.showUnlockNotification(nextLevel);
                }
            }
            
            // Save progress
            this.saveProgress();
        }
        
        // Show level complete screen then go to level select
        setTimeout(() => {
            this.transitionToState(this.GameStates.LEVEL_SELECT);
        }, 3000);
    }
    
    /**
     * Show unlock notification for a newly unlocked level
     * @param {Object} level - The unlocked level
     */
    showUnlockNotification(level) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 50px;
            border-radius: 20px;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            z-index: 2000;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            animation: notificationPulse 0.5s ease-out;
        `;
        notification.innerHTML = `
            <div style="color: #FFD700; font-size: 32px; margin-bottom: 10px;">🎉 LEVEL UNLOCKED! 🎉</div>
            <div>${level.name}</div>
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationPulse {
                0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after delay
        setTimeout(() => {
            notification.remove();
        }, 2500);
    }
    
    /**
     * Handle game over
     * @param {Object} details - Game over details
     */
    handleGameOver(details) {
        console.log('GameFlowManager::handleGameOver - Game over:', details);
        
        // Transition to game over state
        this.transitionToState(this.GameStates.GAME_OVER);
        
        // After delay, return to level select
        setTimeout(() => {
            this.transitionToState(this.GameStates.LEVEL_SELECT);
        }, 3000);
    }
    
    /**
     * Show level complete screen
     */
    showLevelCompleteScreen() {
        // This is handled by UIManager, we just manage the state
        console.log('GameFlowManager::showLevelCompleteScreen - Level complete');
    }
    
    /**
     * Show game over screen
     */
    showGameOverScreen() {
        // This is handled by UIManager, we just manage the state
        console.log('GameFlowManager::showGameOverScreen - Game over');
    }
    
    /**
     * Show credits (placeholder)
     */
    showCredits() {
        console.log('GameFlowManager::showCredits - Showing credits');
        
        // Create credits overlay
        const creditsOverlay = document.createElement('div');
        creditsOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            color: white;
            text-align: center;
            padding: 20px;
        `;
        creditsOverlay.innerHTML = `
            <h2 style="font-size: 48px; color: #FFD700; margin-bottom: 30px;">CREDITS</h2>
            <p style="font-size: 24px; margin: 10px;">A Tribute to the Classic Kula World</p>
            <p style="font-size: 20px; margin: 10px;">Built with Three.js</p>
            <p style="font-size: 18px; margin: 20px; opacity: 0.8;">Recreating the magic of gravity-defying puzzles</p>
            <button class="menu-button" style="margin-top: 40px;">BACK</button>
        `;
        
        const backButton = creditsOverlay.querySelector('button');
        backButton.addEventListener('click', () => {
            creditsOverlay.remove();
        });
        
        document.body.appendChild(creditsOverlay);
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.currentState === this.GameStates.IN_GAME) {
            console.log('GameFlowManager::togglePause - Pausing game');
            this.currentState = this.GameStates.PAUSED;
            
            if (this.game) {
                this.game.stop();
            }
            
            // Show pause overlay
            this.showPauseOverlay();
        } else if (this.currentState === this.GameStates.PAUSED) {
            console.log('GameFlowManager::togglePause - Resuming game');
            this.currentState = this.GameStates.IN_GAME;
            
            if (this.game) {
                this.game.start();
            }
            
            // Remove pause overlay
            this.removePauseOverlay();
        }
    }
    
    /**
     * Show pause overlay
     */
    showPauseOverlay() {
        const pauseOverlay = document.createElement('div');
        pauseOverlay.id = 'pause-overlay';
        pauseOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1400;
        `;
        pauseOverlay.innerHTML = `
            <h2 style="color: #FFD700; font-size: 48px; margin-bottom: 30px;">PAUSED</h2>
            <p style="color: white; font-size: 20px;">Press ESC to resume</p>
        `;
        
        document.body.appendChild(pauseOverlay);
    }
    
    /**
     * Remove pause overlay
     */
    removePauseOverlay() {
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            pauseOverlay.remove();
        }
    }
    
    /**
     * Hide all menu screens
     */
    hideAllScreens() {
        if (this.mainMenuElement) {
            this.mainMenuElement.classList.add('hidden');
        }
        if (this.levelSelectElement) {
            this.levelSelectElement.classList.add('hidden');
        }
    }
    
    /**
     * Save game progress to localStorage
     */
    saveProgress() {
        const progressData = {
            levels: this.levels.map(level => ({
                id: level.id,
                unlocked: level.unlocked,
                completed: level.completed,
                bestScore: level.bestScore
            }))
        };
        
        localStorage.setItem('kulaGameProgress', JSON.stringify(progressData));
        console.log('GameFlowManager::saveProgress - Progress saved');
    }
    
    /**
     * Load game progress from localStorage
     */
    loadProgress() {
        const savedData = localStorage.getItem('kulaGameProgress');
        
        if (savedData) {
            try {
                const progressData = JSON.parse(savedData);
                
                // Update levels with saved data
                progressData.levels.forEach((savedLevel, index) => {
                    if (this.levels[index]) {
                        this.levels[index].unlocked = savedLevel.unlocked;
                        this.levels[index].completed = savedLevel.completed;
                        this.levels[index].bestScore = savedLevel.bestScore || 0;
                    }
                });
                
                console.log('GameFlowManager::loadProgress - Progress loaded');
            } catch (error) {
                console.error('GameFlowManager::loadProgress - Failed to load progress:', error);
            }
        }
    }
    
    /**
     * Reset all progress (for testing)
     */
    resetProgress() {
        this.levels.forEach((level, index) => {
            level.unlocked = index === 0; // Only first level unlocked
            level.completed = false;
            level.bestScore = 0;
        });
        
        this.saveProgress();
        console.log('GameFlowManager::resetProgress - Progress reset');
    }
}