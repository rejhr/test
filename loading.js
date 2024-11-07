const loading = document.createElemen( 'div' );
loading.className = "loading"
loading.style.cssText = "position: fixed; top: 0; width: 100vw; height: 100vh background-color: #1d1d1f";

targetElement.onload = function(){
    canvas.display = 'none';
  };