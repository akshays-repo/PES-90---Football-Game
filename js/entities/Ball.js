class Ball extends Entity {
    constructor(x, y) {
        super(x, y, 12, 12);
        this.radius = 6;
        this.maxSpeed = 400;
        this.friction = 0.98; // Ball has more friction than players
        this.tag = 'ball';
        
        // Ball physics
        this.bounceFactor = 0.7;
        this.possessor = null;
        this.lastPossessor = null;
        this.possessorTimer = 0;
        this.maxPossessorTime = 1000; // 1 second
        
        // Visual properties
        this.color = '#ffffff';
        this.trail = [];
        this.maxTrailLength = 10;
        
        // Sound effects (placeholder)
        this.lastKickTime = 0;
        this.kickSoundCooldown = 100;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Update possessor timer
        if (this.possessor) {
            this.possessorTimer += deltaTime;
            if (this.possessorTimer > this.maxPossessorTime) {
                this.setPossessor(null);
            }
        }
        
        // Update trail
        this.updateTrail();
        
        // Apply field boundaries
        this.handleFieldBoundaries();
        
        // Check for goal
        this.checkGoal();
    }
    
    updateTrail() {
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        
        // Limit trail length
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }
    
    handleFieldBoundaries() {
        const canvas = window.gameEngine.canvas;
        const margin = this.radius;
        
        // Horizontal boundaries
        if (this.x - this.radius < margin) {
            this.x = margin + this.radius;
            this.velocityX = -this.velocityX * this.bounceFactor;
        } else if (this.x + this.radius > canvas.width - margin) {
            this.x = canvas.width - margin - this.radius;
            this.velocityX = -this.velocityX * this.bounceFactor;
        }
        
        // Vertical boundaries (with goal areas)
        if (this.y - this.radius < margin) {
            this.y = margin + this.radius;
            this.velocityY = -this.velocityY * this.bounceFactor;
        } else if (this.y + this.radius > canvas.height - margin) {
            this.y = canvas.height - margin - this.radius;
            this.velocityY = -this.velocityY * this.bounceFactor;
        }
    }
    
    checkGoal() {
        const gameScene = window.gameEngine.currentScene;
        if (!gameScene) return;
        
        const goalA = gameScene.getGoal('teamA');
        const goalB = gameScene.getGoal('teamB');
        
        // Check if ball is in goal A (Team B scores)
        if (goalA && this.isInGoal(goalA)) {
            this.handleGoal('teamB');
        }
        // Check if ball is in goal B (Team A scores)
        else if (goalB && this.isInGoal(goalB)) {
            this.handleGoal('teamA');
        }
    }
    
    isInGoal(goal) {
        const goalBounds = goal.getBounds();
        const ballBounds = this.getBounds();
        
        return ballBounds.left >= goalBounds.left &&
               ballBounds.right <= goalBounds.right &&
               ballBounds.top >= goalBounds.top &&
               ballBounds.bottom <= goalBounds.bottom;
    }
    
    handleGoal(scoringTeam) {
        // Update score
        window.gameEngine.updateScore(scoringTeam);
        
        // Reset ball position
        this.resetToCenter();
        
        // Reset all players
        const gameScene = window.gameEngine.currentScene;
        if (gameScene) {
            gameScene.resetPlayers();
        }
        
        // Play goal sound (placeholder)
        this.playGoalSound();
    }
    
    resetToCenter() {
        const canvas = window.gameEngine.canvas;
        this.setPosition(canvas.width / 2, canvas.height / 2);
        this.setVelocity(0, 0);
        this.setPossessor(null);
    }
    
    setPossessor(player) {
        this.possessor = player;
        this.possessorTimer = 0;
        
        if (player) {
            this.lastPossessor = player;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        // Draw trail
        if (this.trail.length > 1) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }
        
        // Draw ball
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw ball outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw possession indicator
        if (this.possessor) {
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.radius - 5, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Collision detection for circular ball
    getBounds() {
        return {
            left: this.x - this.radius,
            right: this.x + this.radius,
            top: this.y - this.radius,
            bottom: this.y + this.radius
        };
    }
    
    intersects(other) {
        if (other.tag === 'ball') {
            // Ball-ball collision (shouldn't happen in football)
            const distance = this.distanceTo(other);
            return distance < (this.radius + other.radius);
        } else {
            // Ball-entity collision
            const bounds = other.getBounds();
            const closestX = Math.max(bounds.left, Math.min(this.x, bounds.right));
            const closestY = Math.max(bounds.top, Math.min(this.y, bounds.bottom));
            
            const distanceX = this.x - closestX;
            const distanceY = this.y - closestY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            return distance < this.radius;
        }
    }
    
    // Sound effects (placeholder methods)
    playKickSound() {
        const now = Date.now();
        if (now - this.lastKickTime > this.kickSoundCooldown) {
            // Placeholder for kick sound
            console.log('Kick sound played');
            this.lastKickTime = now;
        }
    }
    
    playGoalSound() {
        // Placeholder for goal sound
        console.log('GOAL!');
    }
    
    // Utility methods
    getSpeed() {
        return Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
    }
    
    isMoving() {
        return this.getSpeed() > 5;
    }
} 