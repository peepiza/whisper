document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);
    
    // ===== PWA УСТАНОВКА =====
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');
    
    // Проверяем, установлено ли уже приложение
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true;
    
    // Событие beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('beforeinstallprompt сработал');
        e.preventDefault();
        deferredPrompt = e;
        
        // Показываем кнопку, если приложение НЕ установлено
        if (!isStandalone && installBtn) {
            installBtn.style.display = 'block';
            installBtn.textContent = 'Установить игру';
            console.log('Кнопка установки показана');
        }
    });
    
    // Обработчик кнопки установки
    if (installBtn) {
        installBtn.onclick = async () => {
            console.log('Нажата кнопка установки');
            if (deferredPrompt) {
                // Показываем диалог установки
                deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                console.log('Результат установки:', result.outcome);
                
                if (result.outcome === 'accepted') {
                    console.log('Приложение установлено');
                    installBtn.style.display = 'none';
                }
                deferredPrompt = null;
            } else {
                alert('Установка недоступна. Попробуйте обновить страницу.');
            }
        };
    }
    
    // Скрываем кнопку, если приложение уже установлено
    if (isStandalone && installBtn) {
        installBtn.style.display = 'none';
    }
    
    // ===== КНОПКИ МЕНЮ =====
    const startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.onclick = () => game.startNewGame();
    
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) playAgainBtn.onclick = () => game.startNewGame();
    
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) retryBtn.onclick = () => game.startNewGame();
    
    const winMenuBtn = document.getElementById('win-menu-btn');
    if (winMenuBtn) winMenuBtn.onclick = () => game.quitToMenu();
    
    const loseMenuBtn = document.getElementById('lose-menu-btn');
    if (loseMenuBtn) loseMenuBtn.onclick = () => game.quitToMenu();
    
    // Кнопки паузы
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
        resumeBtn.onclick = () => {
            game.gameState = 'playing';
            game.hideAllScreens();
            game.lastTimestamp = 0;
            game.animationId = requestAnimationFrame((ts) => game.gameLoop(ts));
        };
    }
    
    const quitPauseBtn = document.getElementById('quit-pause-btn');
    if (quitPauseBtn) quitPauseBtn.onclick = () => game.quitToMenu();
    
    game.showScreen('menu-screen');
    
    // Регистрация Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('Service Worker зарегистрирован:', reg);
        }).catch(err => {
            console.error('Ошибка регистрации SW:', err);
        });
    }
});