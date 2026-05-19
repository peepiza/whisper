class Game {
    constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audioManager = new AudioManager();
    this.progressManager = new ProgressManager();
    this.level = null;
    this.player = null;
    this.gameState = 'menu';
    this.input = { left: false, right: false, jump: false };
    this.cameraX = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.lastTimestamp = 0;
    this.animationId = null;
    
    this.dangerFill = document.getElementById('danger-fill');
    this.volumeFill = document.getElementById('volume-fill');
    this.gameHud = document.getElementById('game-hud');
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    
    // ВАЖНО: устанавливаем фокус на canvas
    this.canvas.setAttribute('tabindex', '0');
    this.canvas.style.outline = 'none';
    this.canvas.addEventListener('click', () => this.canvas.focus());
    
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    this.backgroundImage = new Image();
    this.backgroundImage.src = 'assets/cave.jpg';
    this.backgroundLoaded = false;
    this.backgroundImage.onload = () => {
        this.backgroundLoaded = true;
        console.log('Фоновое изображение загружено');
    };
    this.backgroundImage.onerror = () => {
        console.error('Не удалось загрузить фон: assets/cave.jpg');
    };
    
    this.showScreen = this.showScreen.bind(this);
}
    
    handleKeyDown(e) {
        if (this.gameState === 'playing') {
            if (e.key === 'ArrowLeft') { this.input.left = true; e.preventDefault(); }
            if (e.key === 'ArrowRight') { this.input.right = true; e.preventDefault(); }
            if (e.key === 'ArrowUp') { this.input.jump = true; e.preventDefault(); }
        }
        if (e.key === 'Escape' && this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showScreen('pause-screen');
            if (this.animationId) cancelAnimationFrame(this.animationId);
            e.preventDefault();
        }
    }
    
    handleKeyUp(e) {
        if (e.key === 'ArrowLeft') this.input.left = false;
        if (e.key === 'ArrowRight') this.input.right = false;
        if (e.key === 'ArrowUp') this.input.jump = false;
    }
    
    async startNewGame() {
        console.log('startNewGame');
        
        this.level = new Level();
        this.level.load();
        this.player = new Player(this.level.startX, this.level.startY);
        
        const initResult = await this.audioManager.init();
        if (!initResult.success) {
            alert('Нет доступа к микрофону! Разрешите доступ и обновите страницу.');
            return false;
        }
        
        this.gameState = 'calibrating';
        this.showScreen('calibrate-screen');
        
        const progressBar = document.getElementById('calibrate-progress');
        const statusText = document.getElementById('calibrate-status');
        const startCalibTime = Date.now();
        const calibDuration = 4000;
        
        const calibInterval = setInterval(() => {
            const elapsed = Date.now() - startCalibTime;
            const percent = Math.min(100, (elapsed / calibDuration) * 100);
            if (progressBar) progressBar.style.width = percent + '%';
            
            if (elapsed < 2000) {
                if (statusText) statusText.textContent = 'Определение фонового шума...';
            } else if (elapsed < 3500) {
                if (statusText) statusText.textContent = 'Настройка чувствительности...';
            } else {
                if (statusText) statusText.textContent = 'Почти готово...';
            }
        }, 50);
        
        await this.audioManager.calibrate(calibDuration);
        clearInterval(calibInterval);
        if (progressBar) progressBar.style.width = '100%';
        await new Promise(r => setTimeout(r, 300));
        
        this.gameState = 'playing';
        this.hideAllScreens();
        if (this.gameHud) this.gameHud.classList.add('visible');
        this.startTime = performance.now() / 1000;
        const helpBtn = document.getElementById('help-btn-game');
        if (helpBtn) helpBtn.style.display = 'flex';
        
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.lastTimestamp = 0;
        this.animationId = requestAnimationFrame((ts) => this.gameLoop(ts));
        
        return true;
    }
    
    gameLoop(nowMs) {
        if (this.gameState !== 'playing') return;
        
        const now = nowMs / 1000;
        let deltaTime = Math.min(0.033, this.lastTimestamp === 0 ? 0.016 : now - this.lastTimestamp);
        this.lastTimestamp = now;
        this.elapsedTime = now - this.startTime;
        
        const audioState = this.audioManager.update(deltaTime);
        this.updateAudioUI(audioState.volume, audioState.dangerLevel);
        
        if (audioState.isTooLoud) {
            this.gameOver('Тьма услышала тебя...');
            return;
        }
        
        if (audioState.dangerLevel >= 0.99) {
            this.gameOver('Тьма услышала тебя...');
            return;
        }
        
        this.player.update(this.input, deltaTime);
        
        this.player.vy += 1200 * deltaTime;
        this.player.x += this.player.vx * deltaTime;
        this.player.y += this.player.vy * deltaTime;
        
        this.player.isOnGround = false;
        for (const platform of this.level.platforms) {
            if (this.player.x + this.player.width > platform.x && 
                this.player.x < platform.x + platform.width &&
                this.player.y + this.player.height > platform.y && 
                this.player.y + this.player.height < platform.y + platform.height + 10 &&
                this.player.vy >= 0) {
                this.player.y = platform.y - this.player.height;
                this.player.vy = 0;
                this.player.isOnGround = true;
            }
        }
        
        for (const spike of this.level.spikes) {
            if (this.player.x + this.player.width > spike.x && 
                this.player.x < spike.x + spike.width &&
                this.player.y + this.player.height > spike.y && 
                this.player.y < spike.y + spike.height) {
                this.gameOver('Пещера небезопасна...');
                return;
            }
        }
        
        if (this.player.y + this.player.height > this.level.height + 100) {
            this.gameOver('Пещера оказалась глубока...');
            return;
        }
        
        if (this.player.x + this.player.width > this.level.finishX) {
            this.winGame();
            return;
        }
        
        const volume = audioState.volume;
        const minRadius = 80;
        const maxRadius = 450;
        const currentRadius = minRadius + (maxRadius - minRadius) * Math.min(1, volume * 1.2);
        
        const playerCenterX = this.player.x + this.player.width/2;
        const playerCenterY = this.player.y + this.player.height/2;
        
        for (const platform of this.level.platforms) {
            const platCenterX = platform.x + platform.width/2;
            const platCenterY = platform.y + platform.height/2;
            const dx = platCenterX - playerCenterX;
            const dy = platCenterY - playerCenterY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            let alpha = 0;
            
            const isPlayerStandingOn = (this.player.isOnGround && 
                Math.abs(this.player.y + this.player.height - platform.y) < 5 &&
                this.player.x + this.player.width > platform.x && 
                this.player.x < platform.x + platform.width);
            
            if (isPlayerStandingOn) {
                alpha = 0.7;
            }
            else if (platform.type === 'moving') {
                alpha = 0.85;
            }
            else if (distance < currentRadius) {
                const intensity = 1 - (distance / currentRadius);
                alpha = volume * 1.8 * intensity;
                alpha = Math.min(0.9, alpha);
            }
            
            platform.setAlpha(alpha);
        }
        
        for (const spike of this.level.spikes) {
            const spikeCenterX = spike.x + spike.width/2;
            const spikeCenterY = spike.y + spike.height/2;
            const dx = spikeCenterX - playerCenterX;
            const dy = spikeCenterY - playerCenterY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            let alpha = 0;
            if (distance < currentRadius) {
                const intensity = 1 - (distance / currentRadius);
                alpha = volume * 1.8 * intensity;
                alpha = Math.min(0.9, alpha);
            }
            spike.setAlpha(alpha);
        }
        
        this.level.update(deltaTime);
        
        this.cameraX = this.player.x + 16 - this.canvas.width/2;
        this.cameraX = Math.max(0, Math.min(this.cameraX, this.level.width - this.canvas.width));
        
        this.render();
        
        this.animationId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем фоновое изображение
        if (this.backgroundLoaded && this.backgroundImage) {
            // Параллакс эффект: фон движется медленнее камеры
            const bgX = this.cameraX * 0.3;
            this.ctx.drawImage(this.backgroundImage, -bgX, 0, this.canvas.width + bgX, this.canvas.height);
        } else {
            // Запасной вариант — градиент, если изображение не загрузилось
            const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            grad.addColorStop(0, '#0a0e1a');
            grad.addColorStop(1, '#161a2a');
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.level.draw(this.ctx, this.cameraX, 0);
        this.player.draw(this.ctx, this.cameraX, 0);
        
        if (this.player && this.audioManager.currentVolume > 0.03) {
            const intensity = Math.min(0.5, this.audioManager.currentVolume * 1.2);
            const playerScreenX = this.player.x + this.player.width/2 - this.cameraX;
            const playerScreenY = this.player.y + this.player.height/2;
            
            const glowGrad = this.ctx.createRadialGradient(
                playerScreenX, playerScreenY, 20,
                playerScreenX, playerScreenY, 380
            );
            glowGrad.addColorStop(0, `rgba(255, 230, 120, ${intensity * 0.5})`);
            glowGrad.addColorStop(0.3, `rgba(255, 200, 80, ${intensity * 0.25})`);
            glowGrad.addColorStop(0.6, `rgba(255, 160, 40, ${intensity * 0.1})`);
            glowGrad.addColorStop(1, 'rgba(255, 120, 0, 0)');
            
            this.ctx.globalCompositeOperation = 'lighter';
            this.ctx.fillStyle = glowGrad;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalCompositeOperation = 'source-over';
        }
        
        const timeValue = this.formatTime(this.elapsedTime);
        const bestTime = this.progressManager.loadBestTime();
        const bestTimeValue = bestTime ? this.formatTime(bestTime) : '--:--.--';
        
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        if (this.ctx.roundRect) {
            this.ctx.roundRect(15, 15, 210, 65, 10);
        } else {
            this.ctx.rect(15, 15, 210, 65);
        }
        this.ctx.fill();
        
        this.ctx.font = '14px monospace';
        this.ctx.fillStyle = '#ffd966';
        this.ctx.fillText('ВРЕМЯ:', 25, 38);
        this.ctx.font = 'bold 18px monospace';
        this.ctx.fillStyle = '#ffd966';
        this.ctx.fillText(timeValue, 25, 60);
        
        this.ctx.font = '12px monospace';
        this.ctx.fillStyle = 'rgba(255, 217, 102, 0.7)';
        this.ctx.fillText('РЕКОРД', 140, 38);
        this.ctx.font = 'bold 14px monospace';
        this.ctx.fillStyle = '#ffaa44';
        this.ctx.fillText(bestTimeValue, 140, 60);
        
        this.ctx.font = '12px monospace';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.shadowBlur = 0;
        this.ctx.fillText('← → движение | ↑ прыжок', 20, this.canvas.height - 20);
    }
    
    updateAudioUI(volume, danger) {
        if (this.volumeFill) this.volumeFill.style.width = (volume * 100) + '%';
        if (this.dangerFill) this.dangerFill.style.width = (danger * 100) + '%';
    }
    
    winGame() {
        this.gameState = 'win';
        if (this.gameHud) this.gameHud.classList.remove('visible');
        if (this.animationId) cancelAnimationFrame(this.animationId);
        
        const saveResult = this.progressManager.saveCompletion(this.elapsedTime);
        
        const winTime = document.getElementById('win-time');
        if (winTime) {
            winTime.textContent = 'Время: ' + this.formatTime(this.elapsedTime);
        }
        
        const newRecordEl = document.getElementById('new-record');
        if (newRecordEl) {
            if (saveResult.isNewRecord) {
                newRecordEl.style.display = 'block';
                newRecordEl.textContent = '🏆 НОВЫЙ РЕКОРД! 🏆';
            } else {
                newRecordEl.style.display = 'none';
            }
        }
        
        this.showScreen('win-screen');
    }
    
    gameOver(reason) {
        this.gameState = 'gameOver';
        if (this.gameHud) this.gameHud.classList.remove('visible');
        if (this.animationId) cancelAnimationFrame(this.animationId);
        
        const loseReason = document.getElementById('lose-reason');
        if (loseReason) loseReason.textContent = reason;
        
        this.showScreen('lose-screen');
    }
    
    showScreen(screenId) {
        this.hideAllScreens();
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.add('active');
    }
    
    hideAllScreens() {
        const screens = ['menu-screen', 'calibrate-screen', 'win-screen', 'lose-screen', 'pause-screen'];
        screens.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('active');
        });
    }
    
    quitToMenu() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.gameHud) this.gameHud.classList.remove('visible');
        this.gameState = 'menu';
        this.showScreen('menu-screen');
        this.audioManager.dispose();
    }
}

if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x+r, y);
        this.lineTo(x+w-r, y);
        this.quadraticCurveTo(x+w, y, x+w, y+r);
        this.lineTo(x+w, y+h-r);
        this.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        this.lineTo(x+r, y+h);
        this.quadraticCurveTo(x, y+h, x, y+h-r);
        this.lineTo(x, y+r);
        this.quadraticCurveTo(x, y, x+r, y);
        return this;
    };
}