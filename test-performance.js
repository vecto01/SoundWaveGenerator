const { performance } = require('perf_hooks');
const fetch = require('node-fetch');
const URL = 'http://localhost:3000';

// Измерение времени загрузки страницы
const startLoad = performance.now();
fetch(URL)
  .then(() => {
    const loadTime = performance.now() - startLoad;
    console.log(`Time to load page: ${loadTime.toFixed(2)} ms`);
  })
  .catch(err => {
    console.error('Error loading page:', err);
  });

// Измерение FPS анимации волн
const startAnimation = performance.now();
const interval = setInterval(() => {
  const currentTime = performance.now();
  const elapsed = currentTime - startAnimation;
  const fps = 1000 / elapsed;
  console.log(`Current FPS: ${fps.toFixed(2)}`);
}, 1000);

// Остановка измерений
setTimeout(() => {
  clearInterval(interval);
  console.log('Performance test completed.');
}, 5000);