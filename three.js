import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
// import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { LuminosityHighPassShader } from "three/addons/shaders/LuminosityHighPassShader.js";
import { CopyShader } from "three/addons/shaders/CopyShader.js";
import { Group } from "https://cdn.jsdelivr.net/npm/three@0.169.0/src/objects/Group.js";
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ============Renderer============
const renderer = new THREE.WebGLRenderer({ 
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.outputEncoding = THREE.sRGBEncoding; // sRGB 설정
renderer.toneMapping = THREE.ACESFilmicToneMapping; // 톤 설정
// renderer.toneMappingExposure = 1; // 노출 설정
renderer.setClearColor( 0x000000, 0 ); // 배경색, 불투명도

// ============Scene============
const scene = new THREE.Scene();

// ============Camera============
const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight);
camera.position.z = 1;
camera.lookAt(0, 0, 0);

// ============후처리 효과 설정============
const options = {
  bloomThreshold: 0.85,
  bloomStrength: 0.08,
  bloomRadius: 0.05,
};
const renderPass = new RenderPass(scene, camera); 
renderPass.clear = false;
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  options.bloomStrength,
  options.bloomRadius,
  options.bloomThreshold
);

const composer = new EffectComposer(renderer); // 후처리 효과를 위한 composer
composer.addPass(renderPass);
composer.addPass(bloomPass);

// ============조명 설정============
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(0.2, 0.2, 0.2);

scene.add(directionalLight);

// ============맵 설정============
const hdrEquirect = new RGBELoader().load(
  "./threejs/royal_esplanade_1k_1.hdr",
  () => {
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
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

// ============ CSS Backgound ============

// var cssElement = createCSS3DObjdct()


// ============ Meshes ============
// GLTF Mesh
new GLTFLoader().load("./threejs/reconers_v29.glb", (gltf) => {
  const model = gltf.scene; // 3D 파일에서 Scene 전체 로드

  // Mesh 정의
  model.traverse((child) => {
      if (child.isMesh) {
        const geometry = child.geometry.clone(); // 3D 파일에서 geometry를 복제

        // 내부 입체감
        const materialNormal = new THREE.MeshPhysicalMaterial({
          side: THREE.FrontSide,
          blending: THREE.NormalBlending,
          // blending: THREE.MultiplyBlending,
          // blending: THREE.AdditiveBlending,
          // transmission: 1, // 투과성
          // opacity: 0.8, // 불투명도
          color: 0x0B6FE8, // 색상
          reflectivity: 0.4, // 반사도
          roughness: 0.1, // 표면 거칠기
          metalness: 0.5, // 금속성
          thickness: 1, // 왜곡 두께감
          ior: 1.5, // 굴절률
          iridescence: 1, // 표면 RGB 왜곡
          envMap: hdrEquirect,  // 환경맵
          envMapIntensity: 1.5, // 환경맵 적용값
          clearcoat: 1, // 매끈한 광택 표면 두께감
          clearcoatRoughness: 0.1, // 광택 표면 거칠기
          specularColor: 0x0B6FE8, // 반사광 색상
          specularIntensity: 1, // 반사광 적용값
          sheen: 1, // 미광 광택 적용값
          sheenRoughness: 0.5, // 미광 표면 거칠기
          sheenColor: 0x0B6FE8, // 미광 색상
          alphaToCoverage: true,
        });
        
        // 반사 Material
        const materialReflect = new THREE.MeshPhysicalMaterial({
          blending: THREE.NormalBlending,
          side: THREE.BackSide,
          opacity: 0.8, // 불투명도
          reflectivity: 0.4, // 반사
          transmission: 1, // 투명도
          metalness: 0.04, // 금속질
          roughness: 0.1, // 표면 거칠기
          ior: 2, // 굴절률
          clearcoat: 1, // 매끈한 광택 표면 두께감
          clearcoatRoughness: 0.1, // 광택 표면 거칠기
          specularColor: 0x0B6FE8, // 반사광 색상
          specularIntensity: 1, // 반사광 적용값
          sheen: 1, // 미광 광택 적용값
          sheenRoughness: 0.5, // 미광 표면 거칠기
          sheenColor: 0x0B6FE8, // 미광 색상
          envMap: cubeMap,  // 환경맵
          envMapIntensity: 1.5, // 환경맵 적용값
          alphaToCoverage: true,

        }); 
        
        // Mesh 생성
        const reflectMesh = new THREE.Mesh(geometry, materialReflect);
        const normalMesh = new THREE.Mesh(geometry, materialNormal);

        reflectMesh.scale.set(0.2, 0.2, 0.4);
        normalMesh.scale.set(0.2, 0.2, 0.4);
        
        const reconers = new THREE.Group();
        reconers.add(reflectMesh);
        reconers.add(normalMesh);
        reconers.position.set(0, 0, 0);

        // 씬에 그룹 추가
        scene.add(reconers);
        window.reconers = reconers;
      }
    });
  });



// ============ 애니메이션 ============

let originRotation = { x: Math.PI / 2, y: 0, z: 0 }; // 초기값
let targetRotation = { x: Math.PI / 2, y: 0, z: 0 }; // 도형 각도 

// 회전 각도 제한
let rotationLimits = {
x: { min: -Math.PI / 16, max: Math.PI / 16 },
y: { min: -Math.PI / 16, max: Math.PI / 16 }, 
};

const onMouseMove = function (event) {
// 도형의 중앙을 기준으로 마우스 위치를 감지
const mouseX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2); // [-1, 1] 범위로 변환
const mouseY = -(event.clientY - window.innerHeight / 2) / (window.innerHeight / 2); // [-1, 1] 범위로 변환
// 마우스 위치에 따라 목표 회전 각도를 계산
targetRotation.x = originRotation.x + (-mouseY * rotationLimits.x.max); // X축 회전 (위/아래)
targetRotation.y = originRotation.y + (mouseX * rotationLimits.y.max); // Y축 회전 (좌/우), 반대 방향으로 회전
// 회전 제한 적용
applyRotationLimits();
};

const onMouseOut = function (event) {
// 마우스가 창 밖으로 나갈 때만 실행
if (!event.relatedTarget && !event.toElement) {
  targetRotation.x = originRotation.x;
  targetRotation.y = originRotation.y;
}
};

const applyRotationLimits = () => {
// X축 회전 제한
window.reconers.rotation.x = Math.max(
  rotationLimits.x.min,
  Math.min(rotationLimits.x.max, targetRotation.x)
);
// Z축 회전 제한
window.reconers.rotation.y = Math.max(
  rotationLimits.y.min,
  Math.min(rotationLimits.y.max, targetRotation.y)
);
};

// 마우스 이벤트 리스너 등록
window.addEventListener("mousemove", onMouseMove, false);
window.addEventListener("mouseout", onMouseOut, false);

function animate() {
  requestAnimationFrame(animate);
  
  // 도형이 항상 마우스를 바라보도록 설정
  window.reconers.rotation.x = targetRotation.x;
  window.reconers.rotation.y = targetRotation.y;
  
  // 창 크기 변경 시 리사이즈 처리
  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }); 
    
  // composer.render(); // 후처리 효과 렌더링
  renderer.render( scene, camera );
}

animate();
