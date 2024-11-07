const loading = document.createElement( 'loading' );
loading.setPixelRatio( 1 );
loading.setSize( window.innerWidth, window.innerHeight );
loading.setClearColor( 0x1D1D1F );
document.body.appendChild( loading.domElement );

canvas.onload = function(){
    loading.display = 'none';
  }