document.addEventListener('DOMContentLoaded', function() {
    // Мониторинг пропусков кадров для анимации волны
    function monitorAnimationFrame() {
        const startTime = performance.now();
        const frameDuration = 16; // ms (1/60 fps)
        let frameCount = 0;
        
        function checkFrameRate() {
            const endTime = performance.now();
            const frameTime = endTime - startTime;
            
            if (frameTime > frameDuration * 1.5) { // Превышение допустимого времени
                console.warn(`Пропуск кадра: ${frameTime}ms > ${frameDuration * 1.5}ms`);
            }
            frameCount++;
            if (frameCount % 10 === 0) {
                console.log(`Среднее время кадра: ${(performance.now() - startTime) / frameCount}ms`);
            }
            requestAnimationFrame(checkFrameRate);
        }
        
        requestAnimationFrame(checkFrameRate);
    }

    // Инициализация интерфейса
    const frequencySlider = document.getElementById('frequency');
    const amplitudeSlider = document.getElementById('amplitude');
    const waveCanvas = document.getElementById('wave-canvas');
    const playButton = document.getElementById('play-btn');
    const stopButton = document.getElementById('stop-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const themeSelector = document.getElementById('theme-selector');

    // Показать загрузку
    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    // Скрыть загрузку
    function hideLoading() {
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 500);
    }

    // Применить тему
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    }

    // Обновление отображения значений
    function updateDisplay() {
        document.getElementById('frequency-value').textContent = frequencySlider.value;
        document.getElementById('amplitude-value').textContent = amplitudeSlider.value;
    }

    // Добавить ARIA-атрибуты для слайдеров
    function addARIAlabels() {
        frequencySlider.setAttribute('aria-label', 'Frequency slider');
        amplitudeSlider.setAttribute('aria-label', 'Amplitude slider');
        document.getElementById('reverb-depth').setAttribute('aria-label', 'Reverb depth slider');
    }

    // Инициализация
    function init() {
        // Применить текущий режим
        applyTheme(themeSelector.value);
        updateDisplay();

        // Показать загрузку
        showLoading();

        // Запуск анимации волны после загрузки
        setTimeout(() => {
            hideLoading();
        }, 500);

        // Добавить ARIA-атрибуты
        addARIAlabels();
    }

    // Остальной код (кнопки и звук)
    init();
})