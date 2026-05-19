class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = 0;
        this.vy = 0;
        this.isOnGround = false;
        this.speed = 450;
        this.jumpForce = -480;
        this.glowRadius = 180;
        this.maxGlowRadius = 400;
    }
    
    update(input, deltaTime) {
    console.log('Input:', input); // Добавьте для отладки
    const acceleration = 2000;
    const friction = 0.88;
    
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
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    draw(ctx, cameraX, cameraY) {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;
    
    ctx.save();
    
    // Свечение
    const gradient = ctx.createRadialGradient(
        screenX + this.width/2, screenY + this.height/2, 5,
        screenX + this.width/2, screenY + this.height/2, 60
    );
    gradient.addColorStop(0, 'rgba(255, 220, 100, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(screenX - 40, screenY - 40, this.width + 80, this.height + 80);
    
    // === КРЫЛЫШКИ (по бокам, за телом, только в прыжке) ===
    if (!this.isOnGround) {
        ctx.globalAlpha = 0.35; // Менее яркие
        
        // Левое крылышко
        ctx.fillStyle = '#aaddff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#88bbee';
        ctx.beginPath();
        ctx.ellipse(screenX - 8, screenY + this.height/2, 14, 7, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Правое крылышко
        ctx.beginPath();
        ctx.ellipse(screenX + this.width + 8, screenY + this.height/2, 14, 7, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }
    
    // Тело светлячка
    ctx.fillStyle = '#ffcc44';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffaa00';
    ctx.beginPath();
    ctx.arc(screenX + this.width/2, screenY + this.height/2, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Глаза
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