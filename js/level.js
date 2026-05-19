class Level {
    constructor() {
        this.platforms = [];
        this.spikes = [];
        this.startX = 100;
        this.startY = 550;
        this.finishX = 3400;
        this.width = 3600;
        this.height = 720;
    }
    
    load() {
        this.platforms = [];
        this.spikes = [];
        
        // === СЕКЦИЯ 1: СТАРТ ===
        this.platforms.push(new Platform(50, 600, 150, 20, 'static'));
        this.platforms.push(new Platform(250, 550, 100, 20, 'static'));
        this.platforms.push(new Platform(400, 500, 100, 20, 'static'));
        this.platforms.push(new Platform(550, 450, 100, 20, 'static'));
        
        // === СЕКЦИЯ 2: ПЕРВАЯ ДЛИННАЯ ПЛАТФОРМА С ШИПАМИ ===
        this.platforms.push(new Platform(720, 480, 220, 20, 'static'));
        // Шипы на платформе
        this.spikes.push(new Spike(780, 460, 30, 20));
        this.spikes.push(new Spike(840, 460, 30, 20));
        this.spikes.push(new Spike(900, 460, 30, 20));
        
        // Платформа ВЫШЕ и ВНАХЛЁСТ с шипами (y=430, x=960, чтобы перекрыть шипы)
        this.platforms.push(new Platform(960, 430, 120, 20, 'static'));
        
        // Подъём
        this.platforms.push(new Platform(1130, 400, 100, 20, 'static'));
        
        // === СЕКЦИЯ 3: ДВИЖУЩАЯСЯ ПЛАТФОРМА 1 ===
        const moving1 = new Platform(1350, 430, 80, 20, 'moving');
        moving1.setMovement(1280, 1580, 70);
        this.platforms.push(moving1);
        
        this.platforms.push(new Platform(1650, 430, 120, 20, 'static'));
        
        // === СЕКЦИЯ 4: ВТОРАЯ ДЛИННАЯ ПЛАТФОРМА С ШИПАМИ ===
        this.platforms.push(new Platform(1850, 490, 240, 20, 'static'));
        this.spikes.push(new Spike(1910, 470, 30, 20));
        this.spikes.push(new Spike(1970, 470, 30, 20));
        this.spikes.push(new Spike(2030, 470, 30, 20));
        
        // Платформа ВЫШЕ и ВНАХЛЁСТ с шипами
        this.platforms.push(new Platform(2150, 460, 120, 20, 'static'));
        
        // Подъём
        this.platforms.push(new Platform(2320, 430, 100, 20, 'static'));
        
        // === СЕКЦИЯ 5: ДВИЖУЩАЯСЯ ПЛАТФОРМА 2 ===
        const moving2 = new Platform(2500, 460, 80, 20, 'moving');
        moving2.setMovement(2420, 2700, 60);
        this.platforms.push(moving2);
        
        this.platforms.push(new Platform(2780, 460, 120, 20, 'static'));
        this.platforms.push(new Platform(2980, 500, 100, 20, 'static'));
        
        // === ФИНИШ ===
        this.platforms.push(new Platform(3180, 550, 200, 20, 'static'));
        
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