// Local storage management for game progress and settings
class StorageManager {
    constructor() {
        this.storageKey = 'ballSortPuzzle';
        this.settingsKey = 'ballSortPuzzleSettings';
        this.defaultProgress = {
            currentLevel: 1,
            totalMoves: 0,
            totalTime: 0,
            levelsCompleted: {},
            highScores: {},
            achievements: [],
            lastPlayed: null
        };
        this.defaultSettings = {
            soundEnabled: true,
            musicEnabled: true,
            animationsEnabled: true,
            theme: 'default',
            language: 'en'
        };
    }

    // Progress Management
    getProgress() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const progress = JSON.parse(stored);
                // Merge with defaults to handle new properties
                return { ...this.defaultProgress, ...progress };
            }
        } catch (error) {
            console.warn('Error reading progress from localStorage:', error);
        }
        return { ...this.defaultProgress };
    }

    saveProgress(progress) {
        try {
            const updatedProgress = {
                ...progress,
                lastPlayed: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(updatedProgress));
            return true;
        } catch (error) {
            console.error('Error saving progress to localStorage:', error);
            return false;
        }
    }

    updateLevelProgress(level, stats) {
        const progress = this.getProgress();
        
        // Update current level if this is a new best
        progress.currentLevel = Math.max(progress.currentLevel, level + 1);
        
        // Update level completion data
        if (!progress.levelsCompleted[level] || 
            !progress.levelsCompleted[level].moves || 
            stats.moves < progress.levelsCompleted[level].moves) {
            
            progress.levelsCompleted[level] = {
                ...stats,
                completed: true,
                bestMoves: Math.min(stats.moves, progress.levelsCompleted[level]?.bestMoves || Infinity),
                bestTime: Math.min(stats.time, progress.levelsCompleted[level]?.bestTime || Infinity),
                completedAt: Date.now()
            };
        }
        
        // Update totals
        progress.totalMoves += stats.moves;
        progress.totalTime += stats.time;
        
        // Check for achievements
        this.checkAchievements(progress, level, stats);
        
        return this.saveProgress(progress);
    }

    resetProgress() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error resetting progress:', error);
            return false;
        }
    }

    // Settings Management
    getSettings() {
        try {
            const stored = localStorage.getItem(this.settingsKey);
            if (stored) {
                const settings = JSON.parse(stored);
                return { ...this.defaultSettings, ...settings };
            }
        } catch (error) {
            console.warn('Error reading settings from localStorage:', error);
        }
        return { ...this.defaultSettings };
    }

    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings to localStorage:', error);
            return false;
        }
    }

    // High Scores
    getHighScores(level) {
        const progress = this.getProgress();
        return progress.highScores[level] || null;
    }

    updateHighScore(level, stats) {
        const progress = this.getProgress();
        const currentHigh = progress.highScores[level];
        
        if (!currentHigh || 
            stats.moves < currentHigh.moves || 
            (stats.moves === currentHigh.moves && stats.time < currentHigh.time)) {
            
            progress.highScores[level] = {
                ...stats,
                achievedAt: Date.now()
            };
            
            this.saveProgress(progress);
            return true;
        }
        
        return false;
    }

    // Achievements System
    checkAchievements(progress, level, stats) {
        const newAchievements = [];
        
        // First completion
        if (level === 1 && !progress.achievements.includes('first_win')) {
            newAchievements.push('first_win');
        }
        
        // Perfect game (minimum moves)
        const minMovesForLevel = this.calculateMinMoves(level);
        if (stats.moves <= minMovesForLevel && !progress.achievements.includes('perfect_game')) {
            newAchievements.push('perfect_game');
        }
        
        // Speed demon (complete in under 30 seconds)
        if (stats.time <= 30 && !progress.achievements.includes('speed_demon')) {
            newAchievements.push('speed_demon');
        }
        
        // Level milestones
        const milestones = [5, 10, 20, 30, 40];
        milestones.forEach(milestone => {
            if (level >= milestone && !progress.achievements.includes(`level_${milestone}`)) {
                newAchievements.push(`level_${milestone}`);
            }
        });
        
        // Persistence (100 total moves)
        if (progress.totalMoves >= 100 && !progress.achievements.includes('persistent')) {
            newAchievements.push('persistent');
        }
        
        // Dedication (1000 total moves)
        if (progress.totalMoves >= 1000 && !progress.achievements.includes('dedicated')) {
            newAchievements.push('dedicated');
        }
        
        // Add new achievements
        progress.achievements.push(...newAchievements);
        
        return newAchievements;
    }

    calculateMinMoves(level) {
        // Rough calculation of minimum moves needed for a level
        // This is a simplified calculation
        if (level <= 5) return 8;
        if (level <= 10) return 12;
        if (level <= 20) return 16;
        if (level <= 30) return 20;
        return 24;
    }

    getAchievements() {
        const progress = this.getProgress();
        return progress.achievements || [];
    }

    // Statistics
    getStatistics() {
        const progress = this.getProgress();
        const stats = {
            totalLevelsCompleted: Object.keys(progress.levelsCompleted).length,
            currentLevel: progress.currentLevel,
            totalMoves: progress.totalMoves,
            totalTime: progress.totalTime,
            averageMovesPerLevel: 0,
            averageTimePerLevel: 0,
            bestLevel: progress.currentLevel,
            achievements: progress.achievements.length,
            lastPlayed: progress.lastPlayed
        };
        
        if (stats.totalLevelsCompleted > 0) {
            stats.averageMovesPerLevel = Math.round(progress.totalMoves / stats.totalLevelsCompleted);
            stats.averageTimePerLevel = Math.round(progress.totalTime / stats.totalLevelsCompleted);
        }
        
        return stats;
    }

    // Export/Import functionality
    exportData() {
        try {
            const progress = this.getProgress();
            const settings = this.getSettings();
            const exportData = {
                progress,
                settings,
                exportedAt: Date.now(),
                version: '1.0'
            };
            
            return JSON.stringify(exportData);
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    importData(dataString) {
        try {
            const importData = JSON.parse(dataString);
            
            if (!importData.progress || !importData.settings) {
                throw new Error('Invalid data format');
            }
            
            // Validate and save progress
            const progress = { ...this.defaultProgress, ...importData.progress };
            const settings = { ...this.defaultSettings, ...importData.settings };
            
            this.saveProgress(progress);
            this.saveSettings(settings);
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Backup functionality
    createBackup() {
        const backup = {
            timestamp: Date.now(),
            data: this.exportData()
        };
        
        try {
            const backups = this.getBackups();
            backups.push(backup);
            
            // Keep only last 5 backups
            if (backups.length > 5) {
                backups.splice(0, backups.length - 5);
            }
            
            localStorage.setItem(`${this.storageKey}_backups`, JSON.stringify(backups));
            return true;
        } catch (error) {
            console.error('Error creating backup:', error);
            return false;
        }
    }

    getBackups() {
        try {
            const stored = localStorage.getItem(`${this.storageKey}_backups`);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Error reading backups:', error);
            return [];
        }
    }

    restoreBackup(backupIndex) {
        try {
            const backups = this.getBackups();
            if (backupIndex >= 0 && backupIndex < backups.length) {
                const backup = backups[backupIndex];
                return this.importData(backup.data);
            }
            return false;
        } catch (error) {
            console.error('Error restoring backup:', error);
            return false;
        }
    }

    // Storage health check
    isStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    getStorageSize() {
        if (!this.isStorageAvailable()) return 0;
        
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        
        return total;
    }

    // Clean up old data
    cleanup() {
        try {
            // Remove old backup format if exists
            localStorage.removeItem(`${this.storageKey}_old`);
            
            // Ensure current data is valid
            const progress = this.getProgress();
            const settings = this.getSettings();
            
            this.saveProgress(progress);
            this.saveSettings(settings);
            
            return true;
        } catch (error) {
            console.error('Error during cleanup:', error);
            return false;
        }
    }
}
