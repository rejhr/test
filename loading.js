document.body.style.overflow = 'hidden';

const intro = this.document.querySelector('#intro');

window.onload = function () {
      intro.classList.add('IntrofadeOut', 'trasition');
      document.body.style.overflow = 'unset';
  };


function animation() {
  const introOpacity = getComputedStyle(intro).opacity;
  console.log(introOpacity);

  if( introOpacity < '0.9' ) {

      const GNB = document.querySelector('.GNB');
      GNB.classList.add('fadeIn', 'trasition');
      
      const footer = document.querySelector('footer');
      footer.classList.add('fadeIn', 'trasition');
      
      const three = document.querySelector('#three');
      three.classList.add('scaleUp', 'durationL');
      
      const bgText = document.querySelector('.bgText');
      const bgTextP = bgText.querySelectorAll('.word');
      bgTextP.forEach(function(p) {
        p.classList.add('slideUp', 'trasition', 'durationXL');
      });
      
      const displayText = document.querySelector('.displayText');
      displayText.classList.add('slideRight', 'trasition', 'delayXL');
      
      const quickMenu = document.querySelector('.quickMenu');
      quickMenu.classList.add('slideLeft','trasition','delayXL');

  } if(introOpacity == '0') {
    intro.style.display = 'none';
  } else {
    requestAnimationFrame(animation);
  } 
};

animation();
  
  
 