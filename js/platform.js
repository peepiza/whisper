class Platform {
    constructor(x, y, width, height, type = 'static') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.alpha = 0;
        this.moveRange = null;
        this.moveDirection = 1;
        this.moveSpeed = 0;
    }
    
    setMovement(startX, endX, speed) {
        if (this.type === 'moving') {
            this.moveRange = { startX: startX, endX: endX };
            this.moveSpeed = speed;
            this.moveDirection = 1;
        }
    }
    
    update(deltaTime) {
        if (this.type === 'moving' && this.moveRange) {
            let newX = this.x + this.moveSpeed * deltaTime * this.moveDirection;
            if (newX >= this.moveRange.endX) {
                newX = this.moveRange.endX;
                this.moveDirection = -1;
            } else if (newX <= this.moveRange.startX) {
                newX = this.moveRange.startX;
                this.moveDirection = 1;
            }
            this.x = newX;
        }
    }
    
    setAlpha(alpha) {
        if (this.type === 'moving') {
            // Движущиеся платформы всегда видны
            this.alpha = 0.85;
        } else {
            this.alpha = Math.min(0.9, Math.max(0, alpha));
        }
    }
    
    draw(ctx, cameraX, cameraY) {
        if (this.alpha <= 0.05) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        if (this.type === 'moving') {
            // Движущиеся платформы — голубо-синие с пульсацией
            ctx.fillStyle = '#3a6ea5';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#4a8ec5';
            const pulse = 0.7 + Math.sin(Date.now() * 0.005) * 0.15;
            ctx.globalAlpha = Math.min(0.9, this.alpha * pulse);
        } else {
            // Статические платформы — тёмно-голубые
            ctx.fillStyle = '#4a7a9c';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#5a8aac';
        }
        
        ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);
        ctx.strokeStyle = '#97b2f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - cameraX, this.y - cameraY, this.width, this.height);
        ctx.restore();
    }
}

class Spike {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.alpha = 0;
    }
    
    setAlpha(alpha) {
        this.alpha = Math.min(0.9, Math.max(0, alpha));
    }
    
    draw(ctx, cameraX, cameraY) {
        if (this.alpha <= 0.05) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Ярко-синие шипы с фиолетовой окантовкой
        ctx.fillStyle = '#3366ff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#aa44ff';
        
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + this.height);
        ctx.lineTo(screenX + this.width / 2, screenY);
        ctx.lineTo(screenX + this.width, screenY + this.height);
        ctx.fill();
        
        // Фиолетовая окантовка
        ctx.strokeStyle = '#cc66ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + this.height);
        ctx.lineTo(screenX + this.width / 2, screenY);
        ctx.lineTo(screenX + this.width, screenY + this.height);
        ctx.stroke();
        
        ctx.restore();
    }
}