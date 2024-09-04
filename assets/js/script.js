import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let camera, scene, renderer, stats, mixer, clock;
let mouse = { X: 0, Y: 0 };
let model; // This will store the loaded GLTF model for scaling/positioning

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
const materials = [];

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

function init() {
  camera = new THREE.PerspectiveCamera(
    85,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );
  camera.position.z = 1000;

  scene = new THREE.Scene(); 

  clock = new THREE.Clock(); // Used to track animation timing

  new RGBELoader()
    .setPath('assets/textures/equirectangular/')
    .load('hdr.hdr', function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;

      // Load the GLB model
      const gltfLoader = new GLTFLoader().setPath('models/gltf/');
      const dracoLoader = new DRACOLoader().setDecoderPath('decoder/');
      gltfLoader.setDRACOLoader(dracoLoader);

      gltfLoader.load('new shoot.glb', function (gltf) {
        model = gltf.scene;
        scene.add(model);

        // Center and scale the model
        centerAndScaleModel(model);

        // Set up animations
        mixer = new THREE.AnimationMixer(model); // Create AnimationMixer for the loaded model

        // Loop through animations and play them
        gltf.animations.slice(1).forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.play(); // Play the animation starting from index 1
          action.setLoop(THREE.LoopRepeat); // Set the loop mode
        });
      });
    });

  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(0, 0, 1);
  scene.fog = new THREE.FogExp2(0x000000, 0.0008);
  scene.add(light);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  document.body.style.touchAction = "none";
  document.body.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", onWindowResize);
}

function centerAndScaleModel(model) {
  const box = new THREE.Box3().setFromObject(model); // Compute the bounding box of the model
  const center = box.getCenter(new THREE.Vector3()); // Get the center of the bounding box
  const size = box.getSize(new THREE.Vector3()); // Get the size of the bounding box

  // Center the model
  model.position.x -= center.x;
  model.position.y -= center.y+700;
  model.position.z -= center.z;

  // Scale the model to fit into the view
  const maxDimension = Math.max(size.x, size.y, size.z);
  const scale = 10 / maxDimension; // 800 is an arbitrary value to ensure the model fits in the screen
  model.scale.set(scale, scale, scale);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

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

  const delta = clock.getDelta(); // Get the time since the last frame

  if (mixer) {
    mixer.update(delta); // Update animation mixer based on time delta
  }

  render();
}

function render() {
  camera.position.x += (mouse.X - camera.position.x) * 0.03;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}
