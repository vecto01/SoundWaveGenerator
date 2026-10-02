// Анимация загрузки
function animateLoading() {
    const loadingSpinner = document.getElementById('loading-spinner');
    const buttons = document.querySelectorAll('button, input[type="range"]');
    
    // Показываем спиннер
    loadingSpinner.classList.remove('hidden');
    document.body.classList.add('loading');
    
    // Отключаем кнопки Play/Stop
    playBtn.disabled = true;
    stopBtn.disabled = true;
    
    setTimeout(() => {
        // Скрываем спиннер
        loadingSpinner.classList.add('hidden');
        document.body.classList.remove('loading');
        
        // Включаем кнопки Play/Stop
        playBtn.disabled = false;
        stopBtn.disabled = false;
    }, 1000);
}

// Анимация загрузки
window.addEventListener('load', animateLoading);

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
    if (audioContext.state !== 'running') {
        audioContext.resume().catch(e => console.log('AudioContext resume error:', e));
    }
    // Оптимизация для Firefox
    if (audioContext instanceof AudioContext && 'mozEnableAutomaticBuffering' in audioContext) {
        audioContext.mozEnableAutomaticBuffering = false;
    }
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

// Обновление значений слайдеров
function updateSliderValues() {
    frequencyValue.textContent = frequencySlider.value;
    durationValue.textContent = durationSlider.value;
    volumeValue.textContent = volumeSlider.value;
}

// Инициализация
function init() {
    loadSettings();
    updateUI();
    setupEventListeners();
}

// Настройка слушателей событий
function setupEventListeners() {
    const hotkeysPanel = document.getElementById('hotkeys-panel');
    const closeHotkeysBtn = document.getElementById('close-hotkeys');
    
    function toggleHotkeysPanel() {
        hotkeysPanel.classList.toggle('active');
    }
    
    closeHotkeysBtn.addEventListener('click', toggleHotkeysPanel);
    
    const questionMarkBtn = document.createElement('button');
    questionMarkBtn.textContent = '?';
    questionMarkBtn.style.position = 'fixed';
    questionMarkBtn.style.bottom = '20px';
    questionMarkBtn.style.right = '20px';
    questionMarkBtn.style.width = '40px';
    questionMarkBtn.style.height = '40px';
    questionMarkBtn.style.borderRadius = '50%';
    questionMarkBtn.style.backgroundColor = 'var(--accent-color)';
    questionMarkBtn.style.color = 'white';
    questionMarkBtn.style.border = 'none';
    questionMarkBtn.style.cursor = 'pointer';
    questionMarkBtn.style.zIndex = '1000';
    questionMarkBtn.style.display = 'none';
    questionMarkBtn.addEventListener('click', toggleHotkeysPanel);
    document.body.appendChild(questionMarkBtn);
    
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', toggleHotkeysPanel);
    });
    
    frequencySlider.addEventListener('input', () => {
        settings.frequency = parseInt(frequencySlider.value);
        updateSliderValues();
        saveSettings();
    });
    
    durationSlider.addEventListener('input', () => {
        settings.duration = parseFloat(durationSlider.value);
        updateSliderValues();
        saveSettings();
    });
    
    volumeSlider.addEventListener('input', () => {
        settings.volume = parseFloat(volumeSlider.value);
        updateSliderValues();
        saveSettings();
    });
    
    soundOnlyCheckbox.addEventListener('change', () => {
        settings.soundOnly = soundOnlyCheckbox.checked;
        saveSettings();
        updateWaveCanvasVisibility();
    });
    
    playBtn.addEventListener('click', () => {
        playSound();
    });
    
    stopBtn.addEventListener('click', () => {
        stopSound();
    });
}

// Элементы для экспорта/импорта
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');

// Экспорт настроек в JSON
function exportSettings() {
    const settingsJson = JSON.stringify(settings, null, 2);
    const blob = new Blob([settingsJson], { type: 'application/json' }); 
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sound-wave-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Импорт настроек из JSON
function importSettings(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedSettings = JSON.parse(e.target.result);
            settings = { ...settings, ...importedSettings };
            saveSettings();
            updateUI();
            alert('Настройки успешно импортированы!');
        } catch (error) {
            alert('Ошибка импорта: некорректный JSON.');
        }
    };
    reader.readAsText(file);
}

