import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { FirstBatchedRain, SecondBatchedRain,  ThirdBatchedRain  } from './class.js';
import { XRHandModelFactory } from 'three/examples/jsm/Addons.js';


//basic setting:
const scene = new THREE.Scene();
const world = new THREE.Group();
scene.add(world);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; //enable WebXR support

//ask for hand tracking from xr manager
navigator.xr.requestSession = (function (original) {
  return function (mode, options) {
      options = options || {};
      options.optionalFeatures = options.optionalFeatures || [];
      if (!options.optionalFeatures.includes('hand-tracking')) {
          options.optionalFeatures.push('hand-tracking');
      }
      return original.call(this, mode, options);
  };
})(navigator.xr.requestSession);

document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));
//Setting the frame:
const boxGeometry = new THREE.BoxGeometry(2, 3, 2);
const edges = new THREE.EdgesGeometry(boxGeometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: "#bababa", transparent: true, opacity: 0.5 });
const wireframe = new THREE.LineSegments(edges, lineMaterial);
scene.background = new THREE.Color("#ededed");
wireframe.position.copy(camera.position); // 可用這行固定在當前位置
world.add(wireframe);
//setting the perspective:
camera.position.set(0, 1.6, 0);
camera.lookAt(0, 0, 0);
world.position.set(0, 1, 0);
//activate hand tracking:
const hand1= renderer.xr.getHand(0);
const hand2= renderer.xr.getHand(1);
world.add(hand1);
world.add(hand2);
const handModelFactory = new XRHandModelFactory();
hand1.add(handModelFactory.createHandModel(hand1, "lines"));
hand2.add(handModelFactory.createHandModel(hand2, "lines"));

//loading the image:
const loader = new THREE.TextureLoader();
const imageTexture = loader.load('/assets/eye poster copy.png');
const imagemMaterial = new THREE.MeshBasicMaterial({
  map: imageTexture,
  transparent: true,
  alphatest: 0.5,
  side: THREE.DoubleSide
});
const imageGeometry = new THREE.PlaneGeometry(0.5, 0.5);
const imageMesh = new THREE.Mesh(imageGeometry, imagemMaterial);
world.add(imageMesh);
imageMesh.position.set(0,0,-1.5);


//declare the 3 different types of rain
const frontdrops = [];
for (let i = 0; i < 10; i++) {
  frontdrops.push(new FirstBatchedRain(world));
}

const leftdrops = [];
for (let i = 0; i < 30; i++) {
  leftdrops.push(new SecondBatchedRain(world));
}

const rightdrops = [];
for (let i = 0; i < 100; i++) {
  rightdrops.push(new  ThirdBatchedRain (world));
}


//animation:
function animate() {
  for (let frontdrop of frontdrops) {
    frontdrop.drop();
  }
  for (let leftdrop of leftdrops) {
    leftdrop.drop();
  }
  for (let rightdrop of rightdrops) {
    rightdrop.drop();
  }
  renderer.render(scene, camera);
  controls.update();
}
renderer.setAnimationLoop(animate);


