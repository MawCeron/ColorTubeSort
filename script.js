// Main application controller
class BallSortApp {
    constructor() {
        this.currentScreen = 'loading';
        this.game = null;
        this.audioManager = new AudioManager();
        this.storageManager = new StorageManager();
        this.levelsManager = new LevelsManager();
        
        this.init();
    }

    async init() {
        try {
            // Show loading screen
            this.showScreen('loading-screen');
            
            // Initialize audio (non-blocking)
            this.audioManager.init().catch(error => {
                console.warn('Audio initialization failed:', error);
            });
            
            // Load saved settings
            this.loadSettings();
            
            // Load saved progress
            this.loadProgress();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Simulate loading time for better UX
            setTimeout(() => {
                this.showScreen('main-menu');
                // Start background music on first user interaction
                this.setupAudioInteraction();
            }, 1500);
        } catch (error) {
            console.error('Initialization error:', error);
            // Still show the menu even if there are issues
            this.showScreen('main-menu');
        }
    }

    setupAudioInteraction() {
        // Start background music on first user interaction
        const startAudio = () => {
            this.audioManager.resumeAudioContext();
            this.audioManager.startBackgroundMusic();
            document.removeEventListener('click', startAudio);
            document.removeEventListener('keydown', startAudio);
            document.removeEventListener('touchstart', startAudio);
        };
        
        document.addEventListener('click', startAudio);
        document.addEventListener('keydown', startAudio);
        document.addEventListener('touchstart', startAudio);
    }

