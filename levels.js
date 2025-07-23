// Level management class
class LevelsManager {
    constructor() {
        this.levels = this.generateLevels();
    }

    generateLevels() {
        const levels = [];
        
        // Level 1-5: Basic levels with 4 colors
        for (let i = 1; i <= 5; i++) {
            levels.push({
                level: i,
                colors: ['red', 'blue', 'green', 'yellow'],
                filledTubes: 4,
                emptyTubes: 2,
                tubeCapacity: 4,
                difficulty: 'easy'
            });
        }
        
        // Level 6-10: Introduce 5th color
        for (let i = 6; i <= 10; i++) {
            levels.push({
                level: i,
                colors: ['red', 'blue', 'green', 'yellow', 'purple'],
                filledTubes: 5,
                emptyTubes: 2,
                tubeCapacity: 4,
                difficulty: 'medium'
            });
        }
        
        // Level 11-15: Add 6th color and more tubes
        for (let i = 11; i <= 15; i++) {
            levels.push({
                level: i,
                colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
                filledTubes: 6,
                emptyTubes: 2,
                tubeCapacity: 4,
                difficulty: 'medium'
            });
        }
        
        // Level 16-20: 7 colors
        for (let i = 16; i <= 20; i++) {
            levels.push({
                level: i,
                colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan'],
                filledTubes: 7,
                emptyTubes: 2,
                tubeCapacity: 4,
                difficulty: 'hard'
            });
        }
        
        // Level 21-25: 8 colors
        for (let i = 21; i <= 25; i++) {
            levels.push({
                level: i,
                colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'pink'],
                filledTubes: 8,
                emptyTubes: 2,
                tubeCapacity: 4,
                difficulty: 'hard'
            });
        }
        
        // Level 26-30: 9 colors, fewer empty tubes
        for (let i = 26; i <= 30; i++) {
            levels.push({
                level: i,
                colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'pink', 'lime'],
                filledTubes: 9,
                emptyTubes: 1,
                tubeCapacity: 4,
                difficulty: 'expert'
            });
        }
        
        // Level 31-35: 10 colors, only 1 empty tube
        for (let i = 31; i <= 35; i++) {
            levels.push({
                level: i,
                colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'pink', 'lime', 'brown'],
                filledTubes: 10,
                emptyTubes: 1,
                tubeCapacity: 4,
                difficulty: 'expert'
            });
        }
        
        // Level 36-40: Maximum difficulty with capacity 5
        for (let i = 36; i <= 40; i++) {
            levels.push({
                level: i,
                colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'pink'],
                filledTubes: 8,
                emptyTubes: 1,
                tubeCapacity: 5,
                difficulty: 'master'
            });
        }
        
        return levels;
    }

    getLevel(levelNumber) {
        const level = this.levels.find(l => l.level === levelNumber);
        if (!level) {
            // Return a default level if requested level doesn't exist
            return {
                level: levelNumber,
                colors: ['red', 'blue', 'green', 'yellow'],
                filledTubes: 4,
                emptyTubes: 2,
                tubeCapacity: 4,
                difficulty: 'easy'
            };
        }
        return { ...level }; // Return a copy to prevent modification
    }

    getTotalLevels() {
        return this.levels.length;
    }

    getLevelDifficulty(levelNumber) {
        const level = this.getLevel(levelNumber);
        return level.difficulty;
    }

    getDifficultyColor(difficulty) {
        const colors = {
            'easy': '#28a745',
            'medium': '#ffc107',
            'hard': '#fd7e14',
            'expert': '#dc3545',
            'master': '#6f42c1'
        };
        return colors[difficulty] || '#6c757d';
    }

    getLevelsByDifficulty(difficulty) {
        return this.levels.filter(level => level.difficulty === difficulty);
    }

    getNextLevel(currentLevel) {
        if (currentLevel < this.getTotalLevels()) {
            return this.getLevel(currentLevel + 1);
        }
        return null;
    }

    getPreviousLevel(currentLevel) {
        if (currentLevel > 1) {
            return this.getLevel(currentLevel - 1);
        }
        return null;
    }

    // Generate a custom level for testing or special events
    generateCustomLevel(config) {
        const defaultConfig = {
            level: 1,
            colors: ['red', 'blue', 'green', 'yellow'],
            filledTubes: 4,
            emptyTubes: 2,
            tubeCapacity: 4,
            difficulty: 'custom'
        };
        
        return { ...defaultConfig, ...config };
    }

    // Validate level configuration
    validateLevel(levelConfig) {
        const required = ['level', 'colors', 'filledTubes', 'emptyTubes', 'tubeCapacity'];
        
        for (const field of required) {
            if (!(field in levelConfig)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        if (levelConfig.colors.length === 0) {
            throw new Error('Level must have at least one color');
        }
        
        if (levelConfig.filledTubes < 1) {
            throw new Error('Level must have at least one filled tube');
        }
        
        if (levelConfig.emptyTubes < 1) {
            throw new Error('Level must have at least one empty tube');
        }
        
        if (levelConfig.tubeCapacity < 1) {
            throw new Error('Tube capacity must be at least 1');
        }
        
        // Check if the level is solvable (basic check)
        const totalBalls = levelConfig.colors.length * levelConfig.tubeCapacity;
        const totalCapacity = (levelConfig.filledTubes + levelConfig.emptyTubes) * levelConfig.tubeCapacity;
        
        if (totalBalls > totalCapacity) {
            throw new Error('Level configuration would result in more balls than total tube capacity');
        }
        
        return true;
    }

    // Get level statistics
    getLevelStats() {
        const stats = {
            total: this.levels.length,
            byDifficulty: {},
            averageColors: 0,
            averageTubes: 0
        };
        
        let totalColors = 0;
        let totalTubes = 0;
        
        this.levels.forEach(level => {
            // Count by difficulty
            if (!stats.byDifficulty[level.difficulty]) {
                stats.byDifficulty[level.difficulty] = 0;
            }
            stats.byDifficulty[level.difficulty]++;
            
            // Sum for averages
            totalColors += level.colors.length;
            totalTubes += level.filledTubes + level.emptyTubes;
        });
        
        stats.averageColors = totalColors / this.levels.length;
        stats.averageTubes = totalTubes / this.levels.length;
        
        return stats;
    }
}
