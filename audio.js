// Audio management class for game sounds and music
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.masterVolume = 0.7;
        this.soundVolume = 0.8;
        this.musicVolume = 0.3;
        
        this.currentMusic = null;
        this.musicGainNode = null;
        this.soundGainNode = null;
    }

    async init() {
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes for volume control
            this.soundGainNode = this.audioContext.createGain();
            this.musicGainNode = this.audioContext.createGain();
            
            this.soundGainNode.connect(this.audioContext.destination);
            this.musicGainNode.connect(this.audioContext.destination);
            
            this.updateVolumes();
            
            // Generate sound effects
            this.generateSounds();
            
            // Start background music after user interaction (required by browsers)
            // We'll start it when the user first interacts with the game
            
        } catch (error) {
            console.warn('Web Audio API not supported, audio disabled:', error);
            this.soundEnabled = false;
            this.musicEnabled = false;
        }
    }

    generateSounds() {
        // Generate various game sounds using Web Audio API
        this.sounds = {
            move: this.createMoveSound(),
            select: this.createSelectSound(),
            invalid: this.createInvalidSound(),
            levelComplete: this.createLevelCompleteSound(),
            hint: this.createHintSound(),
            undo: this.createUndoSound(),
            click: this.createClickSound()
        };
    }

    createMoveSound() {
        return () => {
            if (!this.soundEnabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.soundGainNode);
            
            // Pleasant movement sound - ascending tone
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(660, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.type = 'sine';
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }

    createSelectSound() {
        return () => {
            if (!this.soundEnabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.soundGainNode);
            
            // Short click sound
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.type = 'square';
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }

    createInvalidSound() {
        return () => {
            if (!this.soundEnabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.soundGainNode);
            
            // Error sound - low buzzing
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(180, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.type = 'sawtooth';
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }

    createLevelCompleteSound() {
        return () => {
            if (!this.soundEnabled || !this.audioContext) return;
            
            // Victory fanfare - multiple tones
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.soundGainNode);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                    
                    oscillator.type = 'triangle';
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.5);
                }, index * 100);
            });
        };
    }

    createHintSound() {
        return () => {
            if (!this.soundEnabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.soundGainNode);
            
            // Gentle hint sound
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(900, this.audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.type = 'sine';
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }

    createUndoSound() {
        return () => {
            if (!this.soundEnabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.soundGainNode);
            
            // Reverse sound - descending
            oscillator.frequency.setValueAtTime(660, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.15);
            
            gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            
            oscillator.type = 'sine';
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.15);
        };
    }

    createClickSound() {
        return () => {
            if (!this.soundEnabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.soundGainNode);
            
            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            oscillator.type = 'square';
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        };
    }

    async startBackgroundMusic() {
        if (!this.musicEnabled || !this.audioContext) return;
        
        try {
            // Create a simple ambient background music
            this.playAmbientMusic();
        } catch (error) {
            console.warn('Could not start background music:', error);
        }
    }

    playAmbientMusic() {
        if (!this.musicEnabled || !this.audioContext) return;
        
        // Create a gentle ambient loop
        const playAmbientNote = (frequency, delay, duration) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filterNode = this.audioContext.createBiquadFilter();
                
                oscillator.connect(filterNode);
                filterNode.connect(gainNode);
                gainNode.connect(this.musicGainNode);
                
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                filterNode.type = 'lowpass';
                filterNode.frequency.setValueAtTime(800, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.5);
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration - 0.5);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }, delay);
        };
        
        // Ambient chord progression (every 8 seconds)
        const chords = [
            [261.63, 329.63, 392.00], // C major
            [293.66, 369.99, 440.00], // D minor
            [329.63, 415.30, 493.88], // E minor
            [349.23, 440.00, 523.25]  // F major
        ];
        
        const playChordSequence = () => {
            chords.forEach((chord, chordIndex) => {
                chord.forEach((freq, noteIndex) => {
                    playAmbientNote(freq, chordIndex * 8000 + noteIndex * 100, 6);
                });
            });
            
            // Schedule next sequence
            setTimeout(playChordSequence, 32000);
        };
        
        // Start the ambient music if enabled
        if (this.musicEnabled) {
            playChordSequence();
        }
    }

    playSound(soundName) {
        if (!this.soundEnabled || !this.sounds[soundName]) return;
        
        try {
            this.sounds[soundName]();
        } catch (error) {
            console.warn(`Could not play sound ${soundName}:`, error);
        }
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        this.updateVolumes();
    }

    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        this.updateVolumes();
        
        if (enabled && !this.currentMusic) {
            this.startBackgroundMusic();
        }
    }

    updateVolumes() {
        if (!this.audioContext) return;
        
        try {
            if (this.soundGainNode) {
                this.soundGainNode.gain.setValueAtTime(
                    this.soundEnabled ? this.masterVolume * this.soundVolume : 0,
                    this.audioContext.currentTime
                );
            }
            
            if (this.musicGainNode) {
                this.musicGainNode.gain.setValueAtTime(
                    this.musicEnabled ? this.masterVolume * this.musicVolume : 0,
                    this.audioContext.currentTime
                );
            }
        } catch (error) {
            console.warn('Could not update volumes:', error);
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    // Resume audio context if it's suspended (required by some browsers)
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (error) {
                console.warn('Could not resume audio context:', error);
            }
        }
    }

    // Clean up audio resources
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.sounds = {};
        this.currentMusic = null;
    }
}
