// Main game logic class
class BallSortGame {
    constructor(level, levelsManager, audioManager, storageManager) {
        this.level = level;
        this.levelsManager = levelsManager;
        this.audioManager = audioManager;
        this.storageManager = storageManager;
        
        this.tubes = [];
        this.selectedTube = null;
        this.moves = 0;
        this.startTime = Date.now();
        this.gameWon = false;
        this.moveHistory = [];
        
        this.onWin = null;
        this.onGameOver = null;
        this.onMoveCountChange = null;
        this.onTimeChange = null;
        
        this.timer = null;
        
        this.init();
    }

    init() {
        const levelData = this.levelsManager.getLevel(this.level);
        this.tubes = this.createTubes(levelData);
        this.moves = 0;
        this.startTime = Date.now();
        this.gameWon = false;
        this.moveHistory = [];
        this.selectedTube = null;
        
        this.startTimer();
        this.updateUI();
    }

    createTubes(levelData) {
        const tubes = [];
        
        // Create filled tubes
        for (let i = 0; i < levelData.filledTubes; i++) {
            const tube = new Tube(i, levelData.tubeCapacity);
            tubes.push(tube);
        }
        
        // Create empty tubes
        for (let i = 0; i < levelData.emptyTubes; i++) {
            const tube = new Tube(levelData.filledTubes + i, levelData.tubeCapacity);
            tubes.push(tube);
        }
        
        // Fill tubes with balls according to level configuration
        this.fillTubesWithBalls(tubes, levelData);
        
        return tubes;
    }

    fillTubesWithBalls(tubes, levelData) {
        const colors = levelData.colors;
        const ballsPerColor = levelData.tubeCapacity;
        const filledTubes = levelData.filledTubes;
        
        // Create balls for each color
        const allBalls = [];
        colors.forEach(color => {
            for (let i = 0; i < ballsPerColor; i++) {
                allBalls.push(new Ball(color));
            }
        });
        
        // Shuffle balls for random distribution
        this.shuffleArray(allBalls);
        
        // Distribute balls among filled tubes
        let ballIndex = 0;
        for (let tubeIndex = 0; tubeIndex < filledTubes; tubeIndex++) {
            const tube = tubes[tubeIndex];
            for (let i = 0; i < levelData.tubeCapacity && ballIndex < allBalls.length; i++) {
                tube.addBall(allBalls[ballIndex]);
                ballIndex++;
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    render() {
        const container = document.getElementById('tubes-container');
        container.innerHTML = '';
        
        // Update level display
        document.getElementById('current-level').textContent = this.level;
        
        this.tubes.forEach((tube, index) => {
            const tubeElement = this.createTubeElement(tube, index);
            container.appendChild(tubeElement);
        });
        
        this.updateUI();
    }

    createTubeElement(tube, index) {
        const tubeElement = document.createElement('div');
        tubeElement.className = 'tube';
        tubeElement.dataset.tubeIndex = index;
        
        // Add balls to tube
        tube.balls.forEach((ball, ballIndex) => {
            const ballElement = this.createBallElement(ball, index, ballIndex);
            tubeElement.appendChild(ballElement);
        });
        
        // Add click event listener
        tubeElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleTubeClick(index);
        });
        
        // Add touch events for mobile
        tubeElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTubeTouch(index, tubeElement);
        });
        
