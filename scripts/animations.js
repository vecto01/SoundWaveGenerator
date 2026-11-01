// animations.js
// Глобальные функции для анимаций интерфейса

defineFadeIn = function(element, duration = 300) {
  element.style.opacity = '0';
  element.style.transition = `opacity ${duration}ms ease-in-out`;
  setTimeout(() => {
    element.style.opacity = '1';
  }, 0);
}

defineSlideUp = function(element, duration = 500) {
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
  setTimeout(() => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, 0);
}

defineLoadingAnimation = function(loaderElement, duration = 800) {
  loaderElement.style.opacity = '0';
  loaderElement.style.transform = 'rotate(0deg)';
  loaderElement.style.transition = `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`;
  
  setTimeout(() => {
    loaderElement.style.opacity = '1';
    loaderElement.style.transform = 'rotate(360deg)';
  }, 0);
}