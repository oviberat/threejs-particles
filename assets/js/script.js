import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"; 
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'; 
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'; 
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
let camera, scene, renderer, stats, parameters;
let mouse = { X: 0, Y: 0 };

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
  

const materials = [];

init();
animate();
function resizeCanvasToDisplaySize() {
  const canvas = renderer.domElement;
  // look up the size the canvas is being displayed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // adjust displayBuffer size to match
  if (canvas.width !== width || canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // update any render target sizes here
  }
}
function init() {
  camera = new THREE.PerspectiveCamera(
    85,
    window.innerWidth / window.innerHeight,
    1,
    2000
  );
  
  camera.position.z = 1000;
   

 
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xe0dac9 ); 
	const light = new THREE.DirectionalLight( 0xffffff, 1.5 );
	light.position.set( 0, 0, 1 ); 
  scene.fog = new THREE.FogExp2(0x000000, 0.0008); 
  const particleSystems = createParticleSystems();
  scene.add(light); 
  // Add particleSystems to scene
  for (let i = 0; i < particleSystems.length; i++) {
    scene.add(particleSystems[i]);
  }    

    var loadert = new FontLoader();
    loadert.load('./assets/models/helvetiker_regular.typeface.js', function (res) { 
      const textGeo = new TextGeometry( 'Bekleyin Geliyoruz..', {
        font: res,
        size: 80,
        height: 2,
        curveSegments:10,
        weight: "normal",
        bevelThickness:1,
        bevelSize:0.3,
        bevelSegments:3,
        bevelEnabled:true
      });
      textGeo.computeBoundingBox();
      textGeo.computeVertexNormals();
      var cubeMat = new THREE.MeshLambertMaterial({color: 0x2A4334})

      var text = new THREE.Mesh(textGeo, cubeMat)
      text.position.x = -500
      text.position.y=-200
      text.castShadow = true;
      scene.add(text)
    });
    
 


  var plant_cube = undefined;
  var objLoader = new OBJLoader(); 
      objLoader.load("./assets/models/Cappuccino_cup.obj", function(object)
      {    
        const textureLoader = new THREE.TextureLoader();
        const colorTexture = textureLoader.load("./assets/models/Cappuccino_cup_Textures_maps/Ceramic_Mat_baseColor.png");
        const normalTexture = textureLoader.load("./assets/models/Cappuccino_cup_Textures_maps/Ceramic_Mat_normal.png");
        const roughnessTexture = textureLoader.load("./assets/models/Cappuccino_cup_Textures_maps/Ceramic_Mat_roughness.png"); 
        const metalnessTexture = textureLoader.load("./assets/models/Cappuccino_cup_Textures_maps/Ceramic_Mat_metallic.png");
        const standardMaterial = new THREE.MeshStandardMaterial({
                
          map: colorTexture,
        
          normalMap: normalTexture,
      
          metalness: 1,
          metalnessMap: metalnessTexture,
          
          roughnessMap: roughnessTexture,
          roughness: 1,
       
      
        });
        objLoader.setMaterials(standardMaterial);
        if ( object.isMesh ) object.geometry.computeVertexNormals();
        plant_cube = object;
        plant_cube.scale.set(35, 35, 35)
          scene.add( plant_cube );
      });

// Load an image file into a custom material
var loaderImage = new THREE.TextureLoader();
var materialLogo = new THREE.MeshLambertMaterial({
  map: loaderImage.load('./assets/models/logo.png')
});
var geometryLogo = new THREE.PlaneGeometry(10, 10*.75);

var meshLogo = new THREE.Mesh(geometryLogo, materialLogo);
meshLogo.scale.normalize().multiplyScalar(0.3);

meshLogo.position.set(0,220,260)
meshLogo.scale.set(17, 17, 17)
scene.add(meshLogo);

  // rendering output to the browser
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio = window.devicePixelRatio;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Showing stats
 

  // Modify with 3D Object with GUI
 
  document.body.style.touchAction = "none";
  document.body.addEventListener("pointermove", onPointerMove);

  window.addEventListener("resize", onWindowResize);
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
  mouse.Y = event.clientY - windowHalfY;
}

function createParticleSystems() {
  // Load the texture that will be used to display our snow
  const textureLoader = new THREE.TextureLoader();

  const sprite1 = textureLoader.load(
    "./assets/textures/sprites/snowflake1.png"
  );
  const sprite2 = textureLoader.load(
    "./assets/textures/sprites/snowflake2.png"
  );
  const sprite3 = textureLoader.load(
    "./assets/textures/sprites/snowflake3.png"
  );
  const sprite4 = textureLoader.load(
    "./assets/textures/sprites/snowflake4.png"
  );
  const sprite5 = textureLoader.load(
    "./assets/textures/sprites/snowflake5.png"
  );

  // Create the geometry that will hold all our vertices
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const particleSystems = [];

  // create the vertices and add store them in our vertices array
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 2000 - 1000; // generate random number between -1000 to 1000
    const y = Math.random() * 2000 - 1000;
    const z = Math.random() * 2000 - 1000;

    vertices.push(x, y, z);
  }

  // Add the vertices stored in our array to set
  // the position attribute of our geometry.
  // Position attribute will be read by threejs
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  parameters = [
    [[121, 96, 78], sprite2, 20],
    [[121, 96, 78], sprite3, 20],
    [[121, 96, 78], sprite1, 20],
    [[121, 96, 78], sprite5, 20],
    [[121, 96, 78], sprite4, 20],
  ];

  for (let i = 0; i < parameters.length; i++) {
    const color = parameters[i][0];
    const sprite = parameters[i][1];
    const size = parameters[i][2];

    // Create the material that will be used to render each vertex of our geometry
    materials[i] = new THREE.PointsMaterial({
      size,
      map: sprite,
      blending: THREE.NormalBlending,
      depthTest: false,
      transparent: true,
    });
    materials[i].color.setHSL(121, 96, 78);

    // Create the particle system
    const particleSystem = new THREE.Points(geometry, materials[i]);

    /* Offset the particle system x, y, z to different random points to break
    uniformity in the direction of movement during animation */
    particleSystem.rotation.x = Math.random() * 2;
    particleSystem.rotation.y = Math.random() * 10;
    particleSystem.rotation.z = Math.random() * 10;

    particleSystems.push(particleSystem);
  }
  return particleSystems;
}

function animate() {
  // This will create a loop rendering at each frame
  resizeCanvasToDisplaySize()
  requestAnimationFrame(animate);
  render(); 
}
function render() {
  const time = Date.now() * 0.00005;

  camera.position.x += (mouse.X - camera.position.x) * 0.03;
  camera.position.y += (mouse.Y - camera.position.y) * 0.03;

  camera.lookAt(scene.position);

  for (let i = 0; i < scene.children.length; i++) {
    const object = scene.children[i];

    if (object instanceof THREE.Points) {
      object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
    }
  }

  for (let i = 0; i < materials.length; i++) {
    const color = parameters[i][0];
    
  } 
  renderer.render(scene, camera);
  container = document.getElementsByTagName('body');
  renderer.setSize($(container).width(), $(container).height());
}
