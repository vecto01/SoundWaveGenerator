// audio-effects.js

// Класс для обработки звуковых эффектов
class AudioEffects {
    constructor(audioWorker) {
        this.audioWorker = audioWorker;
        this.effects = {
            reverb: false,
            reverbDepth: 50,
            filterType: 'none',
            filterFrequency: 2000,
            filterQ: 1.0
        };
        this.effectsEnabled = false;
    }

    // Включение/выключение эффектов
    toggleEffects() {
        this.effectsEnabled = !this.effectsEnabled;
        this.applyEffects();
    }

    // Применение эффектов
    applyEffects() {
        if (this.effectsEnabled) {
            this.audioWorker.postMessage({
                type: 'applyEffects',
                data: {
                    reverb: this.effects.reverb,
                    reverbDepth: this.effects.reverbDepth,
                    filterType: this.effects.filterType,
                    filterFrequency: this.effects.filterFrequency,
                    filterQ: this.effects.filterQ
                }
            });
        }
    }

    // Настройка реверба
    setReverb(value) {
        this.effects.reverb = value;
        this.applyEffects();
    }

    // Настройка глубины реверба
    setReverbDepth(value) {
        this.effects.reverbDepth = value;
        this.applyEffects();
    }

    // Настройка фильтра
    setFilter(type, frequency, q) {
        this.effects.filterType = type;
        this.effects.filterFrequency = frequency;
        this.effects.filterQ = q;
        this.applyEffects();
    }

    // Горячие клавиши для эффектов
    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Alt' && e.code === 'KeyS') {
                this.toggleEffects();
            }
        });
    }
}

// Экспорт класса
const audioEffects = new AudioEffects(audioWorker);
audioEffects.setupHotkeys();
audioEffects.setupHotkeys();