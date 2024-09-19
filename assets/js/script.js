import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let camera, scene, renderer, stats, mixer, clock;
let mouse = { X: 0 };
let model;
let modelped;
let windowHalfX = window.innerWidth / 2;
let actions = []; // Animasyonları saklamak için bir dizi

init();
animate();

function resizeCanvasToDisplaySize() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

async function init() {
  // Initialize renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.toneMappingExposure = 1.5; // Adjust this value to control brightness

  // Initialize camera
  camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.z =1000;
  camera.position.x=1000;
  // Initialize scene
  scene = new THREE.Scene();

  clock = new THREE.Clock();

  // Load HDR environment map
  try {
    const texture = await new Promise((resolve, reject) => {
      new RGBELoader()
        .setPath('assets/textures/equirectangular/')
        .load('HDR ELF.hdr', resolve, undefined, reject);
    });
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  } catch (error) {
    console.error('HDR yüklenirken hata:', error);
  }

  // Load GLB model
  try {
    model = await loadModelElf();
    modelped = await loadModelPed();
    scene.add(model);
    scene.add(modelped);
    centerAndScaleModel(model);
    centerAndScaleModelPed(modelped)
  } catch (error) {
    console.error('Model yüklenirken hata:', error);
  }

  // Add lights 
  const light = new THREE.DirectionalLight(0xffffff, 30);    // Increased intensity 

light.position.set(0, 100, 100); 

scene.add(light); 
  // Add event listeners
  document.body.style.touchAction = "none";
  document.body.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", onWindowResize);
  document.getElementById('play-button').addEventListener('click', () => {
    playAnimation(); // Butona basıldığında animasyon başlatılacak
  });
}

function loadModelElf() {
  return new Promise((resolve, reject) => {
    const gltfLoader = new GLTFLoader().setPath('models/gltf/');
    const dracoLoader = new DRACOLoader().setDecoderPath('decoder/');
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load('elf.glb', (gltf) => {
      setupAnimations(gltf);  // Animasyonları burada başlatmak yerine sadece kuruyoruz
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

function loadModelPed() {
  return new Promise((resolve, reject) => {
    const gltfLoader = new GLTFLoader().setPath('models/gltf/');
    const dracoLoader = new DRACOLoader().setDecoderPath('decoder/');
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load('pedestal.glb', (gltf) => {
         // Animasyonları burada başlatmak yerine sadece kuruyoruz
      resolve(gltf.scene);
    }, undefined, reject);
  });
}
function centerAndScaleModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  model.position.x -= center.x;
  model.position.y -= center.y + 850;
  model.position.z -= center.z;

  const maxDimension = Math.max(size.x, size.y, size.z);
  const scale = 10 / maxDimension;
  model.scale.set(scale, scale, scale);
}
function centerAndScaleModelPed(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  model.position.x -= center.x;
  model.position.y -= center.y + 1200;
  model.position.z -= center.z;

  const maxDimension = Math.max(size.x, size.y, size.z);
  const scale = 1500 / maxDimension;
  model.scale.set(2000, scale, 2000);
}

function setupAnimations(gltf) {
  mixer = new THREE.AnimationMixer(gltf.scene);

  gltf.animations.forEach((clip) => { // İlk animasyonu atlayarak
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce); // Animasyon sadece bir kez oynayacak
    action.clampWhenFinished = true; // Bittiğinde animasyon son pozisyonda kalacak
    actions.push(action); // Animasyonları actions dizisine ekliyoruz, ama henüz play() demiyoruz
  });
}

function playAnimation() {
  // Tüm animasyonları oynat
  actions.forEach((action) => {
    action.reset(); // Animasyonu başa sar
    action.play();  // Animasyonu oynat
  });

  // Animasyonun bitişini dinleme (ilk animasyon için örnek)
  actions[0].getMixer().addEventListener('finished', () => {
    console.log('Animasyon bitti');
    // Burada animasyon bittiğinde yapılacak işlemleri yazabilirsiniz
  });
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
  if (event.isPrimary === false) return;
  mouse.X = event.clientX - windowHalfX;
}

function animate() {
  resizeCanvasToDisplaySize();
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  render();
}

function render() {
  camera.position.x += (mouse.X - camera.position.x) * 0.03;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}
