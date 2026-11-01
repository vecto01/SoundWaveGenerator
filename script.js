// sound.js - основные функции для работы с аудио и эффектами

// Инициализация звуковых эффектов
const audioEffects = new AudioEffects(audioWorker);

document.addEventListener('DOMContentLoaded', () => {
    // Обработка переключателя реверба
    document.getElementById('reverb-toggle').addEventListener('change', (e) => {
        audioEffects.setReverb(e.target.checked);
    });
    
    // Обработка глубины реверба
    document.getElementById('reverb-depth').addEventListener('input', (e) => {
        const value = e.target.value;
        document.getElementById('reverb-depth-value').textContent = `${value}%`;
        audioEffects.setReverbDepth(value);
    });
    
    // Обработка типа фильтра
    document.getElementById('filter-selector').addEventListener('change', (e) => {
        const filterType = e.target.value;
        const frequency = document.getElementById('filter-frequency').value;
        const q = document.getElementById('filter-q').value;
        audioEffects.setFilter(filterType, frequency, q);
    });
    
    // Обработка частоты фильтра
    document.getElementById('filter-frequency').addEventListener('input', (e) => {
        const frequency = e.target.value;
        document.getElementById('filter-frequency-value').textContent = frequency;
        const filterType = document.getElementById('filter-selector').value;
        const q = document.getElementById('filter-q').value;
        audioEffects.setFilter(filterType, frequency, q);
    });
    
    // Обработка Q-фактора
    document.getElementById('filter-q').addEventListener('input', (e) => {
        const q = e.target.value;
        document.getElementById('filter-q-value').textContent = q;
        const filterType = document.getElementById('filter-selector').value;
        const frequency = document.getElementById('filter-frequency').value;
        audioEffects.setFilter(filterType, frequency, q);
    });
});

// Экспорт класса AudioEffects для использования в других скриптах
window.audioEffects = audioEffects;