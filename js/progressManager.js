class ProgressManager {
    constructor() {
        this.storageKey = 'whisper_progress';
        this.bestTimeKey = 'whisper_best_time';
    }
    
    // Сохранить факт прохождения и время
    saveCompletion(completionTimeSeconds) {
        try {
            localStorage.setItem(this.storageKey, 'true');
            
            const currentBest = this.loadBestTime();
            const isNewRecord = (currentBest === null || completionTimeSeconds < currentBest);
            
            if (isNewRecord) {
                localStorage.setItem(this.bestTimeKey, completionTimeSeconds.toString());
            }
            
            return {
                success: true,
                isNewRecord: isNewRecord,
                bestTime: isNewRecord ? completionTimeSeconds : currentBest
            };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
    
    // Загрузить лучший рекорд времени
    loadBestTime() {
        try {
            const timeStr = localStorage.getItem(this.bestTimeKey);
            if (timeStr === null) return null;
            const time = parseFloat(timeStr);
            return isNaN(time) ? null : time;
        } catch (e) {
            return null;
        }
    }
    
    // Форматирование времени в мм:сс.мс
    static formatTime(seconds) {
        if (seconds === null || seconds === undefined) return '--:--.--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
}