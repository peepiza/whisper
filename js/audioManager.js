class AudioManager {
    constructor() {
        this.audioContext = null;
        this.mediaStream = null;
        this.analyserNode = null;
        this.isInitialized = false;
        this.isCalibrated = false;
        this.currentVolume = 0;
        this.dangerLevel = 0;
        
        this.noiseFloor = 0.01;
        this.minThreshold = 0.03;
        this.dangerThreshold = 0.18;
        
        this.calibrationSamples = [];
    }
    
    async init() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = 256;
            sourceNode.connect(this.analyserNode);
            this.isInitialized = true;
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
    
    async calibrate(durationMs = 4000) {
        if (!this.isInitialized) return { success: false };
        
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        this.calibrationSamples = [];
        
        return new Promise((resolve) => {
            const startTime = performance.now();
            const intervalId = setInterval(() => {
                const volume = this.getInstantVolume();
                this.calibrationSamples.push(volume);
                
                if (performance.now() - startTime >= durationMs) {
                    clearInterval(intervalId);
                    
                    const sorted = [...this.calibrationSamples].sort((a, b) => a - b);
                    const percentileIndex = Math.floor(sorted.length * 0.1);
                    this.noiseFloor = sorted[percentileIndex];
                    
                    this.minThreshold = Math.min(0.12, this.noiseFloor + 0.025);
                    this.dangerThreshold = Math.min(0.3, this.noiseFloor + 0.1);
                    
                    this.minThreshold = Math.max(0.025, this.minThreshold);
                    this.dangerThreshold = Math.max(this.minThreshold + 0.06, this.dangerThreshold);
                    
                    this.isCalibrated = true;
                    console.log('Калибровка (чувствительная):', {
                        noiseFloor: this.noiseFloor.toFixed(3),
                        minThreshold: this.minThreshold.toFixed(3),
                        dangerThreshold: this.dangerThreshold.toFixed(3)
                    });
                    
                    resolve({ success: true });
                }
            }, 100);
        });
    }
    
    getInstantVolume() {
        if (!this.analyserNode) return 0;
        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        this.analyserNode.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const v = (dataArray[i] - 128) / 128;
            sum += v * v;
        }
        let rms = Math.sqrt(sum / dataArray.length) || 0;
        return Math.min(1, rms * 2.2);
    }
    
    update(deltaTime) {
        if (!this.isInitialized || !this.isCalibrated) {
            return { volume: 0, dangerLevel: 0, isTooLoud: false };
        }
        
        let rawVolume = this.getInstantVolume();
        let adjustedVolume = Math.max(0, rawVolume - this.noiseFloor);
        let displayVolume = Math.min(1, adjustedVolume / (this.dangerThreshold - this.noiseFloor));
        this.currentVolume = displayVolume;
        
        let isTooLoudInstant = false;
        
        if (rawVolume > this.dangerThreshold + 0.15) {
            isTooLoudInstant = true;
            this.dangerLevel = 1;
        } 
        else if (rawVolume > this.minThreshold) {
            const fillRate = 1 / 5;
            this.dangerLevel = Math.min(1, this.dangerLevel + fillRate * deltaTime);
        } 
        else {
            const decayRate = 0.8;
            this.dangerLevel = Math.max(0, this.dangerLevel - decayRate * deltaTime);
        }
        
        return { 
            volume: this.currentVolume, 
            dangerLevel: this.dangerLevel, 
            isTooLoud: isTooLoudInstant 
        };
    }
    
    dispose() {
        if (this.audioContext) this.audioContext.close();
        if (this.mediaStream) this.mediaStream.getTracks().forEach(t => t.stop());
        this.isInitialized = false;
        this.isCalibrated = false;
    }
}