class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.particles = [];
        this.effects = [];
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    renderScene(scene) {
        this.clear();
        
        // Apply camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        
        // Render field first
        if (scene.field) {
            scene.field.render(this.ctx);
        }
        
        // Render goals (supports array or object map)
        if (scene.goals) {
            const goalsArray = Array.isArray(scene.goals) ? scene.goals : Object.values(scene.goals);
            goalsArray.forEach(goal => goal && goal.render && goal.render(this.ctx));
        }
        
        // Render entities in order (background to foreground)
        this.renderEntities(scene.entities);
        
        // Render particles
        this.renderParticles();
        
        // Render effects
        this.renderEffects();
        
        this.ctx.restore();
        
        // Render UI elements (not affected by camera)
        this.renderUI(scene);
    }
    
    renderEntities(entities) {
        if (!entities) return;
        
        // Sort entities by render order
        const sortedEntities = entities.sort((a, b) => {
            const orderA = this.getRenderOrder(a);
            const orderB = this.getRenderOrder(b);
            return orderA - orderB;
        });
        
        sortedEntities.forEach(entity => {
            if (entity.active) {
                entity.render(this.ctx);
            }
        });
    }
    
    getRenderOrder(entity) {
        // Define render order: field -> goals -> ball -> players
        switch (entity.tag) {
            case 'field': return 0;
            case 'goal': return 1;
            case 'ball': return 2;
            case 'player': return 3;
            default: return 4;
        }
    }
    
    renderParticles() {
        this.particles.forEach((particle, index) => {
            particle.update();
            particle.render(this.ctx);
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    renderEffects() {
        this.effects.forEach((effect, index) => {
            effect.update();
            effect.render(this.ctx);
            
            if (effect.finished) {
                this.effects.splice(index, 1);
            }
        });
    }
    
    renderUI(scene) {
        // Render score overlay
        this.renderScore();
        
        // Render match timer
        this.renderTimer();
        
        // Render possession indicator
        this.renderPossessionIndicator();
        
        // Render player stats (if needed)
        this.renderPlayerStats();
        
        // Render speed meter (configurable)
        this.renderSpeedMeter(scene);
    }
    
    renderScore() {
        const scores = window.gameEngine.scores;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 60);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Team A: ${scores.teamA}`, 20, 35);
        this.ctx.fillText(`Team B: ${scores.teamB}`, 20, 60);
    }
    
    renderTimer() {
        const matchTime = window.gameEngine.matchTime;
        const timeString = Math.ceil(matchTime).toString();
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.canvas.width / 2 - 50, 10, 100, 40);
        
        this.ctx.fillStyle = matchTime < 10 ? '#ff6b6b' : '#ffffff';
        this.ctx.font = '28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(timeString, this.canvas.width / 2, 35);
    }
    
    renderPossessionIndicator() {
        const gameScene = window.gameEngine.currentScene;
        if (!gameScene || !gameScene.ball) return;
        
        const ball = gameScene.ball;
        if (!ball.possessor) return;
        
        const possessor = ball.possessor;
        const teamColor = possessor.team === 'teamA' ? '#ff6b6b' : '#4ecdc4';
        
        this.ctx.fillStyle = teamColor;
        this.ctx.fillRect(this.canvas.width - 120, 10, 110, 30);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${possessor.team} has ball`, this.canvas.width - 65, 30);
    }
    
    renderPlayerStats() {
        const gameScene = window.gameEngine.currentScene;
        if (!gameScene) return;
        
        const player = gameScene.getPlayerControlled();
        if (!player) return;
        
        // Render player stamina bar
        const barWidth = 100;
        const barHeight = 10;
        const barX = 10;
        const barY = this.canvas.height - 30;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const staminaPercent = player.stamina / 100;
        this.ctx.fillStyle = staminaPercent > 0.5 ? '#4CAF50' : staminaPercent > 0.2 ? '#FF9800' : '#f44336';
        this.ctx.fillRect(barX, barY, barWidth * staminaPercent, barHeight);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Stamina', barX, barY - 5);
    }
    
    // Speed meter HUD
    renderSpeedMeter(scene) {
        const cfg = (window.getSetting && window.getSetting('ui.speedMeter')) || null;
        if (!cfg || !cfg.enabled) return;
        
        // Determine source entity
        let entity = null;
        if (cfg.source === 'ball') {
            entity = scene.ball;
        } else {
            entity = scene.getPlayerControlled();
        }
        if (!entity) return;
        
        // Compute instantaneous speed in pixels/sec
        const vx = entity.velocityX || 0;
        const vy = entity.velocityY || 0;
        const speedPxPerSec = Math.sqrt(vx * vx + vy * vy);
        
        // Convert to configured unit
        const unit = (window.getSetting && window.getSetting('units.speed', 'mph')) || 'mph';
        const ppm = (window.getSetting && window.getSetting('units.pixelsPerMeter', 8)) || 8;
        // pixels/sec -> meters/sec
        const speedMps = speedPxPerSec / ppm;
        let speedValue = speedMps;
        let unitLabel = 'm/s';
        if (unit === 'kmh' || unit === 'km/h') {
            speedValue = speedMps * 3.6;
            unitLabel = 'km/h';
        } else if (unit === 'mph') {
            speedValue = speedMps * 2.23693629;
            unitLabel = 'mph';
        }
        
        // Optional smoothing
        if (this._speedMeterSmoothed == null) this._speedMeterSmoothed = 0;
        const smoothing = typeof cfg.smoothing === 'number' ? cfg.smoothing : 0.25;
        this._speedMeterSmoothed = this._speedMeterSmoothed * smoothing + speedValue * (1 - smoothing);
        const displayValue = this._speedMeterSmoothed;
        
        // Layout
        const width = (cfg.size && cfg.size.width) || 160;
        const height = (cfg.size && cfg.size.height) || 50;
        let x = (cfg.position && cfg.position.x) || null;
        let y = (cfg.position && cfg.position.y) || null;
        const margin = (cfg.position && cfg.position.margin) || 12;
        const anchor = (cfg.position && cfg.position.anchor) || 'bottom-right';
        
        if (x == null || y == null) {
            switch (anchor) {
                case 'top-left':
                    x = margin; y = margin; break;
                case 'top-right':
                    x = this.canvas.width - width - margin; y = margin; break;
                case 'bottom-left':
                    x = margin; y = this.canvas.height - height - margin; break;
                case 'bottom-right':
                default:
                    x = this.canvas.width - width - margin; y = this.canvas.height - height - margin; break;
            }
        }
        
        // Draw panel
        const bg = (cfg.colors && cfg.colors.background) || 'rgba(0,0,0,0.65)';
        const textColor = (cfg.colors && cfg.colors.text) || '#ffffff';
        const accent = (cfg.colors && cfg.colors.accent) || '#ffd700';
        this.drawRect(x, y, width, height, { fillColor: bg, strokeColor: 'rgba(255,255,255,0.2)', lineWidth: 1 });
        
        // Label
        this.drawText('Speed', x + 10, y + 8, { font: '12px Arial', color: textColor, align: 'left', baseline: 'top' });
        
        // Value
        const valueStr = `${Math.round(displayValue).toString()} ${unitLabel}`;
        this.drawText(valueStr, x + width - 10, y + height / 2 + 6, { font: '20px Arial', color: accent, align: 'right', baseline: 'middle' });
    }
    
    // Camera methods
    setCamera(x, y, zoom = 1) {
        this.camera.x = x;
        this.camera.y = y;
        this.camera.zoom = zoom;
    }
    
    followEntity(entity) {
        if (!entity) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.camera.x = entity.x - centerX;
        this.camera.y = entity.y - centerY;
    }
    
    followEntityClamped(entity, worldWidth, worldHeight) {
        if (!entity) return;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        let targetX = entity.x - centerX;
        let targetY = entity.y - centerY;
        const maxX = Math.max(0, worldWidth - this.canvas.width);
        const maxY = Math.max(0, worldHeight - this.canvas.height);
        this.camera.x = Math.min(Math.max(0, targetX), maxX);
        this.camera.y = Math.min(Math.max(0, targetY), maxY);
    }
    
    // Particle system
    addParticle(particle) {
        this.particles.push(particle);
    }
    
    createGoalEffect(x, y) {
        // Create goal celebration particles
        for (let i = 0; i < 20; i++) {
            const particle = {
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 60,
                maxLife: 60,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                size: Math.random() * 5 + 2,
                update: function() {
                    this.x += this.vx * 0.016;
                    this.y += this.vy * 0.016;
                    this.vy += 50 * 0.016; // gravity
                    this.life--;
                },
                render: (ctx) => {
                    const alpha = this.life / this.maxLife;
                    ctx.fillStyle = this.color;
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            };
            this.addParticle(particle);
        }
    }
    
    createKickEffect(x, y, direction) {
        // Create kick effect particles
        for (let i = 0; i < 10; i++) {
            const particle = {
                x: x,
                y: y,
                vx: Math.cos(direction) * 100 + (Math.random() - 0.5) * 50,
                vy: Math.sin(direction) * 100 + (Math.random() - 0.5) * 50,
                life: 30,
                maxLife: 30,
                color: '#ffffff',
                size: Math.random() * 3 + 1,
                update: function() {
                    this.x += this.vx * 0.016;
                    this.y += this.vy * 0.016;
                    this.vx *= 0.95;
                    this.vy *= 0.95;
                    this.life--;
                },
                render: (ctx) => {
                    const alpha = this.life / this.maxLife;
                    ctx.fillStyle = this.color;
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            };
            this.addParticle(particle);
        }
    }
    
    // Utility methods
    drawText(text, x, y, options = {}) {
        const {
            font = '16px Arial',
            color = '#ffffff',
            align = 'left',
            baseline = 'top'
        } = options;
        
        this.ctx.save();
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }
    
    drawRect(x, y, width, height, options = {}) {
        const {
            fillColor = null,
            strokeColor = null,
            lineWidth = 1
        } = options;
        
        this.ctx.save();
        
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fillRect(x, y, width, height);
        }
        
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeRect(x, y, width, height);
        }
        
        this.ctx.restore();
    }
    
    drawCircle(x, y, radius, options = {}) {
        const {
            fillColor = null,
            strokeColor = null,
            lineWidth = 1
        } = options;
        
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
        }
        
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = lineWidth;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
} 