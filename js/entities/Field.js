class Field extends Entity {
    constructor(width, height) {
        super(width / 2, height / 2, width, height);
        this.fieldWidth = width;
        this.fieldHeight = height;
        this.tag = 'field';
        this.active = true;
        
        // Field colors
        this.grassColor = '#2d5a27';
        this.lineColor = '#ffffff';
        this.centerCircleColor = '#ffffff';
        this.penaltyAreaColor = 'rgba(255, 255, 255, 0.1)';
        
        // Field markings
        this.lineWidth = 2;
        this.centerCircleRadius = 50;
        this.penaltyAreaWidth = 150;
        this.penaltyAreaHeight = 100;
        this.goalAreaWidth = 50;
        this.goalAreaHeight = 60;
        
        // Field patterns
        this.grassPattern = [];
        this.generateGrassPattern();
    }
    
    generateGrassPattern() {
        // Generate random grass pattern for visual appeal
        for (let i = 0; i < 100; i++) {
            this.grassPattern.push({
                x: Math.random() * this.fieldWidth,
                y: Math.random() * this.fieldHeight,
                size: Math.random() * 3 + 1,
                color: `rgba(255, 255, 255, ${Math.random() * 0.1})`
            });
        }
    }
    
    update(deltaTime) {
        // Field doesn't need updates, but keeping for consistency
    }
    
    render(ctx) {
        if (!this.active) return;
        
        // Draw grass background
        this.drawGrass(ctx);
        
        // Draw field markings
        this.drawFieldMarkings(ctx);
        
        // Draw grass pattern
        this.drawGrassPattern(ctx);
    }
    
    drawGrass(ctx) {
        // Main field background
        ctx.fillStyle = this.grassColor;
        ctx.fillRect(0, 0, this.fieldWidth, this.fieldHeight);
        
        // Add some grass texture
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let x = 0; x < this.fieldWidth; x += 20) {
            for (let y = 0; y < this.fieldHeight; y += 20) {
                if (Math.random() > 0.7) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
    
    drawFieldMarkings(ctx) {
        ctx.strokeStyle = this.lineColor;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        
        // Center line
        ctx.beginPath();
        ctx.moveTo(this.fieldWidth / 2, 0);
        ctx.lineTo(this.fieldWidth / 2, this.fieldHeight);
        ctx.stroke();
        
        // Center circle
        ctx.beginPath();
        ctx.arc(this.fieldWidth / 2, this.fieldHeight / 2, this.centerCircleRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Center spot
        ctx.fillStyle = this.lineColor;
        ctx.beginPath();
        ctx.arc(this.fieldWidth / 2, this.fieldHeight / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Penalty areas
        this.drawPenaltyAreas(ctx);
        
        // Goal areas
        this.drawGoalAreas(ctx);
        
        // Corner arcs
        this.drawCornerArcs(ctx);
    }
    
    drawPenaltyAreas(ctx) {
        // Left penalty area
        ctx.strokeRect(0, this.fieldHeight / 2 - this.penaltyAreaHeight / 2, 
                      this.penaltyAreaWidth, this.penaltyAreaHeight);
        
        // Right penalty area
        ctx.strokeRect(this.fieldWidth - this.penaltyAreaWidth, 
                      this.fieldHeight / 2 - this.penaltyAreaHeight / 2, 
                      this.penaltyAreaWidth, this.penaltyAreaHeight);
        
        // Penalty spots
        ctx.fillStyle = this.lineColor;
        ctx.beginPath();
        ctx.arc(this.penaltyAreaWidth - 20, this.fieldHeight / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.fieldWidth - this.penaltyAreaWidth + 20, this.fieldHeight / 2, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawGoalAreas(ctx) {
        // Left goal area
        ctx.strokeRect(0, this.fieldHeight / 2 - this.goalAreaHeight / 2, 
                      this.goalAreaWidth, this.goalAreaHeight);
        
        // Right goal area
        ctx.strokeRect(this.fieldWidth - this.goalAreaWidth, 
                      this.fieldHeight / 2 - this.goalAreaHeight / 2, 
                      this.goalAreaWidth, this.goalAreaHeight);
    }
    
    drawCornerArcs(ctx) {
        const cornerRadius = 20;
        
        // Top-left corner
        ctx.beginPath();
        ctx.arc(cornerRadius, cornerRadius, cornerRadius, 0, Math.PI / 2);
        ctx.stroke();
        
        // Top-right corner
        ctx.beginPath();
        ctx.arc(this.fieldWidth - cornerRadius, cornerRadius, cornerRadius, Math.PI / 2, Math.PI);
        ctx.stroke();
        
        // Bottom-left corner
        ctx.beginPath();
        ctx.arc(cornerRadius, this.fieldHeight - cornerRadius, cornerRadius, -Math.PI / 2, 0);
        ctx.stroke();
        
        // Bottom-right corner
        ctx.beginPath();
        ctx.arc(this.fieldWidth - cornerRadius, this.fieldHeight - cornerRadius, cornerRadius, Math.PI, -Math.PI / 2);
        ctx.stroke();
    }
    
    drawGrassPattern(ctx) {
        // Draw grass pattern for visual appeal
        this.grassPattern.forEach(grass => {
            ctx.fillStyle = grass.color;
            ctx.fillRect(grass.x, grass.y, grass.size, grass.size);
        });
    }
    
    // Field utility methods
    isInBounds(x, y) {
        return x >= 0 && x <= this.fieldWidth && y >= 0 && y <= this.fieldHeight;
    }
    
    getFieldCenter() {
        return {
            x: this.fieldWidth / 2,
            y: this.fieldHeight / 2
        };
    }
    
    getPenaltyAreaBounds(team) {
        if (team === 'teamA') {
            return {
                left: 0,
                right: this.penaltyAreaWidth,
                top: this.fieldHeight / 2 - this.penaltyAreaHeight / 2,
                bottom: this.fieldHeight / 2 + this.penaltyAreaHeight / 2
            };
        } else {
            return {
                left: this.fieldWidth - this.penaltyAreaWidth,
                right: this.fieldWidth,
                top: this.fieldHeight / 2 - this.penaltyAreaHeight / 2,
                bottom: this.fieldHeight / 2 + this.penaltyAreaHeight / 2
            };
        }
    }
    
    getGoalAreaBounds(team) {
        if (team === 'teamA') {
            return {
                left: 0,
                right: this.goalAreaWidth,
                top: this.fieldHeight / 2 - this.goalAreaHeight / 2,
                bottom: this.fieldHeight / 2 + this.goalAreaHeight / 2
            };
        } else {
            return {
                left: this.fieldWidth - this.goalAreaWidth,
                right: this.fieldWidth,
                top: this.fieldHeight / 2 - this.goalAreaHeight / 2,
                bottom: this.fieldHeight / 2 + this.goalAreaHeight / 2
            };
        }
    }
}

// Node export for tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Field;
}
