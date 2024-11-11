document.body.style.overflow = 'hidden';

let intro = this.document.querySelector('#intro');

window.onload = function () {
  intro.classList.add('fadeOut', 'transition');
  document.body.style.overflow = 'unset';
};