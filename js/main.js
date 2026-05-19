document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);
    
    // ===== PWA УСТАНОВКА =====
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('beforeinstallprompt сработал');
        e.preventDefault();
        deferredPrompt = e;
        if (!isStandalone && installBtn) {
            installBtn.style.display = 'block';
        }
    });
    
    if (installBtn) {
        installBtn.onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                console.log('Результат установки:', result.outcome);
                deferredPrompt = null;
                installBtn.style.display = 'none';
            }
        };
    }
    
    if (isStandalone && installBtn) {
        installBtn.style.display = 'none';
    }
    
    // Кнопка очистки кэша — ПОКАЗЫВАЕМ ВСЕГДА (для отладки)
    if (clearCacheBtn) {
        clearCacheBtn.style.display = 'block';
        clearCacheBtn.onclick = async () => {
            if (confirm('Очистить кэш и перезагрузить игру?')) {
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (let registration of registrations) {
                        await registration.unregister();
                    }
                }
                if ('caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(key => caches.delete(key)));
                }
                alert('Кэш очищен! Страница будет перезагружена.');
                window.location.reload();
            }
        };
    }
    
    // ===== МОДАЛЬНОЕ ОКНО ИНСТРУКЦИИ =====
    const modal = document.getElementById('help-modal');
    const helpBtnMenu = document.getElementById('help-btn-menu');
    const helpBtnGame = document.getElementById('help-btn-game');
    const closeModal = document.querySelector('.close-modal');
    const closeHelpBtn = document.getElementById('close-help-btn');
    
    function openModal() {
        if (modal) modal.classList.add('active');
    }
    
    function closeModalFunc() {
        if (modal) modal.classList.remove('active');
    }
    
    if (helpBtnMenu) {
        helpBtnMenu.onclick = (e) => {
            e.preventDefault();
            openModal();
        };
    }
    
    if (helpBtnGame) {
        helpBtnGame.onclick = (e) => {
            e.preventDefault();
            openModal();
        };
    }
    
    if (closeModal) closeModal.onclick = closeModalFunc;
    if (closeHelpBtn) closeHelpBtn.onclick = closeModalFunc;
    
    window.onclick = (e) => {
        if (e.target === modal) closeModalFunc();
    };
    
    // Переопределяем метод showScreen игры, чтобы показывать/скрывать кнопку "?"
    const originalShowScreen = game.showScreen.bind(game);
    game.showScreen = function(screenId) {
        originalShowScreen(screenId);
        if (helpBtnGame) {
            if (screenId === 'game-hud' || this.gameState === 'playing') {
                helpBtnGame.style.display = 'flex';
            } else {
                helpBtnGame.style.display = 'none';
            }
        }
    };
    
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
    
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
        resumeBtn.onclick = () => {
            game.gameState = 'playing';
            game.hideAllScreens();
            game.lastTimestamp = 0;
            if (game.animationId) cancelAnimationFrame(game.animationId);
            game.animationId = requestAnimationFrame((ts) => game.gameLoop(ts));
        };
    }
    
    const quitPauseBtn = document.getElementById('quit-pause-btn');
    if (quitPauseBtn) quitPauseBtn.onclick = () => game.quitToMenu();
    
    game.showScreen('menu-screen');
    
    // Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('Service Worker зарегистрирован:', reg);
        }).catch(err => {
            console.error('Ошибка регистрации SW:', err);
        });
    }
});