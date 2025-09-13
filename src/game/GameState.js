/**
 * GameState - Centralized game state management
 * Requirements: PROD-008 (Lives System), PROD-010 (Scoring), ARCH-001 (Modular Systems)
 * 
 * This module manages:
 * - Lives tracking and game over
 * - Score tracking
 * - Key collection state
 * - Level progression
 * - Save/load functionality
 * - Event system for state changes
 */

export class GameState {
    constructor() {
        // Core game state - Requirements: PROD-008, PROD-010
        this.lives = 3;
        this.score = 0;
        this.keysCollected = 0;
        this.totalKeys = 0;
        this.currentLevel = null;
        this.levelIndex = 0;
        
        // Game status flags
        this.isGameOver = false;
        this.isPaused = false;
        this.isRespawning = false;
        
        // Level timer (optional)
        this.levelStartTime = null;
        this.levelElapsedTime = 0;
        
        // Event listeners for state changes
        this.listeners = {
            livesChanged: [],
            scoreChanged: [],
            keyCollected: [],
            gameOver: [],
            levelComplete: [],
            stateReset: []
        };
        
        // Storage key for save/load
        this.storageKey = 'kulaGameState';
        
        console.log('GameState::constructor - Initialized with default state');
    }
    
    /**
     * Initialize state for a new level
     * @param {Object} levelConfig - Level configuration object
     */
    initializeLevel(levelConfig) {
        console.log('GameState::initializeLevel - Initializing for level:', levelConfig.name);
        
        this.currentLevel = levelConfig.name || 'Unknown';
        this.keysCollected = 0;
        this.totalKeys = levelConfig.totalKeys || 0;
        this.levelStartTime = Date.now();
        this.levelElapsedTime = 0;
        this.isRespawning = false;
        
        // Set initial lives if specified in level
        if (levelConfig.gameSettings?.initialLives !== undefined) {
            this.lives = levelConfig.gameSettings.initialLives;
            console.log(`GameState: Lives set to ${this.lives} from level config`);
        }
        
        this.emit('stateReset', this.getState());
    }
    
    /**
     * Lose a life and check for game over
     * Requirement: PROD-008 - Lives System
     * @param {string} cause - Reason for life loss (fall, hazard, etc.)
     * @returns {boolean} True if game is over
     */
    loseLife(cause = 'unknown') {
        if (this.isGameOver || this.isRespawning) {
            return this.isGameOver;
        }
        
        console.log(`GameState::loseLife - Life lost due to: ${cause}. Lives before: ${this.lives}`);
        
        this.lives = Math.max(0, this.lives - 1);
        console.log(`GameState::loseLife - Lives remaining: ${this.lives}`);
        
        // Emit life lost event
        this.emit('livesChanged', {
            lives: this.lives,
            cause: cause
        });
        
        // Check for game over
        if (this.lives <= 0) {
            this.triggerGameOver();
            return true;
        }
        
        return false;
    }
    
    /**
     * Add to the score
     * Requirement: PROD-010 - Scoring
     * @param {number} points - Points to add
     * @param {string} source - Source of points (coin, bonus, etc.)
     */
    addScore(points, source = 'unknown') {
        const previousScore = this.score;
        this.score += points;
        
        console.log(`GameState::addScore - Added ${points} points from ${source}. Score: ${previousScore} -> ${this.score}`);
        
        this.emit('scoreChanged', {
            score: this.score,
            delta: points,
            source: source
        });
    }
    
    /**
     * Collect a key
     * Requirement: PROD-004 - Key Collection
     */
    collectKey() {
        this.keysCollected++;
        console.log(`GameState::collectKey - Keys: ${this.keysCollected}/${this.totalKeys}`);
        
        this.emit('keyCollected', {
            keysCollected: this.keysCollected,
            totalKeys: this.totalKeys,
            allCollected: this.keysCollected >= this.totalKeys
        });
    }
    
    /**
     * Trigger game over state
     * Requirement: PROD-008 - Game Over state
     */
    triggerGameOver() {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        console.log('GameState::triggerGameOver - GAME OVER!');
        console.log(`Final Score: ${this.score}, Level: ${this.currentLevel}`);
        
        this.emit('gameOver', {
            finalScore: this.score,
            levelReached: this.currentLevel,
            keysCollected: this.keysCollected,
            totalKeys: this.totalKeys
        });
    }
    
