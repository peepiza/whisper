class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = 0;
        this.vy = 0;
        this.isOnGround = false;
        this.speed = 250;
        this.jumpForce = -580;
        this.glowRadius = 280;
        this.maxGlowRadius = 500;
    }
    
    update(input, deltaTime) {
        const acceleration = 1200;
        const friction = 0.94;
        
        if (input.left) {
            this.vx = Math.max(-this.speed, this.vx - acceleration * deltaTime);
        } else if (input.right) {
            this.vx = Math.min(this.speed, this.vx + acceleration * deltaTime);
        } else {
            this.vx *= friction;
        }
        
        if (input.jump && this.isOnGround) {
            this.vy = this.jumpForce;
            this.isOnGround = false;
        }
    }
    
    getRect() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        
        ctx.save();
        
        const gradient = ctx.createRadialGradient(
            screenX + this.width/2, screenY + this.height/2, 5,
            screenX + this.width/2, screenY + this.height/2, 50
        );
        gradient.addColorStop(0, 'rgba(255, 220, 100, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(screenX - 40, screenY - 40, this.width + 80, this.height + 80);
        
        ctx.fillStyle = '#ffcc44';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffaa00';
        ctx.beginPath();
        ctx.arc(screenX + this.width/2, screenY + this.height/2, 18, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(screenX + this.width * 0.7, screenY + this.height * 0.35, 4, 0, Math.PI * 2);
        ctx.arc(screenX + this.width * 0.3, screenY + this.height * 0.35, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(screenX + this.width * 0.68, screenY + this.height * 0.33, 1.5, 0, Math.PI * 2);
        ctx.arc(screenX + this.width * 0.28, screenY + this.height * 0.33, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}