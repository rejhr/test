document.body.style.overflow = 'hidden';

const intro = this.document.querySelector('#intro');

window.onload = function () {
  intro.classList.add('fadeOut', 'trasition');
  document.body.style.overflow = 'unset';

  if(intro.style.display = 'none'){
    const GNB = document.querySelector('.GNB');
    GNB.classList.add('fadeIn', 'trasition');
  
    const fotter = document.querySelector('footer');
    fotter.classList.add('fadeIn', 'trasition');
  
    const three = document.querySelector('#three');
    three.classList.add('scaleUp');
  
    const bgText = document.getElementsByClassName('.bgText');
    const bgTextP = bgText.querySelectorAll('p');
    bgTextP.forEach(function(p) {
      p.classList.add('slideUp', 'trasition', 'durationXL');
    });
    
    const displayText = document.querySelector('.displayText');
    displayText.classList.add('slideRignt', 'trasition', 'delayXL');
  
    const quickMenu = document.querySelector('.quickMenu');
    quickMenu.classList.add('slideLeft','trasition','delayXL');
  }
};


 