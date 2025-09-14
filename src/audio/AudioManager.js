/**
 * AudioManager - Handles all game audio and sound effects
 * Requirement: PROD-012 - Audio: Sound Effects
 */

export class AudioManager {
    constructor() {
        // Audio context for better control
        this.audioContext = null;
        this.masterVolume = 0.7;
        this.muted = false;
        
        // Sound buffers
        this.sounds = {};
        this.soundSources = {};
        
        // Background music
        this.musicSource = null;
        this.musicVolume = 0.5;
        
        // Initialize Web Audio API
        this.initializeAudioContext();
        
        console.log('AudioManager::constructor - Audio manager initialized');
    }
    
    /**
     * Initialize Web Audio API context
     */
    initializeAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create master gain node
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.value = this.masterVolume;
            this.masterGainNode.connect(this.audioContext.destination);
            
            // Resume audio context on user interaction (browser requirement)
            document.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
            
        } catch (error) {
            console.error('AudioManager::initializeAudioContext - Failed to initialize Web Audio API:', error);
            // Fallback to HTML5 Audio
            this.useHTMLAudio = true;
        }
    }
    
    /**
     * Load all game sounds
     * Requirement: PROD-012 - Immediate auditory feedback for key events
     */
    async loadSounds() {
        const soundFiles = {
            // Movement sounds
            jump: '/sounds/jump.mp3',
            land: '/sounds/land.mp3',
            roll: '/sounds/roll.mp3',
            
            // Collection sounds
            keyCollect: '/sounds/key-collect.mp3',
            coinCollect: '/sounds/coin-collect.mp3',
            
            // Portal sounds
            portalUnlock: '/sounds/portal-unlock.mp3',
            levelComplete: '/sounds/level-complete.mp3',
            
            // Danger sounds
            hazardHit: '/sounds/hazard-hit.mp3',
            fall: '/sounds/fall.mp3',
            lifeLost: '/sounds/life-lost.mp3',
            
            // UI sounds
            gameOver: '/sounds/game-over.mp3',
            buttonClick: '/sounds/button-click.mp3',
            
            // Gravity shift
            gravityShift: '/sounds/gravity-shift.mp3'
        };
        
        // For now, create placeholder audio elements
        // In production, these would be actual audio files
        for (const [name, path] of Object.entries(soundFiles)) {
            if (this.useHTMLAudio) {
                // Fallback to HTML5 Audio
                this.sounds[name] = new Audio();
                this.sounds[name].src = path;
                this.sounds[name].volume = this.masterVolume;
            } else {
                // Use placeholder data for now (sine wave beep)
                this.createPlaceholderSound(name);
            }
        }
        
        console.log('AudioManager::loadSounds - Sounds loaded:', Object.keys(this.sounds));
    }
    
    /**
     * Create a placeholder sound using Web Audio API
     * This generates simple tones as placeholders for actual sound effects
     */
    createPlaceholderSound(name) {
        // Different frequencies and durations for different sound types
        const soundParams = {
            jump: { frequency: 440, duration: 0.2, type: 'sine' },
            land: { frequency: 220, duration: 0.1, type: 'sine' },
            roll: { frequency: 100, duration: 0.05, type: 'sawtooth' },
            keyCollect: { frequency: 880, duration: 0.3, type: 'sine' },
            coinCollect: { frequency: 660, duration: 0.2, type: 'square' },
            portalUnlock: { frequency: 523, duration: 0.5, type: 'sine' },
            levelComplete: { frequency: 784, duration: 1.0, type: 'sine' },
            hazardHit: { frequency: 110, duration: 0.3, type: 'sawtooth' },
            fall: { frequency: 440, duration: 0.5, type: 'sine', slide: true },
            lifeLost: { frequency: 220, duration: 0.4, type: 'square' },
            gameOver: { frequency: 110, duration: 1.0, type: 'sawtooth' },
            buttonClick: { frequency: 330, duration: 0.05, type: 'square' },
            gravityShift: { frequency: 330, duration: 0.3, type: 'sine', wobble: true }
        };
        
        this.sounds[name] = soundParams[name] || { frequency: 440, duration: 0.2, type: 'sine' };
    }
    
    /**
     * Play a sound effect
     * Requirement: PROD-012 - Sound effects for jump, collect, fall, hazard
     * @param {string} soundName - Name of the sound to play
     * @param {number} volume - Volume multiplier (0-1)
     * @param {number} pitch - Pitch multiplier (default 1.0)
     */
    playSound(soundName, volume = 1.0, pitch = 1.0) {
        if (this.muted || !this.sounds[soundName]) {
            return;
        }
        
        try {
            if (this.useHTMLAudio) {
                // HTML5 Audio fallback
                const sound = this.sounds[soundName].cloneNode();
                sound.volume = this.masterVolume * volume;
                sound.playbackRate = pitch;
                sound.play().catch(e => {
                    console.warn(`AudioManager::playSound - Could not play ${soundName}:`, e);
                });
            } else if (this.audioContext) {
                // Web Audio API implementation with placeholder sounds
                const params = this.sounds[soundName];
                const now = this.audioContext.currentTime;
                
                // Create oscillator
                const oscillator = this.audioContext.createOscillator();
                oscillator.type = params.type;
                oscillator.frequency.value = params.frequency * pitch;
                
                // Apply effects
                if (params.slide) {
                    // Sliding frequency for falling sound
                    oscillator.frequency.setValueAtTime(params.frequency * pitch, now);
                    oscillator.frequency.linearRampToValueAtTime(
                        params.frequency * 0.5 * pitch, 
                        now + params.duration
                    );
                } else if (params.wobble) {
                    // Wobble effect for gravity shift
                    const lfo = this.audioContext.createOscillator();
                    lfo.frequency.value = 10;
                    const lfoGain = this.audioContext.createGain();
                    lfoGain.gain.value = 50;
                    lfo.connect(lfoGain);
                    lfoGain.connect(oscillator.frequency);
                    lfo.start(now);
                    lfo.stop(now + params.duration);
                }
                
                // Create envelope
                const gainNode = this.audioContext.createGain();
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.3 * volume, now + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + params.duration);
                
                // Connect nodes
                oscillator.connect(gainNode);
                gainNode.connect(this.masterGainNode);
                
                // Play sound
                oscillator.start(now);
                oscillator.stop(now + params.duration);
                
                // Store reference for potential stopping
                this.soundSources[soundName] = oscillator;
            }
        } catch (error) {
            console.warn(`AudioManager::playSound - Error playing ${soundName}:`, error);
        }
    }
    
    /**
     * Play a continuous sound (like rolling)
     * @param {string} soundName - Name of the sound
     * @param {number} volume - Volume level
     * @returns {Object} Sound instance that can be stopped
     */
    playContinuousSound(soundName, volume = 1.0) {
        if (this.muted || !this.sounds[soundName]) {
            return null;
        }
        
        if (this.audioContext && !this.useHTMLAudio) {
            const params = this.sounds[soundName];
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = params.type;
            oscillator.frequency.value = params.frequency;
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0.2 * volume;
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGainNode);
            
            oscillator.start();
            
            return {
                stop: () => {
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
                    oscillator.stop(this.audioContext.currentTime + 0.1);
                }
            };
        }
        
        return null;
    }
    
    /**
     * Set master volume
     * @param {number} volume - Volume level (0-1)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.masterVolume;
        }
        
        // Update HTML audio elements if using fallback
        if (this.useHTMLAudio) {
            Object.values(this.sounds).forEach(sound => {
                if (sound instanceof Audio) {
                    sound.volume = this.masterVolume;
                }
            });
        }
    }
    
    /**
     * Mute/unmute all sounds
     * @param {boolean} muted - Whether to mute
     */
    setMuted(muted) {
        this.muted = muted;
        
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = muted ? 0 : this.masterVolume;
        }
    }
    
    /**
     * Play background music
     * @param {string} musicPath - Path to music file
     * @param {boolean} loop - Whether to loop
     */
    playMusic(musicPath, loop = true) {
        // Placeholder for background music implementation
        console.log(`AudioManager::playMusic - Would play: ${musicPath}, loop: ${loop}`);
    }
    
    /**
     * Stop all sounds
     */
    stopAllSounds() {
        // Stop all Web Audio sources
        Object.values(this.soundSources).forEach(source => {
            try {
                source.stop();
            } catch (e) {
                // Source might have already stopped
            }
        });
        this.soundSources = {};
        
        // Stop HTML audio elements
        if (this.useHTMLAudio) {
            Object.values(this.sounds).forEach(sound => {
                if (sound instanceof Audio) {
                    sound.pause();
                    sound.currentTime = 0;
                }
            });
        }
    }
    
    /**
     * Clean up audio resources
     */
    dispose() {
        this.stopAllSounds();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.sounds = {};
        this.soundSources = {};
    }
}