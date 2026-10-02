// audio-worker.js
// Обработка аудиосигналов в отдельном потоке для повышения производительности

const context = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = null;
let analyzer = null;
let dataArray = null;
let gainNode = null;
let filterNode = null;

// Канал связи с основным потоком
const channel = self;

// Инициализация
channel.onmessage = (e) => {
  const { type, data } = e.data;

  if (type === 'init') {
    initAudio(data.frequency, data.type);
  } else if (type === 'update') {
    updateAudio(data.frequency, data.type, data.amp);
  } else if (type === 'start') {
    startAudio();
  } else if (type === 'stop') {
    stopAudio();
  } else if (type === 'applyEffects') {
    applyEffects(data);
  }
};

// Инициализация аудио
function initAudio(frequency, type) {
  // Создание генератора звука
  oscillator = context.createOscillator();
  oscillator.type = type || 'sine';
  oscillator.frequency.value = frequency || 440;

  // Создание узла усиления
  gainNode = context.createGain();
  gainNode.gain.value = 0.5;

  // Создание анализатора для визуализации
  analyzer = context.createAnalyser();
  analyzer.fftSize = 256;

  // Создание фильтра
  filterNode = context.createBiquadFilter();
  filterNode.type = 'lowpass';
  filterNode.frequency.value = 2000;
  filterNode.Q.value = 1.0;

  // Подключение узлов
  oscillator.connect(gainNode);
  gainNode.connect(filterNode);
  filterNode.connect(analyzer);
  analyzer.connect(context.destination);

  // Инициализация массива для визуализации
  dataArray = new Uint8Array(analyzer.frequencyBinCount);
}

// Обновление параметров
function updateAudio(frequency, type, amp) {
  if (oscillator) {
    oscillator.type = type || 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = amp || 0.5;
  }
}

// Запуск аудио
function startAudio() {
  if (oscillator) {
    oscillator.start();
  }
}

// Остановка аудио
function stopAudio() {
  if (oscillator) {
    oscillator.stop();
  }
}

// Применение звуковых эффектов
function applyEffects(effects) {
  if (filterNode) {
    switch (effects.filterType) {
      case 'lowpass':
        filterNode.type = 'lowpass';
        filterNode.frequency.value = effects.filterFrequency;
        filterNode.Q.value = effects.filterQ;
        break;
      case 'highpass':
        filterNode.type = 'highpass';
        filterNode.frequency.value = effects.filterFrequency;
        filterNode.Q.value = effects.filterQ;
        break;
      case 'bandpass':
        filterNode.type = 'bandpass';
        filterNode.frequency.value = effects.filterFrequency;
        filterNode.Q.value = effects.filterQ;
        break;
      default:
        filterNode.type = 'none';
        break;
    }
  }
}

// Получение данных для визуализации
channel.onmessage = (e) => {
  if (e.data.type === 'getData') {
    analyzer.getByteFrequencyData(dataArray);
    channel.postMessage({ type: 'data', data: dataArray });
  }
};