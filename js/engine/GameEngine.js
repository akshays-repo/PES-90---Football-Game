class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentScene = null;
        this.scenes = {};
        this.isRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fixedTimeStep = 16.67; // 60 FPS (ms)
        this.accumulator = 0;
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.scores = { teamA: 0, teamB: 0 };
        this.matchTime = 90; // 90 seconds
        this.matchStartTime = 0;
        
        this.init();
    }
    
    init() {
        // Initialize scenes
        this.scenes.menu = new MenuScene(this);
        this.scenes.game = new GameScene(this);
        
        // Set initial scene
        this.switchScene('menu');
        this.gameState = 'menu';
        
        // Start game loop
        this.start();
    }
    
    start() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        // Calculate delta time (ms)
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Fixed timestep physics
        this.accumulator += this.deltaTime;
        
        while (this.accumulator >= this.fixedTimeStep) {
            this.update(this.fixedTimeStep);
            this.accumulator -= this.fixedTimeStep;
        }
        
        // Render at variable framerate
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTimeMs) {
        // Convert to seconds for game logic/physics
        const dt = deltaTimeMs / 1000;
        
        if (this.currentScene) {
            this.currentScene.update(dt);
        }
        
        // Update match timer
        if (this.gameState === 'playing') {
            const elapsed = (Date.now() - this.matchStartTime) / 1000;
            this.matchTime = Math.max(0, 90 - elapsed);
            
            if (this.matchTime <= 0) {
                this.endMatch();
            }
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.currentScene) {
            this.currentScene.render(this.ctx);
        }
    }
    
    switchScene(sceneName) {
        if (this.currentScene) {
            this.currentScene.exit();
        }
        
        this.currentScene = this.scenes[sceneName];
        
        // Align gameState to known states
        if (sceneName === 'menu') {
            this.gameState = 'menu';
        } else if (sceneName === 'game') {
            this.gameState = 'playing';
        }
        
        if (this.currentScene) {
            this.currentScene.enter();
        }
    }
    
    startMatch() {
        this.scores = { teamA: 0, teamB: 0 };
        this.matchTime = 90;
        this.matchStartTime = Date.now();
        this.switchScene('game');
        this.updateUI();
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showPauseMenu();
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hidePauseMenu();
            this.matchStartTime = Date.now() - ((90 - this.matchTime) * 1000);
        }
    }
    
    endMatch() {
        this.gameState = 'gameOver';
        this.showGameOver();
    }
    
    updateScore(team, points = 1) {
        this.scores[team] += points;
        this.updateUI();
    }
    
    updateUI() {
        // Update score display
        document.getElementById('score-a').textContent = this.scores.teamA;
        document.getElementById('score-b').textContent = this.scores.teamB;
        
        // Update timer
        document.getElementById('time-display').textContent = Math.ceil(this.matchTime);
    }
    
    showPauseMenu() {
        document.getElementById('pause-menu').style.display = 'flex';
    }
    
    hidePauseMenu() {
        document.getElementById('pause-menu').style.display = 'none';
    }
    
    showGameOver() {
        const finalScore = document.getElementById('final-score');
        const winner = this.scores.teamA > this.scores.teamB ? 'Team A' : 
                      this.scores.teamB > this.scores.teamA ? 'Team B' : 'Draw';
        
        finalScore.innerHTML = `
            <div>Team A: ${this.scores.teamA}</div>
            <div>Team B: ${this.scores.teamB}</div>
            <div style="margin-top: 10px; font-size: 20px; color: #4CAF50;">
                ${winner === 'Draw' ? 'It\'s a Draw!' : winner + ' Wins!'}
            </div>
        `;
        
        document.getElementById('game-over').style.display = 'flex';
    }
    
    hideGameOver() {
        document.getElementById('game-over').style.display = 'none';
    }
    
    // Utility methods
    getCanvasSize() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
    
    isMobile() {
        return window.innerWidth <= 768;
    }
}

// Node export for tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
} 