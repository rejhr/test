document.body.style.overflow = 'hidden';

const intro = this.document.querySelector('#intro');

setTimeout(() => {
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
    
      const bgText = document.querySelector('.bgText');
      const bgTextP = bgText.querySelectorAll('.word');
      bgTextP.forEach(function(p) {
        p.classList.add('slideUp', 'trasition', 'durationXL');
      });
      
      const displayText = document.querySelector('.displayText');
      displayText.classList.add('slideRignt', 'trasition', 'delayXL');
    
      const quickMenu = document.querySelector('.quickMenu');
      quickMenu.classList.add('slideLeft','trasition','delayXL');
    }
  };
}, 3000);



 