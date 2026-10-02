const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');

let frameCount = 0;
let lastTime = performance.now();

function measureFPS() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        console.log(`FPS: ${fps}`);
        frameCount = 0;
        lastTime = now;
    }
    requestAnimationFrame(measureFPS);
}

measureFPS();