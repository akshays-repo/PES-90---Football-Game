class GameScene {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.active = false;
        
        // Game entities
        this.field = null;
        this.ball = null;
        this.teams = {};
        this.goals = {};
        this.entities = [];
        
        // Systems
        this.physicsEngine = new PhysicsEngine();
        this.aiManager = new AIManager();
        this.inputManager = new InputManager();
        this.renderer = new Renderer(gameEngine.canvas);
        
        // Game state
        this.playerControlled = null;
        this.matchStarted = false;
        this.kickoffTimer = 0;
        this.kickoffDelay = 2000; // 2 seconds
        
        this.init();
    }
    
    init() {
        this.createField();
        this.createGoals();
        this.createTeams();
        this.createBall();
        this.setupPlayerControl();
    }
    
    createField() {
        const canvas = this.gameEngine.canvas;
        this.field = new Field(canvas.width, canvas.height);
        this.entities.push(this.field);
        this.physicsEngine.addEntity(this.field);
    }
    
    createGoals() {
        const canvas = this.gameEngine.canvas;
        const goalWidth = 60;
        const goalHeight = 80;
        
        // Team A goal (left side)
        this.goals.teamA = new Goal(goalWidth / 2, canvas.height / 2, goalWidth, goalHeight, 'teamA');
        this.entities.push(this.goals.teamA);
        this.physicsEngine.addEntity(this.goals.teamA);
        
        // Team B goal (right side)
        this.goals.teamB = new Goal(canvas.width - goalWidth / 2, canvas.height / 2, goalWidth, goalHeight, 'teamB');
        this.entities.push(this.goals.teamB);
        this.physicsEngine.addEntity(this.goals.teamB);
    }
    
    createTeams() {
        const canvas = this.gameEngine.canvas;
        
        // Create Team A (left side)
        this.teams.teamA = new Team('teamA', '#ff6b6b', 'left');
        this.createTeamPlayers('teamA', false); // false = not AI (player controlled)
        
        // Create Team B (right side)
        this.teams.teamB = new Team('teamB', '#4ecdc4', 'right');
        this.createTeamPlayers('teamB', true); // true = AI controlled
    }
    
    createTeamPlayers(teamName, isAI) {
        const canvas = this.gameEngine.canvas;
        const team = this.teams[teamName];
        
        // Create field players
        for (let i = 0; i < 4; i++) {
            let x, y;
            
            if (teamName === 'teamA') {
                x = canvas.width * 0.2;
                y = canvas.height * (0.2 + i * 0.2);
            } else {
                x = canvas.width * 0.8;
                y = canvas.height * (0.2 + i * 0.2);
            }
            
            const player = new Player(x, y, teamName, isAI, 'field');
            team.addPlayer(player);
            this.entities.push(player);
            this.physicsEngine.addEntity(player);
            
            if (isAI) {
                this.aiManager.addAIPlayer(player);
            }
        }
        
        // Create goalkeeper
        let gkX, gkY;
        if (teamName === 'teamA') {
            gkX = canvas.width * 0.1;
            gkY = canvas.height * 0.5;
        } else {
            gkX = canvas.width * 0.9;
            gkY = canvas.height * 0.5;
        }
        
        const goalkeeper = new Player(gkX, gkY, teamName, isAI, 'goalkeeper');
        team.addPlayer(goalkeeper);
        this.entities.push(goalkeeper);
        this.physicsEngine.addEntity(goalkeeper);
        
        if (isAI) {
            this.aiManager.addAIPlayer(goalkeeper);
        }
    }
    
    createBall() {
        const canvas = this.gameEngine.canvas;
        this.ball = new Ball(canvas.width / 2, canvas.height / 2);
        this.entities.push(this.ball);
        this.physicsEngine.addEntity(this.ball);
        
        // Set ball reference for all players
        this.getAllPlayers().forEach(player => {
            player.setBall(this.ball);
        });
    }
    
    setupPlayerControl() {
        // Set the first player of Team A as player controlled
        const teamAPlayers = this.teams.teamA.getFieldPlayers();
        if (teamAPlayers.length > 0) {
            this.playerControlled = teamAPlayers[0];
            this.playerControlled.isAI = false; // Override AI setting
        }
    }
    
    enter() {
        this.active = true;
        this.matchStarted = false;
        this.kickoffTimer = 0;
        
        // Reset positions
        this.resetPositions();
        
        // Hide menu overlays
        document.getElementById('game-menu').style.display = 'none';
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('game-over').style.display = 'none';
    }
    
    exit() {
        this.active = false;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // Handle kickoff delay
        if (!this.matchStarted) {
            this.kickoffTimer += deltaTime;
            if (this.kickoffTimer >= this.kickoffDelay) {
                this.matchStarted = true;
            }
        }
        
        // Update input
        this.inputManager.update();
        
        // Update player input
        if (this.playerControlled) {
            const inputState = this.inputManager.getInputState();
            this.playerControlled.setInput(
                inputState.x,
                inputState.y,
                inputState.shoot,
                inputState.pass,
                inputState.sprint
            );
        }
        
        // Update physics
        this.physicsEngine.update(deltaTime);
        
        // Update AI
        this.aiManager.update(deltaTime);
        
        // Update teams
        Object.values(this.teams).forEach(team => {
            team.update(deltaTime);
        });
        
        // Update goals
        Object.values(this.goals).forEach(goal => {
            goal.update(deltaTime);
        });
        
        // Update renderer
        this.renderer.followEntity(this.ball);
    }
    
    render(ctx) {
        if (!this.active) return;
        
        this.renderer.renderScene(this);
    }
    
    resetPositions() {
        // Reset ball to center
        const canvas = this.gameEngine.canvas;
        this.ball.setPosition(canvas.width / 2, canvas.height / 2);
        this.ball.setVelocity(0, 0);
        this.ball.setPossessor(null);
        
        // Reset team positions
        Object.values(this.teams).forEach(team => {
            team.resetPositions();
        });
    }
    
    resetPlayers() {
        // Reset all players to their formation positions
        Object.values(this.teams).forEach(team => {
            team.resetPositions();
        });
        
        // Reset ball to center
        const canvas = this.gameEngine.canvas;
        this.ball.setPosition(canvas.width / 2, canvas.height / 2);
        this.ball.setVelocity(0, 0);
        this.ball.setPossessor(null);
    }
    
    // Utility methods
    getAllPlayers() {
        const players = [];
        Object.values(this.teams).forEach(team => {
            players.push(...team.players);
        });
        return players;
    }
    
    getTeamPlayers(teamName) {
        return this.teams[teamName]?.players || [];
    }
    
    getGoal(teamName) {
        return this.goals[teamName];
    }
    
    getPlayerControlled() {
        return this.playerControlled;
    }
    
    // Game state methods
    isMatchStarted() {
        return this.matchStarted;
    }
    
    getKickoffProgress() {
        return Math.min(1, this.kickoffTimer / this.kickoffDelay);
    }
    
    // Cleanup
    cleanup() {
        this.physicsEngine.clear();
        this.aiManager.clear();
        this.entities = [];
        this.teams = {};
        this.goals = {};
        this.ball = null;
        this.field = null;
        this.playerControlled = null;
    }
} 