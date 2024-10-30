import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
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
});
renderer.setSize(window.innerWidth, window.innerHeight,1,2000);
document.body.appendChild(renderer.domElement);

renderer.outputEncoding = THREE.sRGBEncoding; // sRGB 설정
renderer.toneMapping = THREE.ACESFilmicToneMapping; // 톤 설정
renderer.toneMappingExposure = 1.1; // 노출 설정
renderer.setClearColor( 0x00ff00, 1);

// ============Scene============
const scene = new THREE.Scene();

// ============Camera============
const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight);
camera.position.z = 5;
camera.lookAt(0, 0, 0);

// ============후처리 효과 설정============
const options = {
  bloomThreshold: 0.95,
  bloomStrength: 0.18,
  bloomRadius: 0.1,
};
const renderPass = new RenderPass(scene, camera); 
// renderPass.clear=false;
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

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
directionalLight.position.set(0.5, 0.5, 0.3);

scene.add(directionalLight);

// ============맵 설정============
const hdrEquirect = new RGBELoader().load(
  "./threejs/royal_esplanade_1k.hdr",
  () => {
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
    // scene.environment = hdrEquirect;
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

// ============ Backgound ============
      
// css 요소 가져오기
const cssElement = document.getElementById("visual");

console.log(cssElement);

let bgPlane;

// css 요소를 canvas mesh로 변환
function updateBg() {
  html2canvas(cssElement).then(canvas => {
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    if (bgPlane) {
      bgPlane.material.map = texture;
      bgPlane.material.needsUpdate = true;
      bgPlane.geometry.dispose();
      bgPlane.geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    } else {
      const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true, 
      });
      bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth, window.innerHeight), material);
      bgPlane.position.set(0, 0, 0.5);  // Position the plane to fit the screen view
      scene.add(bgPlane);
    }
  });
};

console.log(bgPlane);


// ============Meshes============
// GLTF 로드
new GLTFLoader().load("./threejs/reconers_logoLow_test.glb", (gltf) => {
  const model = gltf.scene;
  model.background = null;

  // 3D 모델의 앞면/뒷면을 각각 렌더하고 그룹으로 합침
  model.traverse((child) => {
      if (child.isMesh) {
        const geometry = child.geometry.clone();  // geometry 클론

        // 뒷면 반사 Material
        const materialNormal = new THREE.MeshPhysicalMaterial({
          side: THREE.BackSide,
          color: 0x0B6FE8, // 색상
          transmission: 1, // 투명도
          reflectivity: 0.8, // 반사
          roughness: 0, // 표면 거칠기
          metalness: 0.04, // 금속질
          thickness: 1, // 왜곡 두께감
          ior: 1.5, // 굴절률
          iridescence: 0.5, // 표면 RGB 왜곡
          envMap: hdrEquirect,  // 환경맵
          envMapIntensity: 1.5, // 환경맵 적용값
          clearcoat: 1, // 매끈한 광택 표면 두께감
          clearcoatRoughness: 0.1, // 광택 표면 거칠기
          specularColor: 0x0B6FE8, // 반사광 색상
          specularIntensity: 1, // 반사광 적용값
          sheen: 1, // 미광 광택 적용값
          sheenRoughness: 0.8, // 미광 표면 거칠기
          sheenColor: 0x0B6FE8, // 미광 색상
        });
        
        // 앞면 Material
        const materialReflect = new THREE.MeshPhysicalMaterial({
          blending: THREE.MultiplyBlending,
          // blending: THREE.NormalBlending,
          // blending: THREE.AdditiveBlending,
          // opacity: 0.5,
          reflectivity: 1, // 반사
          transmission: 1, // 투명도
          metalness: 0.8, // 금속질
          roughness: 0, // 표면 거칠기
          ior: 2, // 굴절률
          envMap: cubeMap,  // 환경맵
          envMapIntensity: 0.2, // 환경맵 적용값
        });

        // // stencil Material
        // let stencilRef = 1;
        // const MaterialStencil = new THREE.MeshPonglMaterial({
        //   depthWrite: false,
        //   stencilWrite: true,
        //   stencilRef: stencilRef,
        //   stencilFunc: THREE.AlwaysStenfilFunc,
        //   stencilZPass: THREE.ReplaceStenfilOp
        // });
        
        // Mesh 생성
        const normalMesh = new THREE.Mesh(geometry, materialNormal);
        // const reflectMesh = new THREE.Mesh(geometry, materialReflect);
        // const stencilMesh = new THREE.Mesh(geometry, MaterialStencil);

        // 그룹화
        const reconers = new THREE.Group();
        reconers.add(normalMesh);
        // reconers.add(reflectMesh);
        reconers.position.set(0,0,0);

        // 씬에 그룹 추가
        scene.add(reconers);
        window.reconers = reconers;
      }
    });
  });


// ============ 애니메이션 ============

let originRotation = { x: Math.PI / 2, y: Math.PI / 4, z: 0 }; // 초기값
let targetRotation = { x: Math.PI / 2, y: Math.PI / 4, z: 0 }; // 도형 각도 

// 회전 각도 제한
let rotationLimits = {
x: { min: -Math.PI / 16, max: Math.PI / 16 },
z: { min: -Math.PI / 16, max: Math.PI / 16 }, 
};

const onMouseMove = function (event) {
// 도형의 중앙을 기준으로 마우스 위치를 감지
const mouseX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2); // [-1, 1] 범위로 변환
const mouseY = -(event.clientY - window.innerHeight / 2) / (window.innerHeight / 2); // [-1, 1] 범위로 변환
// 마우스 위치에 따라 목표 회전 각도를 계산
targetRotation.x = originRotation.x + (-mouseY * rotationLimits.x.max); // X축 회전 (위/아래)
targetRotation.z = originRotation.z - (mouseX * rotationLimits.z.max); // Z축 회전 (좌/우), 반대 방향으로 회전
// 회전 제한 적용
applyRotationLimits();
};

const onMouseOut = function (event) {
// 마우스가 창 밖으로 나갈 때만 실행
if (!event.relatedTarget && !event.toElement) {
  targetRotation.x = originRotation.x;
  targetRotation.z = originRotation.z;
}
};

const applyRotationLimits = () => {
// X축 회전 제한
window.reconers.rotation.x = Math.max(
  rotationLimits.x.min,
  Math.min(rotationLimits.x.max, targetRotation.x)
);
// Z축 회전 제한
window.reconers.rotation.z = Math.max(
  rotationLimits.z.min,
  Math.min(rotationLimits.z.max, targetRotation.z)
);
};

// 마우스 이벤트 리스너 등록
window.addEventListener("mousemove", onMouseMove, false);
window.addEventListener("mouseout", onMouseOut, false);

function animate() {
requestAnimationFrame(animate);

// 도형이 항상 마우스를 바라보도록 설정
window.reconers.rotation.x = targetRotation.x;
window.reconers.rotation.z = targetRotation.z;

// 창 크기 변경 시 리사이즈 처리
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}); 


composer.render(); // 후처리 효과 렌더링
// renderer.render( scene, camera );


}

animate();