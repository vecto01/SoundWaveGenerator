const worker = new Worker('worker.js');

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('waveform');
    const ctx = canvas.getContext('2d');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    let animationId = null;
    let currentWaveType = 'sine';
    let frequency = 440;
    let amplitude = 0.5;
    let animationSpeed = 1;
    let waveColor = '#000000';
    const frequencySlider = document.getElementById('frequency');
    const amplitudeSlider = document.getElementById('amplitude');
    const frequencyValueSpan = document.getElementById('frequencyValue');
    const amplitudeValueSpan = document.getElementById('amplitudeValue');
    const waveTypeButtons = [
        document.getElementById('waveType1'),
        document.getElementById('waveType2'),
        document.getElementById('waveType3')
    ];

    // Set up UI controls
    frequencySlider.addEventListener('input', function() {
        frequency = parseInt(this.value);
        frequencyValueSpan.textContent = frequency;
    });
    
    amplitudeSlider.addEventListener('input', function() {
        amplitude = Math.min(parseFloat(this.value), 0.75); // Ограничение для Firefox/Safari
        amplitudeValueSpan.textContent = amplitude;
    });

    const animationSpeedSlider = document.getElementById('animation-speed');
    const animationSpeedValueSpan = document.getElementById('animation-speed-value');
    animationSpeedSlider.addEventListener('input', function() {
        animationSpeed = parseFloat(this.value);
        animationSpeedValueSpan.textContent = animationSpeed + 'x';
    });

    const waveColorPicker = document.getElementById('wave-color');
    waveColorPicker.addEventListener('input', function() {
        waveColor = this.value;
    });

    waveTypeButtons.forEach((button, index) => {
    

        button.addEventListener('click', function() {
            waveTypeButtons.forEach(btn => btn.style.backgroundColor = '');
            this.style.backgroundColor = '#4CAF50';
            currentWaveType = ['sine', 'square', 'triangle'][index];
        });
    });

    // Draw waveform
    function drawWaveform() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const t = Date.now() * 0.001 * animationSpeed;
        const xStep = canvas.width / 50;
        const yScale = canvas.height / 2;
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= 50; i++) {
            const x = i * xStep;
            let y = 0;
            switch (currentWaveType) {
                case 'sine': y = Math.sin(t * frequency * 2 * Math.PI) * amplitude; break;
                case 'square': y = Math.abs(Math.round(Math.sin(t * frequency * 2 * Math.PI))) * amplitude - 0.5; break;
                case 'triangle': y = (Math.sin(t * frequency * 2 * Math.PI) + Math.sin(t * frequency * 2 * Math.PI * 3)) / (2 * Math.PI) * amplitude; break;
            }
            ctx.lineTo(x, canvas.height / 2 + y * yScale);
        }
        ctx.stroke();
        animationId = requestAnimationFrame(drawWaveform);
    }

    // Play sound
    function playSound() {
        oscillator.type = currentWaveType;
        oscillator.frequency.value = frequency;
        oscillator.connect(gainNode);
        gainNode.gain.value = amplitude;
        gainNode.connect(audioContext.destination);
        oscillator.start();
    }

    // Reset settings
    function resetSettings() {
        frequency = 440;
        amplitude = 0.5;
        currentWaveType = 'sine';
        frequencySlider.value = frequency;
        amplitudeSlider.value = amplitude;
        frequencyValueSpan.textContent = frequency;
        amplitudeValueSpan.textContent = amplitude;
        waveTypeButtons[0].style.backgroundColor = '#4CAF50';
        waveTypeButtons.forEach((btn, index) => index !== 0 && (btn.style.backgroundColor = ''));
        oscillator.type = currentWaveType;
        oscillator.frequency.value = frequency;
        gainNode.gain.value = amplitude;
    }

    // Start drawing and playing
    drawWaveform();
    playSound();

    // Hotkeys
    document.addEventListener('keydown', function(e) {
        switch (e.key) {
            case 'ArrowUp':
                frequency += 10;
                frequencySlider.value = frequency;
                frequencyValueSpan.textContent = frequency;
                break;
            case 'ArrowDown':
                frequency -= 10;
                frequencySlider.value = frequency;
                frequencyValueSpan.textContent = frequency;
                break;
            case 'Control':
                // Handle Ctrl key press for amplitude changes
                e.key = 'CtrlPressed';
                break;
            case 'ArrowUp' && e.ctrlKey:
                amplitude = Math.min(amplitude + 0.1, 1);
                amplitudeSlider.value = amplitude;
                amplitudeValueSpan.textContent = amplitude;
                break;
            case 'ArrowDown' && e.ctrlKey:
                amplitude = Math.max(amplitude - 0.1, 0.1);
                amplitudeSlider.value = amplitude;
                amplitudeValueSpan.textContent = amplitude;
                break;
            case '1':
                currentWaveType = 'sine';
                waveTypeButtons.forEach(btn => btn.style.backgroundColor = '');
                waveTypeButtons[0].style.backgroundColor = '#4CAF50';
                oscillator.type = currentWaveType;
                break;
            case '2':
                currentWaveType = 'square';
                waveTypeButtons.forEach(btn => btn.style.backgroundColor = '');
                waveTypeButtons[1].style.backgroundColor = '#4CAF50';
                oscillator.type = currentWaveType;
                break;
            case '3':
                currentWaveType = 'triangle';
                waveTypeButtons.forEach(btn => btn.style.backgroundColor = '');
                waveTypeButtons[2].style.backgroundColor = '#4CAF50';
                oscillator.type = currentWaveType;
                break;
            case 'Escape':
                resetSettings();
                break;
        }
    });

    // Fix for Ctrl key handling
    let ctrlPressed = false;
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Control' || e.key === 'Meta') { // Поддержка Ctrl для Windows и Cmd для Mac
            ctrlPressed = true;
        }
    });
    document.addEventListener('keyup', function(e) {
        if (e.key === 'Control' || e.key === 'Meta') {
            ctrlPressed = false;
        }
    });

    // Проверка состояния audioContext перед изменением параметров
    function checkAudioContext() {
        if (audioContext.state !== 'running') {
            audioContext.resume();
        }
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp' && ctrlPressed) {
            checkAudioContext();
            amplitude = Math.min(amplitude + 0.1, 0.75); // Ограничение для Firefox/Safari
            amplitudeSlider.value = amplitude;
            amplitudeValueSpan.textContent = amplitude;
            gainNode.gain.value = amplitude;
        }
        if (e.key === 'ArrowDown' && ctrlPressed) {
            checkAudioContext();
            amplitude = Math.max(amplitude - 0.1, 0.1);
            amplitudeSlider.value = amplitude;
            amplitudeValueSpan.textContent = amplitude;
            gainNode.gain.value = amplitude;
        }
    });
});