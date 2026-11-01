const context = new (window.AudioContext || window.webkitAudioContext)();

// Функция для создания эффектов
function createEffectsChain() {
    const reverbNode = context.createConvolver();
    const filterNode = context.createBiquadFilter();
    const gainNode = context.createGain();
    
    // Загрузка импульсного отклика для реверба
    fetch('https://storage.googleapis.com/howlerjs/impulseResponses/largeHall.wav').then(response => {
        return response.arrayBuffer();
    }).then(arrayBuffer => {
        context.decodeAudioData(arrayBuffer).then(audioBuffer => {
            reverbNode.buffer = audioBuffer;
            reverbNode.connect(gainNode);
        });
    });
    
    return {
        reverbNode,
        filterNode,
        gainNode
    };
}

// Создаём цепочку эффектов
const effects = createEffectsChain();

self.onmessage = function(e) {
    const { frequency, duration, sampleRate, applyEffects, reverb, reverbDepth, filterType, filterFrequency, filterQ } = e.data;
    const oscillator = context.createOscillator();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    // Настройка цепочки эффектов
    oscillator.connect(effects.gainNode);
    effects.gainNode.connect(effects.filterNode);
    effects.filterNode.connect(effects.reverbNode);
    effects.reverbNode.connect(context.destination);
    
    // Применение эффектов
    if (applyEffects) {
        effects.gainNode.gain.value = reverb ? 0.7 : 0.5;
        effects.reverbNode.drywet.value = reverb ? reverbDepth / 100 : 0;
        
        if (filterType !== 'none') {
            effects.filterNode.type = filterType;
            effects.filterNode.frequency.value = filterFrequency;
            effects.filterNode.Q.value = filterQ;
        }
    }
    
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
    
    self.postMessage({
        type: 'soundGenerated',
        data: context.currentTime
    });
};