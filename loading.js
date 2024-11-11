document.body.style.overflow = 'hidden';

let intro = this.document.querySelector('#intro');

window.onload = function () {
  intro.classList.add('fadeOut', 'trasition', 'durationL');
  document.body.style.overflow = 'unset';
  
  let three = document.querySelector('#three');
  three.classList.add('scaleUp');
};