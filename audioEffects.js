// audioEffects.js
class AudioEffects {
  constructor() {
    this.audioContext = null;
    this.gainNode = null;
    this.soundCache = {};
    this.isPlaying = false;
  }

  // Инициализация аудиоконтекста
  init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 0.1; // Уровень громкости
  }

  // Загрузка звуковых файлов
  async loadSound(url, key) {
    if (this.soundCache[key]) return this.soundCache[key];

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.soundCache[key] = audioBuffer;
      return audioBuffer;
    } catch (error) {
      console.error(`Ошибка загрузки звука ${url}:`, error);
      return null;
    }
  }

  // Воспроизведение звука
  playSound(key) {
    if (!this.audioContext || !this.soundCache[key]) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.soundCache[key];
    source.connect(this.gainNode);
    source.start();
  }

  // Звук при нажатии кнопки (например, "щелчок")
  playButtonClick() {
    this.playSound('button-click');
  }

  // Звук при изменении параметров волны (например, плавный "вздох")
  playWaveChange() {
    this.playSound('wave-change');
  }
}

// Экземпляр класса
const audioEffects = new AudioEffects();
audioEffects.init();