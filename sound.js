const audioWorker = new Worker('workers/audio-worker.js');

// Импорт звуковых эффектов
const audioEffects = new (class AudioEffects {
    constructor() {
        this.effectsEnabled = false;
        this.effects = {
            reverb: false,
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
            data: this.effects
        });
    }

    setReverb(value) {
        this.effects.reverb = value;
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

// Канал связи с worker
const audioChannel = {
    send: (type, data) => audioWorker.postMessage({ type, data }),
    receive: (callback) => {
        audioWorker.onmessage = (e) => callback(e.data);
    }
};

// Переменные для хранения состояния
let currentWaveType = 'sine';
let frequency = 440;
let amplitude = 0.5;
let animationSpeed = 1;
let waveColor = '#000000';
const canvas = document.getElementById('wave-canvas');
const ctx = canvas.getContext('2d');
const frequencySlider = document.getElementById('frequency');
const volumeSlider = document.getElementById('volume');
const frequencyValueSpan = document.getElementById('frequency-value');
const volumeValueSpan = document.getElementById('volume-value');
const animationSpeedSlider = document.getElementById('animation-speed');
const animationSpeedValueSpan = document.getElementById('animation-speed-value');
const waveColorPicker = document.getElementById('wave-color');
const soundOnlyCheckbox = document.getElementById('sound-only');

// Инициализация worker
audioChannel.send('init', { frequency, type: currentWaveType });

// Установка обработчиков событий
frequencySlider.addEventListener('input', function() {
    frequency = parseInt(this.value);
    frequencyValueSpan.textContent = frequency;
    audioChannel.send('update', { frequency, type: currentWaveType });
});

volumeSlider.addEventListener('input', function() {
    amplitude = parseFloat(this.value);
    volumeValueSpan.textContent = amplitude;
    audioChannel.send('update', { frequency, type: currentWaveType, amp: amplitude });
});

animationSpeedSlider.addEventListener('input', function() {
    animationSpeed = parseFloat(this.value);
    animationSpeedValueSpan.textContent = animationSpeed + 'x';
});

waveColorPicker.addEventListener('input', function() {
    waveColor = this.value;
});

soundOnlyCheckbox.addEventListener('change', function() {
    if (this.checked) {
        canvas.style.display = 'none';
    } else {
        canvas.style.display = 'block';
    }
});

// Установка обработчиков для звуковых эффектов
const reverbToggle = document.getElementById('reverb-toggle');
const filterSelector = document.getElementById('filter-selector');
const filterFrequencySlider = document.getElementById('filter-frequency');

reverbToggle.addEventListener('change', function() {
    audioEffects.setReverb(this.checked);
});

filterSelector.addEventListener('change', function() {
    const filterType = this.value;
    audioEffects.setFilter(filterType, filterFrequencySlider.value, 1.0);
});

filterFrequencySlider.addEventListener('input', function() {
    const filterType = filterSelector.value;
    audioEffects.setFilter(filterType, this.value, 1.0);
});

// Типы волн
const waveTypeButtons = [
    document.getElementById('waveType1'),
    document.getElementById('waveType2'),
    document.getElementById('waveType3')
];

waveTypeButtons.forEach((button, index) => {
    button.addEventListener('click', function() {
        waveTypeButtons.forEach(btn => btn.style.backgroundColor = '');
        this.style.backgroundColor = '#4CAF50';
        currentWaveType = ['sine', 'square', 'triangle'][index];
        audioChannel.send('update', { frequency, type: currentWaveType });
    });
});

// Функция для рисования волны
function drawWaveform() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = Date.now() * 0.001 * animationSpeed;
    const xStep = canvas.width / 50;
    const yScale = canvas.height / 2;
    ctx.strokeStyle = waveColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 50; i++) {
        const x = i * xStep;
        let y = 0;
        switch (currentWaveType) {
            case 'sine': y = Math.sin(t * frequency * 2 * Math.PI) * amplitude; break;
            case 'square': y = Math.abs(Math.round(Math.sin(t * frequency * 2 * Math.PI))) * amplitude - 0.5; break;
            case 'triangle': y = (Math.sin(t * frequency * 2 * Math.PI) + Math.sin(t * frequency * 2 * Math.PI * 3)) / (2 * Math.PI) * amplitude; break;
        }
        ctx.lineTo(x, canvas.height / 2 + y * yScale);
    }
    ctx.stroke();
    requestAnimationFrame(drawWaveform);
}

// Управление звуком
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');

playBtn.addEventListener('click', () => {
    audioChannel.send('start');
});

stopBtn.addEventListener('click', () => {
    audioChannel.send('stop');
});

// Горячие клавиши
let ctrlPressed = false;

document.addEventListener('keydown', function(e) {
    switch (e.key) {
        case 'ArrowUp':
            frequency += 10;
            frequencySlider.value = frequency;
            frequencyValueSpan.textContent = frequency;
            audioChannel.send('update', { frequency, type: currentWaveType });
            break;
        case 'ArrowDown':
            frequency -= 10;
            frequencySlider.value = frequency;
            frequencyValueSpan.textContent = frequency;
            audioChannel.send('update', { frequency, type: currentWaveType });
            break;
        case 'Control':
            ctrlPressed = true;
            break;
        case 'ArrowUp' && ctrlPressed:
            amplitude = Math.min(amplitude + 0.1, 1);
            volumeSlider.value = amplitude;
            volumeValueSpan.textContent = amplitude;
            audioChannel.send('update', { frequency, type: currentWaveType, amp: amplitude });
            break;
        case 'ArrowDown' && ctrlPressed:
            amplitude = Math.max(amplitude - 0.1, 0.1);
            volumeSlider.value = amplitude;
            volumeValueSpan.textContent = amplitude;
            audioChannel.send('update', { frequency, type: currentWaveType, amp: amplitude });
            break;
        case '1':
            currentWaveType = 'sine';
            waveTypeButtons.forEach(btn => btn.style.backgroundColor = '');
            waveTypeButtons[0].style.backgroundColor = '#4CAF50';
            audioChannel.send('update', { frequency, type: currentWaveType });
            break;
        case '2':
            currentWaveType = 'square';
            waveTypeButtons.forEach(btn => btn.style.backgroundColor = '');
            waveTypeButtons[1].style.backgroundColor = '#4CAF50';
            audioChannel.send('update', { frequency, type: currentWaveType });
            break;
        case '3':
            currentWaveType = 'triangle';
            waveTypeButtons.forEach(btn => btn.style.backgroundColor = '');
            waveTypeButtons[2].style.backgroundColor = '#4CAF50';
            audioChannel.send('update', { frequency, type: currentWaveType });
            break;
        case 'Escape':
            resetSettings();
            break;
    }
});

document.addEventListener('keyup', function(e) {
    if (e.key === 'Control' || e.key === 'Meta') {
        ctrlPressed = false;
    }
});

// Сброс настроек
function resetSettings() {
    frequency = 440;
    amplitude = 0.5;
    currentWaveType = 'sine';
    frequencySlider.value = frequency;
    volumeSlider.value = amplitude;
    frequencyValueSpan.textContent = frequency;
    volumeValueSpan.textContent = amplitude;
    waveTypeButtons[0].style.backgroundColor = '#4CAF50';
    waveTypeButtons.forEach((btn, index) => index !== 0 && (btn.style.backgroundColor = ''));
    audioChannel.send('update', { frequency, type: currentWaveType });
}

// Запуск визуализации
if (!soundOnlyCheckbox.checked) {
    drawWaveform();
}