class Team {
    constructor(name, color, side) {
        this.name = name;
        this.color = color;
        this.side = side; // 'left' or 'right'
        this.players = [];
        this.score = 0;
        this.formation = '4-1'; // 4 field players + 1 goalkeeper
    }
    
    addPlayer(player) {
        this.players.push(player);
        player.team = this.name;
    }
    
    removePlayer(player) {
        const index = this.players.indexOf(player);
        if (index > -1) {
            this.players.splice(index, 1);
        }
    }
    
    getFieldPlayers() {
        return this.players.filter(player => player.position === 'field');
    }
    
    getGoalkeeper() {
        return this.players.find(player => player.position === 'goalkeeper');
    }
    
    getPlayerByPosition(position) {
        return this.players.find(player => player.position === position);
    }
    
    getNearestPlayerTo(x, y) {
        if (this.players.length === 0) return null;
        
        let nearest = this.players[0];
        let nearestDistance = Math.sqrt(
            Math.pow(nearest.x - x, 2) + Math.pow(nearest.y - y, 2)
        );
        
        for (let player of this.players) {
            const distance = Math.sqrt(
                Math.pow(player.x - x, 2) + Math.pow(player.y - y, 2)
            );
            if (distance < nearestDistance) {
                nearest = player;
                nearestDistance = distance;
            }
        }
        
        return nearest;
    }
    
    resetPositions() {
        const canvas = window.gameEngine.canvas;
        const fieldWidth = canvas.width;
        const fieldHeight = canvas.height;
        
        if (this.side === 'left') {
            // Team A positions (left side)
            const positions = [
                { x: fieldWidth * 0.2, y: fieldHeight * 0.2, position: 'field' },
                { x: fieldWidth * 0.2, y: fieldHeight * 0.4, position: 'field' },
                { x: fieldWidth * 0.2, y: fieldHeight * 0.6, position: 'field' },
                { x: fieldWidth * 0.2, y: fieldHeight * 0.8, position: 'field' },
                { x: fieldWidth * 0.1, y: fieldHeight * 0.5, position: 'goalkeeper' }
            ];
            
            this.players.forEach((player, index) => {
                if (index < positions.length) {
                    player.setPosition(positions[index].x, positions[index].y);
                    player.setVelocity(0, 0);
                }
            });
        } else {
            // Team B positions (right side)
            const positions = [
                { x: fieldWidth * 0.8, y: fieldHeight * 0.2, position: 'field' },
                { x: fieldWidth * 0.8, y: fieldHeight * 0.4, position: 'field' },
                { x: fieldWidth * 0.8, y: fieldHeight * 0.6, position: 'field' },
                { x: fieldWidth * 0.8, y: fieldHeight * 0.8, position: 'field' },
                { x: fieldWidth * 0.9, y: fieldHeight * 0.5, position: 'goalkeeper' }
            ];
            
            this.players.forEach((player, index) => {
                if (index < positions.length) {
                    player.setPosition(positions[index].x, positions[index].y);
                    player.setVelocity(0, 0);
                }
            });
        }
    }
    
    update(deltaTime) {
        this.players.forEach(player => {
            player.update(deltaTime);
        });
    }
    
    render(ctx) {
        this.players.forEach(player => {
            player.render(ctx);
        });
    }
    
    // Team tactics and AI coordination
    getTeamCenter() {
        if (this.players.length === 0) return { x: 0, y: 0 };
        
        let totalX = 0;
        let totalY = 0;
        
        this.players.forEach(player => {
            totalX += player.x;
            totalY += player.y;
        });
        
        return {
            x: totalX / this.players.length,
            y: totalY / this.players.length
        };
    }
    
    // Get players in formation positions
    getFormationPositions() {
        const canvas = window.gameEngine.canvas;
        const fieldWidth = canvas.width;
        const fieldHeight = canvas.height;
        
        if (this.side === 'left') {
            return [
                { x: fieldWidth * 0.2, y: fieldHeight * 0.2 },
                { x: fieldWidth * 0.2, y: fieldHeight * 0.4 },
                { x: fieldWidth * 0.2, y: fieldHeight * 0.6 },
                { x: fieldWidth * 0.2, y: fieldHeight * 0.8 },
                { x: fieldWidth * 0.1, y: fieldHeight * 0.5 }
            ];
        } else {
            return [
                { x: fieldWidth * 0.8, y: fieldHeight * 0.2 },
                { x: fieldWidth * 0.8, y: fieldHeight * 0.4 },
                { x: fieldWidth * 0.8, y: fieldHeight * 0.6 },
                { x: fieldWidth * 0.8, y: fieldHeight * 0.8 },
                { x: fieldWidth * 0.9, y: fieldHeight * 0.5 }
            ];
        }
    }
} 