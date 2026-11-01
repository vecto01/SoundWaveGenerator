document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Анимация с пропусками кадров
    let frameCount = 0;
    const startTime = performance.now();
    
    function draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 800, 400);
        
        // Имитация пропуска кадра
        if (frameCount % 10 === 0) {
            console.log(`Пропуск кадра: ${performance.now() - startTime}ms`);
        }
        
        frameCount++;
        requestAnimationFrame(draw);
    }
    
    document.body.appendChild(canvas);
    draw();
})