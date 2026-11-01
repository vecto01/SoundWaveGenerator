const audioWorker = new Worker('workers/audio-worker.js');

// Импорт звуковых эффектов
const audioEffects = new (class AudioEffects {
    constructor() {
        this.effectsEnabled = false;
        this.effects = {
            reverb: false,
            reverbDepth: 50,
            filterType: 'none',
            filterFrequency: 2000,
            filterQ: 1.0
        };
    }

    toggleEffects() {
        this.effectsEnabled = !this.effectsEnabled;
        this.applyEffects();
    }

    applyEffects() {
        audioWorker.postMessage({
            type: 'applyEffects',
            data: {
                ...this.effects,
                applyEffects: this.effectsEnabled
            }
        });
    }

    setReverb(value) {
        this.effects.reverb = value;
        this.applyEffects();
    }

    setReverbDepth(value) {
        this.effects.reverbDepth = value;
        this.applyEffects();
    }

    setFilter(type, frequency, q) {
        this.effects.filterType = type;
        this.effects.filterFrequency = frequency;
        this.effects.filterQ = q;
        this.applyEffects();
    }

    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Alt' && e.code === 'KeyS') {
                this.toggleEffects();
            }
        });
    }

    init() {
        this.setupHotkeys();
    }

})();
audioEffects.init();

// Сохранение настроек в localStorage
function saveSettingsToLocalStorage() {
    localStorage.setItem('soundWaveSettings', JSON.stringify({
        frequency,
        amplitude,
        currentWaveType,
        animationSpeed,
        waveColor,
        effects: {
            reverb: audioEffects.effects.reverb,
            reverbDepth: audioEffects.effects.reverbDepth,
            filterType: audioEffects.effects.filterType,
            filterFrequency: audioEffects.effects.filterFrequency,
            filterQ: audioEffects.effects.filterQ
        }
    }));
}

// Загрузка настроек из localStorage
function loadSettingsFromLocalStorage() {
    const savedSettings = localStorage.getItem('soundWaveSettings');
    if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        frequency = parsedSettings.frequency || frequency;
        amplitude = parsedSettings.amplitude || amplitude;
        currentWaveType = parsedSettings.currentWaveType || currentWaveType;
        animationSpeed = parsedSettings.animationSpeed || animationSpeed;
        waveColor = parsedSettings.waveColor || waveColor;
        
        // Обновляем UI
        frequencySlider.value = frequency;
        volumeSlider.value = amplitude;
        frequencyValueSpan.textContent = frequency;
        volumeValueSpan.textContent = amplitude;
        animationSpeedSlider.value = animationSpeed;
        animationSpeedValueSpan.textContent = animationSpeed + 'x';
        waveColorPicker.value = waveColor;
        
        // Обновляем звуковые эффекты
        audioEffects.effects.reverb = parsedSettings.effects?.reverb || audioEffects.effects.reverb;
        audioEffects.effects.reverbDepth = parsedSettings.effects?.reverbDepth || 50;
        audioEffects.effects.filterType = parsedSettings.effects?.filterType || 'none';
        audioEffects.effects.filterFrequency = parsedSettings.effects?.filterFrequency || 2000;
        audioEffects.applyEffects();
    }
}

// Обработка глубины реверба
const reverbDepthSlider = document.getElementById('reverb-depth');
reverbDepthSlider.addEventListener('input', function() {
    const value = this.value;
    document.getElementById('reverb-depth-value').textContent = `${value}%`;
    audioEffects.setReverbDepth(value);
});

// Обработка типа фильтра
const filterSelector = document.getElementById('filter-selector');
const filterFrequencySlider = document.getElementById('filter-frequency');
const filterQSlider = document.getElementById('filter-q');

filterSelector.addEventListener('change', function() {
    const filterType = this.value;
    const frequency = filterFrequencySlider.value;
    const q = filterQSlider.value;
    audioEffects.setFilter(filterType, frequency, q);
});

// Обработка частоты фильтра
filterFrequencySlider.addEventListener('input', function() {
    const frequency = this.value;
    document.getElementById('filter-frequency-value').textContent = frequency;
    const filterType = filterSelector.value;
    const q = filterQSlider.value;
    audioEffects.setFilter(filterType, frequency, q);
});

// Обработка Q-фактора
filterQSlider.addEventListener('input', function() {
    const q = this.value;
    document.getElementById('filter-q-value').textContent = q;
    const filterType = filterSelector.value;
    const frequency = filterFrequencySlider.value;
    audioEffects.setFilter(filterType, frequency, q);
});