    setupEventListeners() {
        // Main menu buttons
        document.getElementById('play-button').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('level-select-button').addEventListener('click', () => {
            this.showLevelSelect();
        });

        document.getElementById('settings-button').addEventListener('click', () => {
            this.showSettings();
        });

        // Level select
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        // Game controls
        document.getElementById('restart-button').addEventListener('click', () => {
            this.restartLevel();
        });

        document.getElementById('menu-button').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        document.getElementById('hint-button').addEventListener('click', () => {
            this.showHint();
        });

        document.getElementById('undo-button').addEventListener('click', () => {
            this.undoMove();
        });

        // Win modal buttons
        document.getElementById('next-level-button').addEventListener('click', () => {
            this.nextLevel();
        });

        document.getElementById('replay-button').addEventListener('click', () => {
            this.restartLevel();
        });

        document.getElementById('level-menu-button').addEventListener('click', () => {
            this.showLevelSelect();
        });

        // Game over modal buttons
        document.getElementById('replay-all-button').addEventListener('click', () => {
            this.startGame(1);
        });

        document.getElementById('main-menu-button').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        // Settings
        document.getElementById('settings-back').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.audioManager.setSoundEnabled(e.target.checked);
            this.saveSettings();
        });

        document.getElementById('music-toggle').addEventListener('change', (e) => {
            this.audioManager.setMusicEnabled(e.target.checked);
            this.saveSettings();
        });

        document.getElementById('animations-toggle').addEventListener('change', (e) => {
            document.body.classList.toggle('no-animations', !e.target.checked);
            this.saveSettings();
        });

        document.getElementById('reset-progress').addEventListener('click', () => {
            if (confirm('¿Neta quieres borrar todo? ¡Todo todito! No hay forma de deshacerlo.')) {
                this.storageManager.resetProgress();
                this.loadProgress();
                this.showScreen('main-menu');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.currentScreen === 'game-screen' && this.game) {
                switch(e.key) {
                    case 'r':
                    case 'R':
                        this.restartLevel();
                        break;
                    case 'h':
                    case 'H':
                        this.showHint();
                        break;
                    case 'u':
                    case 'U':
                        this.undoMove();
                        break;
                    case 'Escape':
                        this.showScreen('main-menu');
                        break;
                }
            }
        });
    }

    showScreen(screenId) {
        try {
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
                if (screen && screen.classList) {
                    screen.classList.remove('active');
                }
            });
            
            // Show target screen
            const targetScreen = document.getElementById(screenId);
            if (targetScreen && targetScreen.classList) {
                targetScreen.classList.add('active');
                this.currentScreen = screenId;

                // Update content based on screen
                if (screenId === 'level-select') {
                    this.updateLevelSelect();
                } else if (screenId === 'main-menu') {
                    this.updateMainMenuStats();
                }
            } else {
                console.error('Could not find screen with ID:', screenId);
            }
        } catch (error) {
            console.error('Error en showScreen:', error);
        }
    }

    startGame(level = null) {
        const startLevel = level || this.storageManager.getProgress().currentLevel;
        this.game = new BallSortGame(startLevel, this.levelsManager, this.audioManager, this.storageManager);
        
        // Setup game event listeners
        this.game.onWin = (stats) => this.onLevelWin(stats);
        this.game.onGameOver = () => this.onGameOver();
        this.game.onMoveCountChange = (moves) => this.updateMoveCounter(moves);
        this.game.onTimeChange = (time) => this.updateTimer(time);
        
        this.showScreen('game-screen');
        this.game.render();
    }

    onLevelWin(stats) {
        this.audioManager.playSound('levelComplete');
        
        // Update progress
        const progress = this.storageManager.getProgress();
        progress.currentLevel = Math.max(progress.currentLevel, stats.level + 1);
        progress.totalMoves += stats.moves;
        progress.levelsCompleted[stats.level] = {
            moves: stats.moves,
            time: stats.time,
            completed: true
        };
        this.storageManager.saveProgress(progress);

        // Show win modal
        document.getElementById('win-moves').textContent = stats.moves;
        document.getElementById('win-time').textContent = this.formatTime(stats.time);
        
        // Check if there's a next level
        const nextLevelButton = document.getElementById('next-level-button');
        if (stats.level >= this.levelsManager.getTotalLevels()) {
            nextLevelButton.style.display = 'none';
        } else {
            nextLevelButton.style.display = 'block';
        }
        
        this.showModal('win-modal');
    }

    onGameOver() {
        this.showModal('game-over-modal');
    }

    nextLevel() {
        this.hideModal('win-modal');
        if (this.game && this.game.level < this.levelsManager.getTotalLevels()) {
            this.startGame(this.game.level + 1);
        } else {
            this.onGameOver();
        }
    }

    restartLevel() {
        if (this.game) {
            this.game.restart();
        }
    }

    showHint() {
        if (this.game) {
            const hint = this.game.getHint();
            if (hint) {
                this.audioManager.playSound('hint');
                // Highlight the suggested move
                this.game.highlightHint(hint);
            }
        }
    }

    undoMove() {
        if (this.game) {
            const success = this.game.undoLastMove();
            if (success) {
                this.audioManager.playSound('undo');
            }
        }
    }

    showLevelSelect() {
        this.showScreen('level-select');
    }

    updateLevelSelect() {
        const levelGrid = document.getElementById('level-grid');
        const progress = this.storageManager.getProgress();
        
        levelGrid.innerHTML = '';
        
        for (let i = 1; i <= this.levelsManager.getTotalLevels(); i++) {
            const levelItem = document.createElement('div');
            levelItem.className = 'level-item';
            levelItem.textContent = i;
            
            if (i <= progress.currentLevel) {
                levelItem.classList.add('unlocked');
                levelItem.addEventListener('click', () => {
                    this.startGame(i);
                });
                
                if (progress.levelsCompleted[i]?.completed) {
                    levelItem.classList.add('completed');
                }
            } else {
                levelItem.classList.add('locked');
            }
            
            levelGrid.appendChild(levelItem);
        }
    }

    showSettings() {
        // Load current settings
        const settings = this.storageManager.getSettings();
        document.getElementById('sound-toggle').checked = settings.soundEnabled;
        document.getElementById('music-toggle').checked = settings.musicEnabled;
        document.getElementById('animations-toggle').checked = settings.animationsEnabled;
        
        this.showScreen('settings');
    }

    loadSettings() {
        const settings = this.storageManager.getSettings();
        this.audioManager.setSoundEnabled(settings.soundEnabled);
        this.audioManager.setMusicEnabled(settings.musicEnabled);
        document.body.classList.toggle('no-animations', !settings.animationsEnabled);
    }

    saveSettings() {
        const settings = {
            soundEnabled: document.getElementById('sound-toggle').checked,
            musicEnabled: document.getElementById('music-toggle').checked,
            animationsEnabled: document.getElementById('animations-toggle').checked
        };
        this.storageManager.saveSettings(settings);
    }

    loadProgress() {
        this.updateMainMenuStats();
    }

    updateMainMenuStats() {
        try {
            const progress = this.storageManager.getProgress();
            const bestLevelEl = document.getElementById('best-level');
            const totalMovesEl = document.getElementById('total-moves');
            
            if (bestLevelEl) bestLevelEl.textContent = progress.currentLevel;
            if (totalMovesEl) totalMovesEl.textContent = progress.totalMoves;
        } catch (error) {
            console.error('Error updating main menu stats:', error);
        }
    }

    updateMoveCounter(moves) {
        try {
            const moveCounterEl = document.getElementById('move-counter');
            const undoButtonEl = document.getElementById('undo-button');
            
            if (moveCounterEl) moveCounterEl.textContent = moves;
            if (undoButtonEl && this.game) undoButtonEl.disabled = !this.game.canUndo();
        } catch (error) {
            console.error('Error updating move counter:', error);
        }
    }

    updateTimer(seconds) {
        try {
            const timerEl = document.getElementById('timer');
            if (timerEl) timerEl.textContent = this.formatTime(seconds);
        } catch (error) {
            console.error('Error updating timer:', error);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ballSortApp = new BallSortApp();
});