        return tubeElement;
    }

    createBallElement(ball, tubeIndex, ballIndex) {
        const ballElement = document.createElement('div');
        ballElement.className = `ball ${ball.color}`;
        ballElement.dataset.tubeIndex = tubeIndex;
        ballElement.dataset.ballIndex = ballIndex;
        
        // Add drag functionality
        ballElement.draggable = true;
        ballElement.addEventListener('dragstart', (e) => {
            this.handleDragStart(e, tubeIndex);
        });
        
        ballElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleBallClick(tubeIndex);
        });
        
        return ballElement;
    }

    handleTubeClick(tubeIndex) {
        if (this.gameWon) return;
        
        const tube = this.tubes[tubeIndex];
        
        if (this.selectedTube === null) {
            // Select tube if it has balls
            if (tube.balls.length > 0) {
                this.selectTube(tubeIndex);
            }
        } else if (this.selectedTube === tubeIndex) {
            // Deselect if clicking the same tube
            this.deselectTube();
        } else {
            // Try to move ball to this tube
            this.attemptMove(this.selectedTube, tubeIndex);
        }
    }

    handleBallClick(tubeIndex) {
        if (this.gameWon) return;
        
        const tube = this.tubes[tubeIndex];
        const topBallIndex = tube.balls.length - 1;
        
        // Only allow clicking the top ball
        if (topBallIndex >= 0) {
            this.handleTubeClick(tubeIndex);
        }
    }

    handleTubeTouch(tubeIndex, tubeElement) {
        // Add visual feedback for touch
        tubeElement.classList.add('touch-highlight');
        setTimeout(() => {
            tubeElement.classList.remove('touch-highlight');
        }, 200);
        
        this.handleTubeClick(tubeIndex);
    }

    handleDragStart(e, tubeIndex) {
        if (this.gameWon) return;
        
        const tube = this.tubes[tubeIndex];
        if (tube.balls.length === 0) {
            e.preventDefault();
            return;
        }
        
        e.dataTransfer.setData('text/plain', tubeIndex.toString());
        this.selectTube(tubeIndex);
        
        // Add drag effects
        setTimeout(() => {
            document.querySelectorAll('.tube').forEach((tubeEl, index) => {
                if (index !== tubeIndex) {
                    const canMove = this.canMoveBall(tubeIndex, index);
                    tubeEl.classList.toggle('valid-drop', canMove);
                    tubeEl.classList.toggle('invalid-drop', !canMove);
                }
            });
        }, 0);
    }

    selectTube(tubeIndex) {
        this.deselectTube();
        this.selectedTube = tubeIndex;
        
        const tubeElement = document.querySelector(`[data-tube-index="${tubeIndex}"]`);
        tubeElement.classList.add('selected');
        
        // Highlight all balls in the group that will be moved
        const tube = this.tubes[tubeIndex];
        const ballGroup = this.getTopBallGroup(tube);
        const ballElements = tubeElement.querySelectorAll('.ball');
        
        // Highlight the balls in the group (from the top)
        const startIndex = tube.balls.length - ballGroup.length;
        for (let i = startIndex; i < tube.balls.length; i++) {
            if (ballElements[i]) {
                ballElements[i].classList.add('touch-highlight');
            }
        }
        
        this.audioManager.playSound('select');
    }

    deselectTube() {
        if (this.selectedTube !== null) {
            const tubeElement = document.querySelector(`[data-tube-index="${this.selectedTube}"]`);
            tubeElement.classList.remove('selected');
            
            // Remove highlights from all balls
            const ballElements = tubeElement.querySelectorAll('.ball');
            ballElements.forEach(ball => {
                ball.classList.remove('touch-highlight');
            });
        }
        
        this.selectedTube = null;
        
        // Remove drop indicators
        document.querySelectorAll('.tube').forEach(tube => {
            tube.classList.remove('valid-drop', 'invalid-drop');
        });
    }

    attemptMove(fromTubeIndex, toTubeIndex) {
        if (this.canMoveBall(fromTubeIndex, toTubeIndex)) {
            this.moveBall(fromTubeIndex, toTubeIndex);
        } else {
            this.audioManager.playSound('invalid');
            this.shakeInvalidTube(toTubeIndex);
        }
        
        this.deselectTube();
    }

    canMoveBall(fromTubeIndex, toTubeIndex) {
        const fromTube = this.tubes[fromTubeIndex];
        const toTube = this.tubes[toTubeIndex];
        
        // Can't move from empty tube
        if (fromTube.balls.length === 0) return false;
        
        // Get the group of balls to move
        const ballsToMove = this.getTopBallGroup(fromTube);
        
        // Can't move to tube that doesn't have enough space
        if (toTube.balls.length + ballsToMove.length > toTube.capacity) return false;
        
        // Can move to empty tube
        if (toTube.balls.length === 0) return true;
        
        // Can move if colors match
        const fromBall = ballsToMove[0]; // First ball of the group
        const toBall = toTube.getTopBall();
        
        return fromBall.color === toBall.color;
    }

    moveBall(fromTubeIndex, toTubeIndex) {
        const fromTube = this.tubes[fromTubeIndex];
        const toTube = this.tubes[toTubeIndex];
        
        // Get the group of balls to move
        const ballsToMove = this.getTopBallGroup(fromTube);
        
        // Record move for undo functionality
        this.moveHistory.push({
            from: fromTubeIndex,
            to: toTubeIndex,
            balls: [...ballsToMove], // Store all balls being moved
            count: ballsToMove.length
        });
        
        // Perform the move for all balls in the group
        for (let i = 0; i < ballsToMove.length; i++) {
            const ball = fromTube.removeBall();
            toTube.addBall(ball);
        }
        
        this.moves++;
        this.updateUI();
        
        // Animate the move
        this.animateMove(fromTubeIndex, toTubeIndex, () => {
            this.audioManager.playSound('move');
            
            // Check for win condition
            if (this.checkWinCondition()) {
                this.handleWin();
            }
        });
    }

    animateMove(fromTubeIndex, toTubeIndex, callback) {
        const fromTubeElement = document.querySelector(`[data-tube-index="${fromTubeIndex}"]`);
        const toTubeElement = document.querySelector(`[data-tube-index="${toTubeIndex}"]`);
        
        // Re-render to update DOM
        this.render();
        
        // Add animation class to the moved ball
        const movedBall = toTubeElement.querySelector('.ball:last-child');
        if (movedBall) {
            movedBall.classList.add('dropping');
            setTimeout(() => {
                movedBall.classList.remove('dropping');
                if (callback) callback();
            }, 500);
        } else {
            if (callback) callback();
        }
    }

    shakeInvalidTube(tubeIndex) {
        const tubeElement = document.querySelector(`[data-tube-index="${tubeIndex}"]`);
        tubeElement.classList.add('shake');
        setTimeout(() => {
            tubeElement.classList.remove('shake');
        }, 300);
    }

    checkWinCondition() {
        return this.tubes.every(tube => {
            // Empty tubes are okay
            if (tube.balls.length === 0) return true;
            
            const firstColor = tube.balls[0].color;
            return tube.balls.every(ball => ball.color === firstColor);
        });
    }

    handleWin() {
        this.gameWon = true;
        this.stopTimer();
        
        // Add celebration animation
        document.querySelectorAll('.ball').forEach((ball, index) => {
            setTimeout(() => {
                ball.classList.add('celebrate');
            }, index * 50);
        });
        
        const stats = {
            level: this.level,
            moves: this.moves,
            time: this.getElapsedTime()
        };
        
        setTimeout(() => {
            if (this.onWin) {
                this.onWin(stats);
            }
        }, 1000);
    }

    getHint() {
        // Simple hint algorithm - find a valid move
        for (let fromIndex = 0; fromIndex < this.tubes.length; fromIndex++) {
            for (let toIndex = 0; toIndex < this.tubes.length; toIndex++) {
                if (fromIndex !== toIndex && this.canMoveBall(fromIndex, toIndex)) {
                    return { from: fromIndex, to: toIndex };
                }
            }
        }
        return null;
    }

    highlightHint(hint) {
        if (!hint) return;
        
        const fromTube = document.querySelector(`[data-tube-index="${hint.from}"]`);
        const toTube = document.querySelector(`[data-tube-index="${hint.to}"]`);
        
        fromTube.classList.add('selected');
        toTube.classList.add('valid-drop');
        
        setTimeout(() => {
            fromTube.classList.remove('selected');
            toTube.classList.remove('valid-drop');
        }, 2000);
    }

    getTopBallGroup(tube) {
        if (tube.balls.length === 0) return [];
        
        const topBall = tube.getTopBall();
        const group = [topBall];
        
        // Look for consecutive balls of the same color from the top
        for (let i = tube.balls.length - 2; i >= 0; i--) {
            if (tube.balls[i].color === topBall.color) {
                group.unshift(tube.balls[i]); // Add to beginning since we're going backwards
            } else {
                break; // Stop when we find a different color
            }
        }
        
        return group;
    }

    undoLastMove() {
        if (this.moveHistory.length === 0) return false;
        
        const lastMove = this.moveHistory.pop();
        const fromTube = this.tubes[lastMove.to];
        const toTube = this.tubes[lastMove.from];
        
        // Reverse the move for all balls that were moved
        const ballCount = lastMove.count || 1; // Handle old single-ball moves
        for (let i = 0; i < ballCount; i++) {
            const ball = fromTube.removeBall();
            toTube.addBall(ball);
        }
        
        this.moves = Math.max(0, this.moves - 1);
        this.updateUI();
        this.render();
        
        return true;
    }

    canUndo() {
        return this.moveHistory.length > 0 && !this.gameWon;
    }

    restart() {
        this.stopTimer();
        this.init();
        this.render();
    }

    startTimer() {
        this.timer = setInterval(() => {
            if (this.onTimeChange) {
                this.onTimeChange(this.getElapsedTime());
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    getElapsedTime() {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    updateUI() {
        if (this.onMoveCountChange) {
            this.onMoveCountChange(this.moves);
        }
    }
}

// Tube class to manage individual tubes
class Tube {
    constructor(id, capacity = 4) {
        this.id = id;
        this.capacity = capacity;
        this.balls = [];
    }

    addBall(ball) {
        if (this.balls.length < this.capacity) {
            this.balls.push(ball);
            return true;
        }
        return false;
    }

    removeBall() {
        return this.balls.pop();
    }

    getTopBall() {
        return this.balls[this.balls.length - 1] || null;
    }

    isEmpty() {
        return this.balls.length === 0;
    }

    isFull() {
        return this.balls.length >= this.capacity;
    }

    isComplete() {
        if (this.isEmpty()) return true;
        if (!this.isFull()) return false;
        
        const firstColor = this.balls[0].color;
        return this.balls.every(ball => ball.color === firstColor);
    }
}

// Ball class to manage individual balls
class Ball {
    constructor(color) {
        this.color = color;
        this.id = Math.random().toString(36).substr(2, 9);
    }
}
