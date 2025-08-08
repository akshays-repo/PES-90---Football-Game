class AIManager {
    constructor() {
        this.aiPlayers = [];
        this.decisionTimer = 0;
        this.decisionInterval = 200; // ms
        this.behaviorStates = {
            IDLE: 'idle',
            CHASE_BALL: 'chaseBall',
            SUPPORT: 'support',
            DEFEND: 'defend',
            GOALKEEPER: 'goalkeeper'
        };
    }
    
    addAIPlayer(player) {
        if (player.isAI) {
            this.aiPlayers.push(player);
        }
    }
    
    removeAIPlayer(player) {
        const index = this.aiPlayers.indexOf(player);
        if (index > -1) {
            this.aiPlayers.splice(index, 1);
        }
    }
    
    update(deltaTime) {
        this.decisionTimer += deltaTime;
        
        if (this.decisionTimer >= this.decisionInterval) {
            this.updateAIDecisions();
            this.decisionTimer = 0;
        }
    }
    
    updateAIDecisions() {
        this.aiPlayers.forEach(player => {
            this.makeDecision(player);
        });
    }
    
    makeDecision(player) {
        const gameScene = window.gameEngine.currentScene;
        if (!gameScene) return;
        
        const ball = gameScene.ball;
        const teammates = gameScene.getTeamPlayers(player.team);
        const opponents = gameScene.getTeamPlayers(player.team === 'teamA' ? 'teamB' : 'teamA');
        
        // Different behavior based on position
        if (player.position === 'goalkeeper') {
            this.handleGoalkeeperBehavior(player, ball, gameScene);
        } else {
            this.handleFieldPlayerBehavior(player, ball, teammates, opponents, gameScene);
        }
    }
    
    handleGoalkeeperBehavior(player, ball, gameScene) {
        const goal = gameScene.getGoal(player.team);
        if (!goal) return;
        
        // Goalkeeper stays near goal and moves to intercept ball
        const goalCenter = goal.getGoalCenter();
        const ballDistance = player.distanceTo(ball);
        
        if (ballDistance < 200) {
            // Ball is close - move to intercept
            player.aiTarget = ball;
        } else {
            // Return to goal position
            player.aiTarget = goal;
        }
        
        // Keep goalkeeper within goal area
        const goalBounds = goal.getBounds();
        const targetX = Math.max(goalBounds.left + 20, Math.min(goalBounds.right - 20, player.x));
        const targetY = Math.max(goalBounds.top + 20, Math.min(goalBounds.bottom - 20, player.y));
        
        player.setPosition(targetX, targetY);
    }
    
    handleFieldPlayerBehavior(player, ball, teammates, opponents, gameScene) {
        const hasBall = player.hasBall;
        const ballDistance = player.distanceTo(ball);
        const nearestOpponent = this.findNearest(player, opponents);
        const nearestTeammate = this.findNearest(player, teammates.filter(p => p !== player));
        
        if (hasBall) {
            // Has ball - decide to shoot or pass
            this.handlePossessionBehavior(player, ball, teammates, gameScene);
        } else {
            // Doesn't have ball - decide to chase or support
            this.handleNonPossessionBehavior(player, ball, teammates, opponents, gameScene);
        }
    }
    
    handlePossessionBehavior(player, ball, teammates, gameScene) {
        const opponentGoal = gameScene.getGoal(player.team === 'teamA' ? 'teamB' : 'teamA');
        const distanceToGoal = player.distanceTo(opponentGoal);
        
        if (distanceToGoal < 150) {
            // Close to goal - shoot
            player.aiState = 'shooting';
            player.aiTarget = opponentGoal;
        } else {
            // Far from goal - look for pass opportunity
            const nearestTeammate = this.findNearest(player, teammates.filter(p => p !== player));
            if (nearestTeammate && player.distanceTo(nearestTeammate) < 100) {
                player.aiState = 'passing';
                player.aiTarget = nearestTeammate;
            } else {
                // No good pass - dribble towards goal
                player.aiState = 'dribbling';
                player.aiTarget = opponentGoal;
            }
        }
    }
    
    handleNonPossessionBehavior(player, ball, teammates, opponents, gameScene) {
        const ballDistance = player.distanceTo(ball);
        const nearestTeammate = this.findNearest(player, teammates.filter(p => p !== player));
        const nearestOpponent = this.findNearest(player, opponents);
        
        // Check if this player should chase the ball
        const shouldChase = this.shouldChaseBall(player, ball, teammates);
        
        if (shouldChase) {
            // Chase the ball
            player.aiState = 'chasing';
            player.aiTarget = ball;
        } else {
            // Support behavior - find good position
            player.aiState = 'supporting';
            player.aiTarget = this.findSupportPosition(player, ball, teammates, gameScene);
        }
    }
    
    shouldChaseBall(player, ball, teammates) {
        // Find the nearest teammate to the ball
        let nearestTeammate = null;
        let nearestDistance = Infinity;
        
        teammates.forEach(teammate => {
            const distance = teammate.distanceTo(ball);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestTeammate = teammate;
            }
        });
        
        // If this player is the nearest, chase the ball
        return nearestTeammate === player;
    }
    
    findSupportPosition(player, ball, teammates, gameScene) {
        const canvas = window.gameEngine.canvas;
        const fieldCenter = { x: canvas.width / 2, y: canvas.height / 2 };
        
        // Find a position that's not too close to teammates but close to ball
        const ballDistance = player.distanceTo(ball);
        const idealDistance = 100; // Ideal distance from ball for support
        
        // Calculate support position
        const angle = player.angleTo(ball);
        const supportX = ball.x + Math.cos(angle) * idealDistance;
        const supportY = ball.y + Math.sin(angle) * idealDistance;
        
        // Keep within field bounds
        const margin = 50;
        const finalX = Math.max(margin, Math.min(canvas.width - margin, supportX));
        const finalY = Math.max(margin, Math.min(canvas.height - margin, supportY));
        
        return { x: finalX, y: finalY };
    }
    
    findNearest(player, entities) {
        if (!entities || entities.length === 0) return null;
        
        let nearest = entities[0];
        let nearestDistance = player.distanceTo(nearest);
        
        for (let entity of entities) {
            const distance = player.distanceTo(entity);
            if (distance < nearestDistance) {
                nearest = entity;
                nearestDistance = distance;
            }
        }
        
        return nearest;
    }
    
    // Team coordination methods
    coordinateTeam(team) {
        const players = team.getFieldPlayers();
        const ball = window.gameEngine.currentScene?.ball;
        
        if (!ball) return;
        
        // Assign roles based on positions
        players.forEach((player, index) => {
            const ballDistance = player.distanceTo(ball);
            
            if (index === 0) {
                // First player - primary ball chaser
                player.aiState = 'chasing';
                player.aiTarget = ball;
            } else if (index === 1) {
                // Second player - support
                player.aiState = 'supporting';
                player.aiTarget = this.findSupportPosition(player, ball, players, window.gameEngine.currentScene);
            } else {
                // Other players - defensive positions
                player.aiState = 'defending';
                player.aiTarget = this.findDefensivePosition(player, ball, team);
            }
        });
    }
    
    findDefensivePosition(player, ball, team) {
        const canvas = window.gameEngine.canvas;
        const ownGoal = window.gameEngine.currentScene?.getGoal(team.name);
        
        if (!ownGoal) return { x: canvas.width / 2, y: canvas.height / 2 };
        
        // Position between ball and own goal
        const goalCenter = ownGoal.getGoalCenter();
        const midX = (ball.x + goalCenter.x) / 2;
        const midY = (ball.y + goalCenter.y) / 2;
        
        return { x: midX, y: midY };
    }
    
    // Utility methods
    getAIPlayers() {
        return this.aiPlayers;
    }
    
    clear() {
        this.aiPlayers = [];
    }
} 