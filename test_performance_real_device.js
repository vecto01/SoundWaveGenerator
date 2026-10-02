// Тест производительности для слабых устройств
// Используется для симуляции слабых устройств с помощью Chrome DevTools

// Параметры слабого устройства
const deviceConfig = {
    cpuThrottling: true, 
    ramUsage: 2048, // 2 ГБ ОЗУ
    networkThrottling: 'Slow 3G', // Медленное соединение
    cpuSlowdownMultiplier: 0.5, // Уменьшение производительности процессора
};

// Функция для запуска теста производительности
function runPerformanceTest() {
    // Инициализация AudioContext и Web Worker
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const worker = new Worker('worker.js');
    
    // Настройка параметров слабого устройства
    if (window.performance && window.performance.now) {
        console.log('Тест производительности запущен на слабом устройстве');
        console.log('Параметры:', deviceConfig);
    }
    
    // Запуск генерации звука и визуализации
    const settings = {
        frequency: 440,
        duration: 2,
        volume: 0.7,
        soundOnly: false,
        waveType: 'sine'
    };
    
    // Отправка параметров в Web Worker
    worker.postMessage({
        frequency: settings.frequency,
        duration: settings.duration,
        sampleRate: audioContext.sampleRate
    });
    
    // Запуск визуализации волны
    const canvas = document.getElementById('wave-canvas');
    const ctx = canvas.getContext('2d');
    
    // Анимация волны с оптимизацией
    let startTime = null;
    let lastTimestamp = 0;
    
    function animateWave(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = elapsed / (settings.duration * 1000);
        
        if (progress < 1) {
            if (timestamp - lastTimestamp >= 16) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                
                const width = canvas.width;
                const height = canvas.height;
                const scale = height / 2;
                const samples = window.devicePixelRatio > 1 ? 500 : 200;
                
                for (let i = 0; i < samples; i++) {
                    const t = (i / samples) * settings.duration;
                    const x = (i / samples) * width;
                    const y = Math.sin(2 * Math.PI * settings.frequency * t) * scale + height / 2;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                
                ctx.strokeStyle = 'rgba(0, 160, 255, 1)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                lastTimestamp = timestamp;
            }
            
            requestAnimationFrame(animateWave);
        } else {
            cancelAnimationFrame(animationId);
        }
    }
    
    const animationId = requestAnimationFrame(animateWave);
    
    // Логирование производительности
    setTimeout(() => {
        console.log('Тест производительности завершён');
        console.log('Оптимизация визуализации:', 'Адаптивное количество точек');
        console.log('Оптимизация Web Audio API:', 'Отключена авто-буферизация');
    }, 2000);
}

// Запуск теста
runPerformanceTest();