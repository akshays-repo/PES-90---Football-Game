class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.accelerationX = 0;
        this.accelerationY = 0;
        this.maxSpeed = 0;
        this.friction = 0.95;
        this.active = true;
        this.tag = 'entity';
    }
    
    update(deltaTimeSec) {
        if (!this.active) return;
        
        // Apply acceleration (per second)
        this.velocityX += this.accelerationX * deltaTimeSec;
        this.velocityY += this.accelerationY * deltaTimeSec;
        
        // Apply friction per tick
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;
        
        // Limit speed
        const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        if (speed > this.maxSpeed) {
            this.velocityX = (this.velocityX / speed) * this.maxSpeed;
            this.velocityY = (this.velocityY / speed) * this.maxSpeed;
        }
        
        // Update position (per second)
        this.x += this.velocityX * deltaTimeSec;
        this.y += this.velocityY * deltaTimeSec;
    }
    
    render(ctx) {
        // Base render method - can be overridden
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
    
    // Collision detection methods
    getBounds() {
        return {
            left: this.x - this.width / 2,
            right: this.x + this.width / 2,
            top: this.y - this.height / 2,
            bottom: this.y + this.height / 2
        };
    }
    
    intersects(other) {
        const bounds1 = this.getBounds();
        const bounds2 = other.getBounds();
        
        return !(bounds1.right < bounds2.left || 
                bounds1.left > bounds2.right || 
                bounds1.bottom < bounds2.top || 
                bounds1.top > bounds2.bottom);
    }
    
    // Utility methods
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    angleTo(other) {
        return Math.atan2(other.y - this.y, other.x - this.x);
    }
    
    normalizeVector(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    setVelocity(x, y) {
        this.velocityX = x;
        this.velocityY = y;
    }
    
    addVelocity(x, y) {
        this.velocityX += x;
        this.velocityY += y;
    }
}

// Node export for tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Entity;
} 