// Настройка слушателей для кнопок экспорта/импорта
exportBtn.addEventListener('click', exportSettings);
importBtn.addEventListener('click', () => {
    importFile.click();
});
importFile.addEventListener('change', (e) => {
    if (e.target.files.length) {
        importSettings(e.target.files[0]);
    }
});

// Обновление видимости волнового канваса
function updateWaveCanvasVisibility() {
    waveCanvas.style.display = settings.soundOnly ? 'none' : 'block';
}

// Генерация звука
function playSound() {
    if (!audioContext) {
        initAudioContext();
    }
    
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();
    
    oscillator.type = settings.waveType;
    oscillator.frequency.value = settings.frequency;
    oscillator.frequency.exponentialRampingEnabled = true;
    
    gainNode.gain.value = settings.volume;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    
    const stopTime = audioContext.currentTime + settings.duration;
    oscillator.stop(stopTime);
    
    // Визуализация волны
    if (!settings.soundOnly) {
        visualizeWave();
    }
}

// Остановка звука
function stopSound() {
    if (audioContext && oscillator) {
        oscillator.stop();
        oscillator.disconnect();
    }
}

// Визуализация волны
function visualizeWave() {
    const width = waveCanvas.width;
    const height = waveCanvas.height;
    const scale = height / 2;
    const sampleRate = 44100;
    const duration = settings.duration;
    const samples = Math.min(1000, sampleRate * duration); // Ограничение количества точек для производительности
    
    // Кешируем вычисления для волны
    const cache = [];
    for (let i = 0; i < samples; i++) {
        const t = (i / samples) * duration;
        const x = (i / samples) * width;
        const y = Math.sin(2 * Math.PI * settings.frequency * t) * scale + height / 2;
        cache.push({ x, y });
    }
    
    // Очистка канваса
    ctx.clearRect(0, 0, width, height);
    
    // Рисуем волну
    ctx.strokeStyle = 'rgba(0, 160, 255, 1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Рисуем кешированные точки
    for (let i = 0; i < cache.length; i++) {
        const point = cache[i];
        if (i === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    }
    
    ctx.stroke();
    
    // Анимация волны с оптимизацией
    let startTime = null;
    
    function animateWave(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = elapsed / (settings.duration * 1000);
        
        if (progress < 1) {
            ctx.clearRect(0, 0, width, height);
            ctx.beginPath();
            
            // Используем кеш для анимации
            for (let i = 0; i < cache.length; i++) {
                const point = cache[i];
                const t = point.x / width + progress;
                const y = Math.sin(2 * Math.PI * settings.frequency * t) * scale + height / 2;
                
                if (i === 0) {
                    ctx.moveTo(point.x, y);
                } else {
                    ctx.lineTo(point.x, y);
                }
            }
            
            ctx.stroke();
            animationId = requestAnimationFrame(animateWave);
        } else {
            cancelAnimationFrame(animationId);
        }
    }
    
    animationId = requestAnimationFrame(animateWave);
}

// Обработка горячих клавиш
document.addEventListener('keydown', (e) => {
    // Сброс настроек
    if (e.key === 'Escape') {
        settings = { frequency: 440, duration: 2, volume: 0.7, soundOnly: false, waveType: 'sine' };
        saveSettings();
        updateUI();
        updateWaveCanvasVisibility();
    }
    // Изменение частоты
    else if (e.key === 'ArrowUp') {
        settings.frequency = Math.min(2000, settings.frequency + 10);
    }
    else if (e.key === 'ArrowDown') {
        settings.frequency = Math.max(50, settings.frequency - 10);
    }
    // Изменение громкости
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        if (e.key === 'ArrowUp') {
            settings.volume = Math.min(1, settings.volume + 0.05);
        } else if (e.key === 'ArrowDown') {
            settings.volume = Math.max(0, settings.volume - 0.05);
        }
    }
    // Изменение типа волны
    else if (e.key === '1') {
        settings.waveType = 'sine';
    }
    else if (e.key === '2') {
        settings.waveType = 'square';
    }
    else if (e.key === '3') {
        settings.waveType = 'triangle';
    }
    // Режим "Только звук"
    else if ((e.altKey || e.metaKey) && e.key === 'S') {
        settings.soundOnly = !settings.soundOnly;
    }
    updateSliderValues();
    saveSettings();
    updateWaveCanvasVisibility();
});

// Инициализация
init();