// Подключение модуля звуковых эффектов
const audioEffects = window.audioEffects || new (() => {
  const script = document.createElement('script');
  script.src = 'audioEffects.js';
  script.onload = () => {
    window.audioEffects = new AudioEffects();
    window.audioEffects.init();
  };
  document.head.appendChild(script);
})();

// Объект для хранения настроек
let settings = {
    frequency: 440,
    duration: 2,
    volume: 0.7,
    soundOnly: false,
    waveType: 'sine'
};

// Элементы DOM
const frequencySlider = document.getElementById('frequency');
const frequencyValue = document.getElementById('frequency-value');
const durationSlider = document.getElementById('duration');
const durationValue = document.getElementById('duration-value');
const volumeSlider = document.getElementById('volume');
const volumeValue = document.getElementById('volume-value');
const soundOnlyCheckbox = document.getElementById('sound-only');
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
const waveCanvas = document.getElementById('wave-canvas');
const ctx = waveCanvas.getContext('2d');

// Показать спиннер загрузки
const loadingSpinner = document.getElementById('loading-spinner');
const body = document.body;

body.classList.add('loading');
loadingSpinner.classList.remove('hidden');

// Скрыть спиннер после инициализации
function hideLoading() {
    setTimeout(() => {
        body.classList.remove('loading');
        loadingSpinner.classList.add('hidden');
    }, 1500);
}

// AudioContext для генерации звука
let audioContext;
let oscillator;
let gainNode;
let animationId;

// Проверка поддержки AudioWorklet
function initAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0.7;
    gainNode.connect(audioContext.destination);
}

// Загрузка настроек из localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('soundWaveSettings');
    if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        settings = { ...settings, ...parsedSettings };
        updateUI();
    }
}

// Сохранение настроек в localStorage
function saveSettings() {
    localStorage.setItem('soundWaveSettings', JSON.stringify(settings));
}

// Обновление интерфейса
function updateUI() {
    frequencySlider.value = settings.frequency;
    frequencyValue.textContent = settings.frequency;
    durationSlider.value = settings.duration;
    durationValue.textContent = settings.duration;
    volumeSlider.value = settings.volume;
    volumeValue.textContent = settings.volume;
    soundOnlyCheckbox.checked = settings.soundOnly;
}

// Анимация загрузки
function animateLoading() {
    const buttons = document.querySelectorAll('button, input[type="range"]');
    buttons.forEach(button => {
        button.classList.add('button-loading');
    });

    setTimeout(() => {
        buttons.forEach(button => {
            button.classList.remove('button-loading');
        });
    }, 500);
}

// Инициализация
function init() {
    loadSettings();
    updateUI();
    initAudioContext();
    updateSliderValues();
    saveSettings();
    updateWaveCanvasVisibility();

    // Обработчики событий
    frequencySlider.addEventListener('input', () => {
        settings.frequency = frequencySlider.value;
        audioEffects.playWaveChange();
        updateSliderValues();
        saveSettings();
    });

    durationSlider.addEventListener('input', () => {
        settings.duration = durationSlider.value;
        audioEffects.playWaveChange();
        updateSliderValues();
        saveSettings();
    });

    volumeSlider.addEventListener('input', () => {
        settings.volume = volumeSlider.value;
        audioEffects.playWaveChange();
        updateSliderValues();
        saveSettings();
    });

    soundOnlyCheckbox.addEventListener('change', () => {
        settings.soundOnly = soundOnlyCheckbox.checked;
        audioEffects.playWaveChange();
        saveSettings();
        updateWaveCanvasVisibility();
    });

    playBtn.addEventListener('click', () => {
        audioEffects.playButtonClick();
        playSound();
    });

    stopBtn.addEventListener('click', () => {
        audioEffects.playButtonClick();
        stopSound();
    });

    // Горячие клавиши
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            resetSettings();
        } else if (e.key === '1') {
            settings.waveType = 'sine';
        } else if (e.key === '2') {
            settings.waveType = 'square';
        } else if (e.key === '3') {
            settings.waveType = 'triangle';
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            if (e.key === 'ArrowUp') {
                settings.frequency = Math.min(2000, settings.frequency + 50);
            } else if (e.key === 'ArrowDown') {
                settings.frequency = Math.max(20, settings.frequency - 50);
            }
            updateSliderValues();
            saveSettings();
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            if (e.key === 'ArrowUp') {
                settings.volume = Math.min(1, settings.volume + 0.05);
            } else if (e.key === 'ArrowDown') {
                settings.volume = Math.max(0, settings.volume - 0.05);
            }
            updateSliderValues();
            saveSettings();
        } else if ((e.altKey || e.metaKey) && e.key === 'S') {
            settings.soundOnly = !settings.soundOnly;
            saveSettings();
            updateWaveCanvasVisibility();
        }
    });
    hideLoading();
}

// Генерация звука
function playSound() {
    if (!audioContext) initAudioContext();
    
    if (oscillator) {
        oscillator.stop();
    }
    
    oscillator = audioContext.createOscillator();
    oscillator.type = settings.waveType;
    oscillator.frequency.setValueAtTime(settings.frequency, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.gain.value = settings.volume;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + settings.duration);
    
    if (!settings.soundOnly) {
        animateWave();
    }
}

// Остановка звука
function stopSound() {
    if (oscillator) {
        oscillator.stop();
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Анимация волны
function animateWave() {
    const now = audioContext.currentTime;
    const startTime = now;
    const duration = settings.duration;

    function renderWave(timestamp) {
        if (!settings.soundOnly) {
            ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
            const t = timestamp - startTime;
            const x = t / duration;
            const y = Math.sin(x * 2 * Math.PI * settings.frequency) * 50 + waveCanvas.height / 2;

            ctx.beginPath();
            ctx.moveTo(0, waveCanvas.height / 2);
            ctx.lineTo(waveCanvas.width, y);
            ctx.strokeStyle = 'rgb(100, 100, 255)';
            ctx.lineWidth = 2;
            ctx.stroke();

            animationId = requestAnimationFrame(renderWave);
        }
    }

    animationId = requestAnimationFrame(renderWave);
}

// Обновление значений слайдеров
function updateSliderValues() {
    frequencyValue.textContent = Math.round(settings.frequency);
    durationValue.textContent = settings.duration;
    volumeValue.textContent = settings.volume.toFixed(1);
}

// Инициализация
window.addEventListener('load', () => {
    animateLoading();
    init();
});