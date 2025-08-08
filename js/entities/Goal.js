class Goal extends Entity {
    constructor(x, y, width, height, team) {
        super(x, y, width, height);
        this.team = team; // 'teamA' or 'teamB'
        this.tag = 'goal';
        this.active = true;
        
        // Goal properties
        this.color = team === 'teamA' ? '#ff6b6b' : '#4ecdc4';
        this.netColor = 'rgba(255, 255, 255, 0.3)';
        this.postColor = '#ffffff';
        this.postWidth = 5;
        
        // Goal dimensions
        this.goalWidth = width;
        this.goalHeight = height;
        this.depth = 20; // Goal depth
        
        // Visual effects
        this.glowIntensity = 0;
        this.maxGlowIntensity = 1;
        this.glowSpeed = 0.1;
    }
    
    update(deltaTime) {
        // Update glow effect
        if (this.glowIntensity > 0) {
            this.glowIntensity = Math.max(0, this.glowIntensity - this.glowSpeed * deltaTime);
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        // Draw goal posts
        ctx.strokeStyle = this.postColor;
        ctx.lineWidth = this.postWidth;
        ctx.lineCap = 'round';
        
        // Left post
        ctx.beginPath();
        ctx.moveTo(this.x - this.width / 2, this.y - this.height / 2);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
        ctx.stroke();
        
        // Right post
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y - this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.stroke();
        
        // Crossbar
        ctx.beginPath();
        ctx.moveTo(this.x - this.width / 2, this.y - this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y - this.height / 2);
        ctx.stroke();
        
        // Draw goal net
        this.drawNet(ctx);
        
        // Draw glow effect
        if (this.glowIntensity > 0) {
            this.drawGlow(ctx);
        }
    }
    
    drawNet(ctx) {
        ctx.strokeStyle = this.netColor;
        ctx.lineWidth = 1;
        
        // Vertical net lines
        const netSpacing = 10;
        for (let x = this.x - this.width / 2; x <= this.x + this.width / 2; x += netSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, this.y - this.height / 2);
            ctx.lineTo(x, this.y + this.height / 2);
            ctx.stroke();
        }
        
        // Horizontal net lines
        for (let y = this.y - this.height / 2; y <= this.y + this.height / 2; y += netSpacing) {
            ctx.beginPath();
            ctx.moveTo(this.x - this.width / 2, y);
            ctx.lineTo(this.x + this.width / 2, y);
            ctx.stroke();
        }
        
        // Diagonal net lines for depth effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < this.depth; i += 5) {
            const offset = i * 0.5;
            ctx.beginPath();
            ctx.moveTo(this.x - this.width / 2 - offset, this.y - this.height / 2 - offset);
            ctx.lineTo(this.x + this.width / 2 - offset, this.y - this.height / 2 - offset);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(this.x - this.width / 2 - offset, this.y + this.height / 2 - offset);
            ctx.lineTo(this.x + this.width / 2 - offset, this.y + this.height / 2 - offset);
            ctx.stroke();
        }
    }
    
    drawGlow(ctx) {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.width
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 0, ${this.glowIntensity * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            this.x - this.width,
            this.y - this.height,
            this.width * 2,
            this.height * 2
        );
    }
    
    triggerGlow() {
        this.glowIntensity = this.maxGlowIntensity;
    }
    
    // Goal detection methods
    isBallInGoal(ball) {
        const ballBounds = ball.getBounds();
        const goalBounds = this.getBounds();
        
        return ballBounds.left >= goalBounds.left &&
               ballBounds.right <= goalBounds.right &&
               ballBounds.top >= goalBounds.top &&
               ballBounds.bottom <= goalBounds.bottom;
    }
    
    getGoalCenter() {
        return {
            x: this.x,
            y: this.y
        };
    }
    
    // Get goal bounds for collision detection
    getBounds() {
        return {
            left: this.x - this.width / 2,
            right: this.x + this.width / 2,
            top: this.y - this.height / 2,
            bottom: this.y + this.height / 2
        };
    }
} 