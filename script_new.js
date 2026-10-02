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

// AudioContext для генерации звука
let audioContext;
let oscillator;
let gainNode;
let animationId;

// Проверка поддержки AudioWorklet
function initAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
        updateSliderValues();
        saveSettings();
    });
    
    durationSlider.addEventListener('input', () => {
        settings.duration = durationSlider.value;
        updateSliderValues();
        saveSettings();
    });
    
    volumeSlider.addEventListener('input', () => {
        settings.volume = volumeSlider.value;
        updateSliderValues();
        saveSettings();
    });
    
    soundOnlyCheckbox.addEventListener('change', () => {
        settings.soundOnly = soundOnlyCheckbox.checked;
        saveSettings();
        updateWaveCanvasVisibility();
    });
    
    playBtn.addEventListener('click', playSound);
    stopBtn.addEventListener('click', stopSound);
    
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
}

// Инициализация
window.addEventListener('load', () => {
    animateLoading();
    init();
});