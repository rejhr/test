import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { LuminosityHighPassShader } from "three/addons/shaders/LuminosityHighPassShader.js";
import { CopyShader } from "three/addons/shaders/CopyShader.js";
import { Group } from "https://cdn.jsdelivr.net/npm/three@0.169.0/src/objects/Group.js";



// ============ Renderer ============
const renderer = new THREE.WebGLRenderer({
  alpha: true, // 투명 활성화
  precision: "highp"
});
document.body.appendChild( renderer.domElement ); // html 요소 생성
renderer.setPixelRatio( 1 );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.autoClear = false;
renderer.setClearColor( 0x000000, 0 ); // 배경색, 불투명도



// ============ Scene ============
const scene = new THREE.Scene();



// ============ Camera ============
const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight);
camera.position.z = 0.5;
camera.lookAt(0, 0, 0);



// ============ Lights ============
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5);
directionalLight.position.set(0,0.2,0.4);
directionalLight.lookAt(0, 0, 0);

scene.add(directionalLight);



// ============ Maps ============
const hdrEquirect = new RGBELoader().load(
  "./threejs/royal_esplanade_1k_1.hdr",
  () => {
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdrEquirect;
    hdrEquirect.encoding = THREE.sRGBEncoding;
  }
);

const cubeMap = new THREE.CubeTextureLoader().load([
    './threejs/glass_map.png', // 오른쪽(px)
    './threejs/glass_map.png', // 왼쪽(nx)
    './threejs/glass_map.png', // 위(py)
    './threejs/glass_map.png', // 아래(ny)
    './threejs/glass_map.png', // 앞(pz)
    './threejs/glass_map.png'  // 뒤(nz)
]);



// ============ Meshes ============
const reconers = new THREE.Group(); // mesh 그룹 생성

new GLTFLoader().load("./threejs/reconers.glb", (gltf) => {
  const model = gltf.scene; // 3D 파일에서 Scene 전체 로드

  model.traverse((child) => {
      if (child.isMesh) {
        const geometry = child.geometry.clone(); // 3D 파일에서 geometry를 복제

        // 앞면 반사 Material
        const materialReflect = new THREE.MeshPhysicalMaterial({
          blending: THREE.AdditiveBlending,
          // blending: THREE.NormalBlending,
          side: THREE.DoubleSide,
          // color: 0x0B6FE8, // 색상
          color: 0x100D59, // 색상
          transmission: 1, // 투과성
          reflectivity: 0.4, // 반사
          metalness: 0.1, // 금속질
          roughness: 0.05, // 표면 거칠기
          ior: 2, // 굴절률
          iridescence: 1, // 표면 RGB 왜곡
          // clearcoat: 1, // 매끈한 광택 표면 두께감
          // clearcoatRoughness: 0.05, // 광택 표면 거칠기
          // specularColor: 0x0B6FE8, // 반사광 색상
          // specularIntensity: 1, // 반사광 적용값
          // sheen: 1, // 미광 광택 적용값
          // sheenRoughness: 0.2, // 미광 표면 거칠기
          // sheenColor: 0x0B6FE8, // 미광 색상
          envMap: cubeMap,  // 환경맵
          envMapIntensity: 0.5, // 환경맵 적용값
          // alphaToCoverage: true,
        }); 

        // 뒷면 내부 입체감
        const materialNormal = new THREE.MeshPhysicalMaterial({
          blending: THREE.NormalBlending,
          color: 0x0B6FE8, // 색상
          transmission: 1, // 투과성
          reflectivity: 1, // 반사
          metalness: 1, // 금속질
          roughness: 1, // 표면 거칠기
          ior: 1.5, // 굴절률
          iridescence: 1, // 표면 RGB 왜곡
          // clearcoat: 1, // 매끈한 광택 표면 두께감
          // clearcoatRoughness: 0.1, // 광택 표면 거칠기
          // specularColor: 0xffffff, // 반사광 색상
          // specularIntensity: 1, // 반사광 적용값
          // sheen: 1, // 미광 광택 적용값
          // sheenRoughness: 0.5, // 미광 표면 거칠기
          // sheenColor: 0x0B6FE8, // 미광 색상
          // envMap: hdrEquirect,  // 환경맵
          envMapIntensity: 1, // 환경맵 적용값
          // alphaToCoverage: true,
        });
        
        // Mesh 생성
        const meshReflect = new THREE.Mesh(geometry, materialReflect);
        const meshNormal = new THREE.Mesh(geometry, materialNormal);

        meshReflect.scale.set(0.1, 0.22, 0.1);
        meshNormal.scale.set(0.1, 0.22, 0.1);
        
        reconers.add(meshReflect);
        reconers.add(meshNormal);
        reconers.position.set(0, 0.01, 0);
      }
    });
  });
  scene.add(reconers);
  


  // ============ Post-processing ============
  const options = {
    bloomThreshold: 0.85,
    bloomStrength: 0.3,
    bloomRadius: 0.4,
  };
  const renderPass = new RenderPass( scene, camera );
  renderPass.clearColor = new THREE.Color( 0x000000, 0 );
  renderPass.autoClear = false;
  
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2( window.innerWidth, window.innerHeight ),
    options.bloomStrength,
    options.bloomRadius,
    options.bloomThreshold
  );
  bloomPass.renderToScreen = false;

  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.addPass(renderPass);
  bloomComposer.addPass(bloomPass);
  bloomComposer.renderToScreen = false; // 최종 화면에 직접 출력하지 않음
  
  const darkComposer = new EffectComposer(renderer);
  darkComposer.addPass(renderPass);
  darkComposer.renderToScreen = false; // 최종 화면에 직접 출력하지 않음
  
  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture }
      },
      vertexShader: document.getElementById("vertexshader").textContent,
      fragmentShader: document.getElementById("fragmentshader").textContent,
      defines: {}
    }),
    "baseTexture"
  );
  finalPass.needsSwap = true;
  
  const finalComposer = new EffectComposer(renderer); 
  finalComposer.addPass(finalPass);
  finalComposer.renderToScreen = true;  // 최종 컴포저에서만 화면에 렌더링
  

