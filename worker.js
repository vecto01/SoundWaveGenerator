const context = new (window.AudioContext || window.webkitAudioContext)();

self.onmessage = function(e) {
    const { frequency, duration, sampleRate } = e.data;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.5;
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
    
    self.postMessage({
        type: 'soundGenerated',
        data: context.currentTime
    });
};