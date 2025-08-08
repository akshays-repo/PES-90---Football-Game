class PhysicsEngine {
    constructor() {
        this.entities = [];
        this.collisionPairs = [];
        this.gravity = 0;
        this.airResistance = 0.99;
    }
    
    addEntity(entity) {
        this.entities.push(entity);
    }
    
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }
    
    update(deltaTime) {
        // Update all entities
        this.entities.forEach(entity => {
            if (entity.active) {
                entity.update(deltaTime);
            }
        });
        
        // Handle collisions
        this.handleCollisions();
        
        // Apply physics constraints
        this.applyConstraints();
    }
    
    handleCollisions() {
        // Clear collision pairs
        this.collisionPairs = [];
        
        // Check all entity pairs for collisions
        for (let i = 0; i < this.entities.length; i++) {
            for (let j = i + 1; j < this.entities.length; j++) {
                const entityA = this.entities[i];
                const entityB = this.entities[j];
                
                if (entityA.active && entityB.active && entityA.intersects(entityB)) {
                    this.collisionPairs.push({ entityA, entityB });
                    this.resolveCollision(entityA, entityB);
                }
            }
        }
    }
    
    resolveCollision(entityA, entityB) {
        // Handle different collision types
        if (entityA.tag === 'player' && entityB.tag === 'ball') {
            this.handlePlayerBallCollision(entityA, entityB);
        } else if (entityA.tag === 'ball' && entityB.tag === 'player') {
            this.handlePlayerBallCollision(entityB, entityA);
        } else if (entityA.tag === 'player' && entityB.tag === 'player') {
            this.handlePlayerPlayerCollision(entityA, entityB);
        } else if (entityA.tag === 'ball' && entityB.tag === 'goal') {
            this.handleBallGoalCollision(entityA, entityB);
        } else if (entityA.tag === 'goal' && entityB.tag === 'ball') {
            this.handleBallGoalCollision(entityB, entityA);
        }
    }
    
    handlePlayerBallCollision(player, ball) {
        // Player gains possession if close enough
        const distance = player.distanceTo(ball);
        if (distance <= player.kickRange) {
            if (!player.hasBall) {
                player.hasBall = true;
                ball.setPossessor(player);
            }
        }
        
        // Apply some bounce effect
        const angle = player.angleTo(ball);
        const pushForce = 50;
        ball.addVelocity(
            Math.cos(angle) * pushForce,
            Math.sin(angle) * pushForce
        );
    }
    
    handlePlayerPlayerCollision(playerA, playerB) {
        // Simple collision response - push players apart
        const angle = playerA.angleTo(playerB);
        const pushDistance = 25; // Minimum distance between players
        
        const currentDistance = playerA.distanceTo(playerB);
        if (currentDistance < pushDistance) {
            const pushForce = (pushDistance - currentDistance) * 0.5;
            
            // Push playerA away from playerB
            playerA.addVelocity(
                -Math.cos(angle) * pushForce,
                -Math.sin(angle) * pushForce
            );
            
            // Push playerB away from playerA
            playerB.addVelocity(
                Math.cos(angle) * pushForce,
                Math.sin(angle) * pushForce
            );
        }
    }
    
    handleBallGoalCollision(ball, goal) {
        // Goal detection is handled in the Ball class
        // This is just for collision response
        if (goal.isBallInGoal(ball)) {
            goal.triggerGlow();
        }
    }
    
    applyConstraints() {
        this.entities.forEach(entity => {
            if (!entity.active) return;
            
            // Keep entities within field bounds
            this.keepInBounds(entity);
            
            // Apply air resistance to ball
            if (entity.tag === 'ball') {
                entity.velocityX *= this.airResistance;
                entity.velocityY *= this.airResistance;
            }
        });
    }
    
    keepInBounds(entity) {
        const canvas = window.gameEngine.canvas;
        const margin = entity.width / 2;
        
        // Horizontal bounds
        if (entity.x - margin < 0) {
            entity.x = margin;
            entity.velocityX = Math.abs(entity.velocityX) * 0.5; // Bounce
        } else if (entity.x + margin > canvas.width) {
            entity.x = canvas.width - margin;
            entity.velocityX = -Math.abs(entity.velocityX) * 0.5; // Bounce
        }
        
        // Vertical bounds
        if (entity.y - margin < 0) {
            entity.y = margin;
            entity.velocityY = Math.abs(entity.velocityY) * 0.5; // Bounce
        } else if (entity.y + margin > canvas.height) {
            entity.y = canvas.height - margin;
            entity.velocityY = -Math.abs(entity.velocityY) * 0.5; // Bounce
        }
    }
    
    // Utility methods for physics calculations
    calculateDistance(entityA, entityB) {
        const dx = entityA.x - entityB.x;
        const dy = entityA.y - entityB.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    calculateAngle(entityA, entityB) {
        return Math.atan2(entityB.y - entityA.y, entityB.x - entityA.x);
    }
    
    normalizeVector(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    }
    
    // Get entities by type
    getEntitiesByTag(tag) {
        return this.entities.filter(entity => entity.tag === tag);
    }
    
    getPlayers() {
        return this.getEntitiesByTag('player');
    }
    
    getBall() {
        const balls = this.getEntitiesByTag('ball');
        return balls.length > 0 ? balls[0] : null;
    }
    
    getGoals() {
        return this.getEntitiesByTag('goal');
    }
    
    // Clear all entities
    clear() {
        this.entities = [];
        this.collisionPairs = [];
    }
} 