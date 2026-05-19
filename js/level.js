class Level {
    constructor() {
        this.platforms = [];
        this.spikes = [];
        this.startX = 100;
        this.startY = 600;
        this.finishX = 3200;
        this.width = 3400;
        this.height = 720;
    }
    
    load() {
        this.platforms = [];
        this.spikes = [];
        
        // Стартовая платформа (длинная)
        this.platforms.push(new Platform(50, 620, 180, 20, 'static'));
        
        // Основные платформы (ближе друг к другу)
        this.platforms.push(new Platform(280, 560, 100, 20, 'static'));
        this.platforms.push(new Platform(430, 500, 100, 20, 'static'));
        this.platforms.push(new Platform(580, 440, 100, 20, 'static'));
        
        // Длинная платформа с шипами
        this.platforms.push(new Platform(750, 520, 200, 20, 'static'));
        this.spikes.push(new Spike(790, 500, 30, 20));
        this.spikes.push(new Spike(860, 500, 30, 20));
        this.spikes.push(new Spike(930, 500, 30, 20));
        
        this.platforms.push(new Platform(840, 460, 100, 20, 'static'));
        this.platforms.push(new Platform(1080, 400, 100, 20, 'static'));
        
        // Движущаяся платформа 1
        const moving1 = new Platform(1350, 480, 80, 20, 'moving');
        moving1.setMovement(1300, 1550, 140);
        this.platforms.push(moving1);
        
        this.platforms.push(new Platform(1620, 420, 120, 20, 'static'));
        
        // Длинная платформа с шипами
        this.platforms.push(new Platform(1800, 540, 220, 20, 'static'));
        this.spikes.push(new Spike(1840, 520, 30, 20));
        this.spikes.push(new Spike(1920, 520, 30, 20));
        this.spikes.push(new Spike(2000, 520, 30, 20));
        
        this.platforms.push(new Platform(2080, 480, 100, 20, 'static'));
        this.platforms.push(new Platform(2240, 420, 100, 20, 'static'));
        
        // Движущаяся платформа 2
        const moving2 = new Platform(2400, 500, 80, 20, 'moving');
        moving2.setMovement(2350, 2600, 130);
        this.platforms.push(moving2);
        
        this.platforms.push(new Platform(2680, 440, 120, 20, 'static'));
        this.platforms.push(new Platform(2860, 500, 100, 20, 'static'));
        
        // Финальная длинная платформа
        this.platforms.push(new Platform(3000, 560, 200, 20, 'static'));
        
        console.log('Уровень загружен, платформ:', this.platforms.length, 'шипов:', this.spikes.length);
    }
    
    update(deltaTime) {
        for (const platform of this.platforms) {
            platform.update(deltaTime);
        }
    }
    
    draw(ctx, cameraX, cameraY) {
        for (const platform of this.platforms) {
            platform.draw(ctx, cameraX, cameraY);
        }
        for (const spike of this.spikes) {
            spike.draw(ctx, cameraX, cameraY);
        }
    }
}