// ============ Animate ============
let originRotation = { x: -Math.PI / 2, y: 0, z: 0 }; // 초기값
let targetRotation = { x: -Math.PI / 2, y: 0, z: 0 }; // 도형 각도 

// 회전 각도 제한
let rotationLimits = {
x: { min: -Math.PI / 16, max: Math.PI / 16 },
y: { min: -Math.PI / 16, max: Math.PI / 16 }, 
z: { min: -Math.PI / 16, max: Math.PI / 16 }, 
};

const onMouseMove = function (event) {
  // 도형의 중앙을 기준으로 마우스 위치를 감지
  const mouseX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2); // [-1, 1] 범위로 변환
  const mouseY = -(event.clientY - window.innerHeight / 2) / (window.innerHeight / 2); // [-1, 1] 범위로 변환
  // 마우스 위치에 따라 목표 회전 각도를 계산
  targetRotation.x = originRotation.x + (-mouseY * rotationLimits.x.max);
  targetRotation.y = originRotation.y + ((mouseX * rotationLimits.y.max) / 2);
  targetRotation.z = originRotation.z + (mouseX * rotationLimits.y.max);
};
  

const onMouseOut = function (event) {
// 마우스가 창 밖으로 나갈 때만 실행
if (!event.relatedTarget && !event.toElement) {
  gsap.to(targetRotation, {
    duration: 0.3,
    x: originRotation.x,
    y: originRotation.y,
    z: originRotation.z,
    ease: "power1.out" // easing 옵션
  });
}
};

// 마우스 이벤트 리스너 등록
window.addEventListener("mousemove", onMouseMove, false);
window.addEventListener("mouseout", onMouseOut, false);

// 창 크기 변경 시 리사이즈 처리
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}); 

function animate() {
  requestAnimationFrame(animate);

  gsap.to(reconers.rotation, {
    duration: 0.3,
    x: targetRotation.x,
    y: targetRotation.y,
    z: targetRotation.z,
    ease: "power1.out" // easing 옵션
  });

  let BLOOM_SCENE = 1; // Bloom 효과가 적용될 레이어 설정
    
  function setBloomLayer(Group) {
    Group.traverse((child) => {
      if (child.isMesh) {
        child.layers.enable(BLOOM_SCENE);
      }
    });
  };
  
  // Bloom 레이어 설정
  setBloomLayer(reconers);
   
  renderer.clear();
  
  // 레이어별로 렌더링
  camera.layers.set(0);
  darkComposer.render();
  
  camera.layers.set(BLOOM_SCENE);
  renderer.clearDepth();  // Bloom 레이어의 Z-buffer만 지우기
  bloomComposer.render();
  
  finalComposer.render(); // 최종 화면 렌더링
}

animate();
  
  