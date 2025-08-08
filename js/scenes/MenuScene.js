class MenuScene {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.active = false;
        this.animationTime = 0;
        this.selectedOption = 0;
        this.options = [
            { text: 'Start Game', action: () => this.gameEngine.startMatch() },
            { text: 'How to Play', action: () => this.showInstructions() }
        ];
    }
    
    enter() {
        this.active = true;
        this.animationTime = 0;
        this.selectedOption = 0;
        
        // Show menu overlay
        document.getElementById('game-menu').style.display = 'flex';
        
        // Hide other overlays
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('game-over').style.display = 'none';
    }
    
    exit() {
        this.active = false;
        
        // Hide menu overlay
        document.getElementById('game-menu').style.display = 'none';
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        this.animationTime += deltaTime;
    }
    
    render(ctx) {
        if (!this.active) return;
        
        // Draw background
        this.drawBackground(ctx);
        
        // Draw animated elements
        this.drawAnimatedElements(ctx);
    }
    
    drawBackground(ctx) {
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        gradient.addColorStop(0, '#1e3c72');
        gradient.addColorStop(1, '#2a5298');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw some animated background elements
        this.drawBackgroundElements(ctx);
    }
    
    drawBackgroundElements(ctx) {
        // Draw floating footballs
        const time = this.animationTime * 0.001;
        
        for (let i = 0; i < 5; i++) {
            const x = (ctx.canvas.width * 0.2) + Math.sin(time + i) * 100;
            const y = (ctx.canvas.height * 0.3) + Math.cos(time * 0.7 + i) * 50;
            const size = 10 + Math.sin(time * 2 + i) * 5;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw football pattern
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    drawAnimatedElements(ctx) {
        // Draw title with animation
        const titleY = ctx.canvas.height * 0.2 + Math.sin(this.animationTime * 0.002) * 10;
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText('PES 90', ctx.canvas.width / 2, titleY);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw subtitle
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.fillText('90 seconds of football action!', ctx.canvas.width / 2, titleY + 50);
        
        // Draw animated football field
        this.drawFieldPreview(ctx);
    }
    
    drawFieldPreview(ctx) {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height * 0.6;
        const fieldWidth = 300;
        const fieldHeight = 200;
        
        // Field background
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(centerX - fieldWidth / 2, centerY - fieldHeight / 2, fieldWidth, fieldHeight);
        
        // Field lines
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        // Center line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - fieldHeight / 2);
        ctx.lineTo(centerX, centerY + fieldHeight / 2);
        ctx.stroke();
        
        // Center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        ctx.stroke();
        
        // Goals
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX - fieldWidth / 2 - 5, centerY - 20, 5, 40);
        ctx.fillRect(centerX + fieldWidth / 2, centerY - 20, 5, 40);
        
        // Animated ball
        const ballX = centerX + Math.sin(this.animationTime * 0.003) * 100;
        const ballY = centerY + Math.cos(this.animationTime * 0.002) * 30;
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    showInstructions() {
        // Create instructions modal
        const instructions = `
            <div style="text-align: left; line-height: 1.6;">
                <h3>How to Play:</h3>
                <p><strong>Desktop Controls:</strong></p>
                <ul>
                    <li>Arrow Keys or WASD - Move player</li>
                    <li>Spacebar - Shoot/Pass</li>
                    <li>Shift - Sprint</li>
                    <li>Enter - Pause/Resume</li>
                </ul>
                <p><strong>Mobile Controls:</strong></p>
                <ul>
                    <li>Joystick - Move player</li>
                    <li>Shoot button - Shoot/Pass</li>
                    <li>Sprint button - Sprint</li>
                </ul>
                <p><strong>Objective:</strong></p>
                <ul>
                    <li>Score more goals than the opponent in 90 seconds</li>
                    <li>Get close to the ball to gain possession</li>
                    <li>Pass to teammates or shoot at the goal</li>
                </ul>
            </div>
        `;
        
        // Show instructions in a modal
        alert(instructions);
    }
    
    // Input handling
    handleKeyDown(keyCode) {
        switch (keyCode) {
            case 'ArrowUp':
                this.selectedOption = Math.max(0, this.selectedOption - 1);
                break;
            case 'ArrowDown':
                this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
                break;
            case 'Enter':
            case 'Space':
                this.options[this.selectedOption].action();
                break;
        }
    }
} 