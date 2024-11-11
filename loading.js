html.style.overflow = 'hidden';
let intro = this.document.querySelector('#intro');

window.addEventListener('load', function () {
  intro.classList.add('fadeOut', 'transition');
});