    /**
     * Mark level as complete
     * Requirement: PROD-005 - Level Completion
     */
    completeLevel() {
        const completionTime = Date.now() - this.levelStartTime;
        const timeBonus = Math.max(0, 10000 - Math.floor(completionTime / 100)) * 10; // Time bonus
        
        console.log(`GameState::completeLevel - Level ${this.currentLevel} complete!`);
        console.log(`Time: ${(completionTime / 1000).toFixed(2)}s, Time Bonus: ${timeBonus}`);
        
        // Add time bonus to score
        if (timeBonus > 0) {
            this.addScore(timeBonus, 'time-bonus');
        }
        
        this.emit('levelComplete', {
            level: this.currentLevel,
            score: this.score,
            time: completionTime,
            timeBonus: timeBonus,
            keysCollected: this.keysCollected
        });
    }
    
    /**
     * Reset state for a new game
     */
    reset() {
        console.log('GameState::reset - Resetting to initial state');
        
        this.lives = 3;
        this.score = 0;
        this.keysCollected = 0;
        this.totalKeys = 0;
        this.currentLevel = null;
        this.levelIndex = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.isRespawning = false;
        this.levelStartTime = null;
        this.levelElapsedTime = 0;
        
        this.emit('stateReset', this.getState());
    }
    
    /**
     * Get current state object
     * @returns {Object} Current game state
     */
    getState() {
        return {
            lives: this.lives,
            score: this.score,
            keysCollected: this.keysCollected,
            totalKeys: this.totalKeys,
            currentLevel: this.currentLevel,
            levelIndex: this.levelIndex,
            isGameOver: this.isGameOver,
            isPaused: this.isPaused,
            levelElapsedTime: this.levelStartTime ? Date.now() - this.levelStartTime : 0
        };
    }
    
    /**
     * Save state to localStorage
     */
    save() {
        try {
            const state = this.getState();
            localStorage.setItem(this.storageKey, JSON.stringify(state));
            console.log('GameState::save - State saved to localStorage');
            return true;
        } catch (error) {
            console.error('GameState::save - Failed to save state:', error);
            return false;
        }
    }
    
    /**
     * Load state from localStorage
     * @returns {boolean} True if state was loaded successfully
     */
    load() {
        try {
            const savedState = localStorage.getItem(this.storageKey);
            if (!savedState) {
                console.log('GameState::load - No saved state found');
                return false;
            }
            
            const state = JSON.parse(savedState);
            
            // Restore state
            this.lives = state.lives || 3;
            this.score = state.score || 0;
            this.keysCollected = state.keysCollected || 0;
            this.totalKeys = state.totalKeys || 0;
            this.currentLevel = state.currentLevel || null;
            this.levelIndex = state.levelIndex || 0;
            this.isGameOver = state.isGameOver || false;
            this.isPaused = state.isPaused || false;
            
            console.log('GameState::load - State loaded from localStorage:', state);
            this.emit('stateReset', this.getState());
            
            return true;
        } catch (error) {
            console.error('GameState::load - Failed to load state:', error);
            return false;
        }
    }
    
    /**
     * Clear saved state
     */
    clearSave() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('GameState::clearSave - Saved state cleared');
        } catch (error) {
            console.error('GameState::clearSave - Failed to clear save:', error);
        }
    }
    
    /**
     * Subscribe to state change events
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }
    
    /**
     * Unsubscribe from state change events
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }
    
    /**
     * Emit an event to all listeners
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`GameState::emit - Error in ${event} listener:`, error);
                }
            });
        }
    }
    
    /**
     * Set respawn flag
     * @param {boolean} isRespawning
     */
    setRespawning(isRespawning) {
        this.isRespawning = isRespawning;
    }
    
    /**
     * Set pause state
     * @param {boolean} isPaused
     */
    setPaused(isPaused) {
        this.isPaused = isPaused;
        console.log(`GameState::setPaused - Game ${isPaused ? 'paused' : 'resumed'}`);
    }
}