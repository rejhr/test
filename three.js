import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
// import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
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
renderer.setPixelRatio(1);
document.body.appendChild(renderer.domElement);
renderer.autoClear = false;
renderer.setClearColor( 0x000000, 0 ); // 배경색, 불투명도

// ============Scene============
const scene = new THREE.Scene();

// ============Camera============
const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight);
camera.position.z = 0.5;
camera.lookAt(0, 0, 0);

// ============조명 설정============
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(0.5, 0.5, 0.5);
directionalLight.lookAt(0, 0, 0);

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

// ============ Bloom 후처리 ============
let BLOOM_SCENE = 1; // Bloom 효과가 적용될 레이어 설정

const options = {
  bloomThreshold: 0.85,
  bloomStrength: 0.1,
  bloomRadius: 0.1,
};
const renderPass = new RenderPass( scene, camera );
renderPass.clearColor = new THREE.Color( 0x000000, 0 );
renderPass.clearAlpha = 0;
renderPass.clear = false;

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2( window.innerWidth, window.innerHeight ),
  options.bloomStrength,
  options.bloomRadius,
  options.bloomThreshold
);
bloomPass.renderToScreen = false;


// ============ Meshes ============

// GLTF Mesh
const reconers = new THREE.Group();

new GLTFLoader().load("./threejs/reconers_v31.glb", (gltf) => {
  const model = gltf.scene; // 3D 파일에서 Scene 전체 로드
  
  // Mesh 정의

  model.traverse((child) => {
      if (child.isMesh) {
        const geometry = child.geometry.clone(); // 3D 파일에서 geometry를 복제

        // 내부 입체감
        const materialNormal = new THREE.MeshPhysicalMaterial({
          // side: THREE.DoubleSide,
          blending: THREE.NormalBlending,
          // transmission: 1, // 투과성
          // opacity: 0.8, // 불투명도
          color: 0x0B6FE8, // 색상
          reflectivity: 0.7, // 반사
          metalness: 0.2, // 금속질
          roughness: 0.1, // 표면 거칠기
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
          // blending: THREE.AdditiveBlending,
          blending: THREE.NormalBlending,
          // blending: THREE.MultiplyBlending,
          // side: THREE.BackSide,
          side: THREE.DoubleSide,
          // color: 0x0B6FE8, // 색상
          opacity: 0.65, // 불투명도
          reflectivity: 0.5, // 반사
          transmission: 1, // 투명도
          metalness: 0.2, // 금속질
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
          envMapIntensity: 1, // 환경맵 적용값
          alphaToCoverage: true,

        }); 
        
        // Mesh 생성
        const normalMesh = new THREE.Mesh(geometry, materialNormal);
        const reflectMesh = new THREE.Mesh(geometry, materialReflect);

        reflectMesh.scale.set(0.1, 0.22, 0.1);
        normalMesh.scale.set(0.1, 0.22, 0.1);
        
        reconers.add(normalMesh);
        reconers.add(reflectMesh);
        reconers.position.set(0, 0.01, 0);

      }
    });
  });
  
  // 씬에 그룹 추가
  scene.add(reconers);
  // console.log(reconers);
  // window.reconers = reconers;
  
  // ============ 렌더 합성 ============
  // const clearPass = new ClearPass();  // 프레임마다 클리어를 추가

  // 기본 장면과 bloom 장면을 분리해 렌더링하도록 설정
  const bloomComposer = new EffectComposer(renderer);
  // bloomComposer.addPass(clearPass); // 클리어 패스 추가
  bloomComposer.addPass(renderPass);
  bloomComposer.addPass(bloomPass);
  bloomComposer.renderToScreen = false; // 최종 화면에 직접 출력하지 않음
  
  // 씬 마스크 설정
  const darkComposer = new EffectComposer(renderer);
  // darkComposer.addPass(clearPass); // 클리어 패스 추가
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
  // finalComposer.addPass(clearPass); // 최종 렌더링 시에도 클리어 추가
  finalComposer.addPass(finalPass);
  finalComposer.renderToScreen = true;  // 최종 컴포저에서만 화면에 렌더링

// ============ 애니메이션 ============

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
targetRotation.x = originRotation.x + (-mouseY * rotationLimits.x.max); // X축 회전 (위/아래)
targetRotation.y = originRotation.y + ((mouseX * rotationLimits.y.max) / 2); // Y축 회전 (좌/우), 반대 방향으로 회전
targetRotation.z = originRotation.z + (mouseX * rotationLimits.y.max);

// 회전 제한 적용
applyRotationLimits();
};

const onMouseOut = function (event) {
// 마우스가 창 밖으로 나갈 때만 실행
if (!event.relatedTarget && !event.toElement) {
  targetRotation.x = originRotation.x;
  targetRotation.y = originRotation.y;
  targetRotation.z = originRotation.z;
}
};

const applyRotationLimits = () => {
// X축 회전 제한
reconers.rotation.x = Math.max(
  rotationLimits.x.min,
  Math.min(rotationLimits.x.max, targetRotation.x)
);
// Y축 회전 제한
reconers.rotation.y = Math.max(
  rotationLimits.y.min,
  Math.min(rotationLimits.y.max, targetRotation.y)
);
// Z축 회전 제한
reconers.rotation.z = Math.max(
  rotationLimits.z.min,
  Math.min(rotationLimits.z.max, targetRotation.z)
);
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

  if (reconers) {
    
    // 도형이 항상 마우스를 바라보도록 설정
    reconers.rotation.x = targetRotation.x;
    reconers.rotation.y = targetRotation.y;
    reconers.rotation.z = targetRotation.z;

    function setBloomLayer(Group) {
      Group.traverse((child) => {
        if (child.isMesh) {
          child.layers.enable(BLOOM_SCENE);
        }
      });
    };

    // // Bloom 레이어 설정
    setBloomLayer(reconers);
    
    renderer.clear();
    
    // 레이어별로 렌더링
    camera.layers.set(0);
    darkComposer.render();
    
    camera.layers.set(BLOOM_SCENE);
    renderer.clearDepth();  // Bloom 레이어의 Z-buffer만 지우기
    bloomComposer.render();
    

    finalComposer.render(); // 최종 화면 렌더링
    
      // composer.render(); // 후처리 효과 렌더링
      // renderer.render( scene, camera );
    };
  };
  
  animate();
  