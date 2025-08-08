class Player extends Entity {
    constructor(x, y, team, isAI = false, position = 'field') {
        super(x, y, 20, 20);
        this.team = team; // 'teamA' or 'teamB'
        this.isAI = isAI;
        this.position = position; // 'field', 'goalkeeper'
        this.maxSpeed = isAI ? 80 : 100;
        this.friction = 0.9;
        this.tag = 'player';
        
        // Player stats
        this.speed = isAI ? 0.8 : 1.0;
        this.accuracy = isAI ? 0.7 : 0.9;
        this.stamina = 100;
        this.sprintMultiplier = 1.5;
        this.isSprinting = false;
        
        // Ball possession
        this.hasBall = false;
        this.ball = null;
        this.kickCooldown = 0;
        this.kickRange = 25;
        
        // AI behavior
        this.aiState = 'idle';
        this.aiTarget = null;
        this.aiDecisionTimer = 0;
        this.aiDecisionInterval = 200; // ms
        
        // Visual properties
        this.color = team === 'teamA' ? '#ff6b6b' : '#4ecdc4';
        this.direction = 0; // angle in radians
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        
        // Input state
        this.inputX = 0;
        this.inputY = 0;
        this.inputShoot = false;
        this.inputPass = false;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Update kick cooldown
        if (this.kickCooldown > 0) {
            this.kickCooldown -= deltaTime * 1000; // cooldown is in ms
        }
        
        // Update AI
        if (this.isAI) {
            this.updateAI(deltaTime * 1000); // AI timers in ms
        }
        
        // Handle movement
        this.handleMovement(deltaTime);
        
        // Handle ball interaction
        this.handleBallInteraction();
        
        // Update animation
        this.updateAnimation(deltaTime);
        
        // Update stamina
        this.updateStamina(deltaTime * 1000); // stamina tuned per ms
    }
    
    handleMovement(deltaTime) {
        let moveX = 0;
        let moveY = 0;
        
        if (this.isAI) {
            // AI movement based on current state
            if (this.aiTarget) {
                const angle = this.angleTo(this.aiTarget);
                moveX = Math.cos(angle);
                moveY = Math.sin(angle);
            }
        } else {
            // Player input
            moveX = this.inputX;
            moveY = this.inputY;
        }
        
        // Normalize movement vector
        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        if (length > 0) {
            moveX /= length;
            moveY /= length;
            
            // Apply sprint multiplier
            const speedMultiplier = this.isSprinting ? this.sprintMultiplier : 1.0;
            const currentSpeed = this.maxSpeed * this.speed * speedMultiplier; // pixels/sec
            
            // Scale acceleration for seconds-based dt (was tuned for ms)
            const accelerationScale = 100; // compensates ms->sec change
            this.accelerationX = moveX * currentSpeed * accelerationScale;
            this.accelerationY = moveY * currentSpeed * accelerationScale;
            
            // Update direction
            this.direction = Math.atan2(moveY, moveX);
        } else {
            this.accelerationX = 0;
            this.accelerationY = 0;
        }
    }
    
    handleBallInteraction() {
        if (!this.ball) return;
        
        // Check if player has ball
        const distance = this.distanceTo(this.ball);
        if (distance <= this.kickRange) {
            if (!this.hasBall) {
                this.hasBall = true;
                this.ball.setPossessor(this);
            }
            
            // Handle shooting/passing
            if (this.kickCooldown <= 0) {
                if (this.isAI) {
                    this.handleAIKick();
                } else if (this.inputShoot || this.inputPass) {
                    this.kickBall(this.inputShoot ? 'shoot' : 'pass');
                }
            }
        } else {
            this.hasBall = false;
        }
    }
    
    kickBall(type) {
        if (!this.ball || this.kickCooldown > 0) return;
        
        const kickPower = type === 'shoot' ? 300 : 200; // pixels/sec
        const kickAngle = this.direction;
        
        // Add some randomness for realism
        const accuracy = this.accuracy;
        const randomAngle = (Math.random() - 0.5) * (1 - accuracy) * 0.5;
        const finalAngle = kickAngle + randomAngle;
        
        // Calculate kick velocity
        const kickX = Math.cos(finalAngle) * kickPower;
        const kickY = Math.sin(finalAngle) * kickPower;
        
        this.ball.setVelocity(kickX, kickY);
        this.ball.setPossessor(null);
        this.hasBall = false;
        this.kickCooldown = 500; // ms
        
        // Reset input
        this.inputShoot = false;
        this.inputPass = false;
    }
    
    updateAI(deltaTime) {
        this.aiDecisionTimer += deltaTime;
        
        if (this.aiDecisionTimer >= this.aiDecisionInterval) {
            this.makeAIDecision();
            this.aiDecisionTimer = 0;
        }
    }
    
    makeAIDecision() {
        const gameScene = window.gameEngine.currentScene;
        if (!gameScene) return;
        
        const ball = gameScene.ball;
        const teammates = gameScene.getTeamPlayers(this.team);
        const opponents = gameScene.getTeamPlayers(this.team === 'teamA' ? 'teamB' : 'teamA');
        
        // Simple AI decision making
        if (this.position === 'goalkeeper') {
            // Goalkeeper behavior
            const goal = gameScene.getGoal(this.team);
            this.aiTarget = goal;
        } else {
            // Field player behavior
            if (this.hasBall) {
                // Has ball - try to score or pass
                const opponentGoal = gameScene.getGoal(this.team === 'teamA' ? 'teamB' : 'teamA');
                const distanceToGoal = this.distanceTo(opponentGoal);
                
                if (distanceToGoal < 150) {
                    // Close to goal - shoot
                    this.kickBall('shoot');
                } else {
                    // Far from goal - pass to nearest teammate
                    const nearestTeammate = this.findNearest(teammates.filter(p => p !== this));
                    if (nearestTeammate) {
                        this.aiTarget = nearestTeammate;
                        this.kickBall('pass');
                    }
                }
            } else {
                // Doesn't have ball - chase it
                this.aiTarget = ball;
            }
        }
    }
    
    handleAIKick() {
        if (!this.hasBall || this.kickCooldown > 0) return;
        
        const gameScene = window.gameEngine.currentScene;
        if (!gameScene) return;
        
        const opponentGoal = gameScene.getGoal(this.team === 'teamA' ? 'teamB' : 'teamA');
        const distanceToGoal = this.distanceTo(opponentGoal);
        
        if (distanceToGoal < 150) {
            this.kickBall('shoot');
        } else {
            const teammates = gameScene.getTeamPlayers(this.team);
            const nearestTeammate = this.findNearest(teammates.filter(p => p !== this));
            if (nearestTeammate) {
                this.aiTarget = nearestTeammate;
                this.kickBall('pass');
            }
        }
    }
    
    findNearest(entities) {
        if (!entities || entities.length === 0) return null;
        
        let nearest = entities[0];
        let nearestDistance = this.distanceTo(nearest);
        
        for (let entity of entities) {
            const distance = this.distanceTo(entity);
            if (distance < nearestDistance) {
                nearest = entity;
                nearestDistance = distance;
            }
        }
        
        return nearest;
    }
    
    updateAnimation(deltaTime) {
        const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        if (speed > 10) {
            this.animationFrame += this.animationSpeed * (deltaTime * 1000);
        }
    }
    
    updateStamina(deltaTime) {
        if (this.isSprinting) {
            this.stamina = Math.max(0, this.stamina - deltaTime * 0.1);
            if (this.stamina <= 0) {
                this.isSprinting = false;
            }
        } else {
            this.stamina = Math.min(100, this.stamina + deltaTime * 0.05);
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        // Save context
        ctx.save();
        
        // Translate to player position
        ctx.translate(this.x, this.y);
        ctx.rotate(this.direction);
        
        // Draw player body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        // Add stroke for visibility
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Draw direction indicator
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, -2, this.width / 2, 4);
        
        // Draw ball indicator if has ball
        if (this.hasBall) {
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(this.width / 2 + 5, 0, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw team indicator
        ctx.fillStyle = this.team === 'teamA' ? '#ff0000' : '#0000ff';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, 3);
        
        // Restore context
        ctx.restore();
        
        // Draw name tag for debugging
        if (window.gameEngine.gameState === 'playing') {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.position, this.x, this.y - this.height / 2 - 10);
        }
    }
    
    // Input methods for player control
    setInput(x, y, shoot, pass, sprint) {
        this.inputX = x;
        this.inputY = y;
        this.inputShoot = shoot;
        this.inputPass = pass;
        this.isSprinting = sprint && this.stamina > 0;
    }
    
    // Set ball reference
    setBall(ball) {
        this.ball = ball;
    }
}

// Node export for tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
} 