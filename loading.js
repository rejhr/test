const loading = document.body.appendChild( loading.domElement );
renderer.setAttribute( 'id', 'loading' );
renderer.className.add( "loading" );
loading.setPixelRatio( 1 );
loading.setSize( window.innerWidth, window.innerHeight );
loading.setClearColor( 0x1D1D1F );
document.body.appendChild( loading.domElement );

const targetElement = document.querySelector('3D');

targetElement.onload = function(){
    loading.display = 'none';
  }