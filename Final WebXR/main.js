import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { FirstBatchedRain, SecondBatchedRain,  ThirdBatchedRain  } from './class.js';
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js';
import * as Tone from 'tone';

//basic setting:
const scene = new THREE.Scene();
const world = new THREE.Group();
scene.add(world);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0001, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
//scene.background = new THREE.Color("black");
wireframe.position.copy(camera.position); 
world.add(wireframe);

//setting trigger walls:
const wallMaterial = new THREE.MeshBasicMaterial({
  color:'black',
  transparent: true,
  opacity:0,
  side: THREE.DoubleSide,
  depthWrite: false
})
const wallGeometry = new THREE.BoxGeometry(2,3,1);
const frontWall = new THREE.Mesh(wallGeometry,wallMaterial.clone());
frontWall.position.set(0,0,-1);
world.add(frontWall);
const leftWall = new THREE.Mesh(wallGeometry,wallMaterial.clone());
leftWall.rotation.y = Math.PI / 2;
leftWall.position.set(-1,0,0);
world.add(leftWall);
const rightWall = new THREE.Mesh(wallGeometry,wallMaterial.clone());
rightWall.rotation.y = Math.PI / 2;
rightWall.position.set(1,0,0);
world.add(rightWall);
const triggerWalls = [frontWall,leftWall,rightWall];
const wallTouched = [false,false,false]; // [front, left, right]

//setting the perspective:
camera.position.set(0, 1.6, 0);
camera.lookAt(0, 0, 0);
world.position.set(0, 1, 0);

// Add light
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
light.position.set(0.5, 1, 0.25);
scene.add(light);

// Hand tracking setup
const spheres = {}; // key: joint name, value: mesh sphere
const jointGeometry = new THREE.SphereGeometry(0.01, 8, 8);
const jointMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffcc });

// Create hands and track joints
for (let i = 0; i < 2; i++) {
  const hand = renderer.xr.getHand(i);
  hand.joints = {};
  scene.add(hand);

  hand.addEventListener('connected', (event) => {
    const inputSource = event.data;
    if (inputSource.hand) {
      for (const jointName of inputSource.hand.values()) {
        const name = jointName.jointName;
        const jointMesh = new THREE.Mesh(jointGeometry, jointMaterial);
        jointMesh.visible = false;
        spheres[`${i}-${name}`] = jointMesh;
        hand.add(jointMesh);
        hand.joints[name] = jointMesh;
      }
    }
  });

  hand.addEventListener('disconnected', () => {
    for (const name in hand.joints) {
      const joint = hand.joints[name];
      if (joint.parent) joint.parent.remove(joint);
    }
  });
}

// //loading the image:

// const loader = new THREE.TextureLoader();
// const imageTexture = loader.load('/assets/eye poster copy.png');
// const imagemMaterial = new THREE.MeshBasicMaterial({
//   map: imageTexture,
//   transparent: true,
//   alphatest: 0.5,
//   side: THREE.DoubleSide
// });
// const imageGeometry = new THREE.PlaneGeometry(0.5, 0.5);
// const imageMesh = new THREE.Mesh(imageGeometry, imagemMaterial);
// world.add(imageMesh);
// imageMesh.position.set(0,0,-1.5);


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
function animate(timestamp, frame) {

  if (frame) {
    
    const session = renderer.xr.getSession();
    const referenceSpace = renderer.xr.getReferenceSpace();

    for (const source of session.inputSources) {
      if (!source.hand) continue;
      const hand = renderer.xr.getHand(source.handedness === 'left' ? 0 : 1);

      for (const inputJoint of source.hand.values()) {
        const pose = frame.getJointPose(inputJoint, referenceSpace);
        const jointName = inputJoint.jointName;
        const mesh = hand.joints[jointName];
        if (pose && mesh) {
          mesh.matrix.fromArray(pose.transform.matrix);
          mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
          mesh.visible = true;
        } else if (mesh) {
          mesh.visible = false;
        }
      }

      if (!source.hand) continue;

      const indexTip = source.hand.get('index-finger-tip');
      if (!indexTip) continue;
    
      const jointPose = frame.getJointPose(indexTip, referenceSpace);
      if (!jointPose) continue;
    
      const tipPos = new THREE.Vector3().fromArray([
        jointPose.transform.position.x,
        jointPose.transform.position.y,
        jointPose.transform.position.z,
      ]);

      
      triggerWalls.forEach((wall, i) => {
        const box = new THREE.Box3().setFromObject(wall);
        if (box.containsPoint(tipPos)) {
          wall.material.opacity = 0;
          wallTouched[i] = true;
        } else {
          wall.material.opacity = 0;
          wallTouched[i] = false;
        }
      });
      
    }
  }

  for (let frontdrop of frontdrops) {
    if(wallTouched[0]){
    frontdrop.drop();
    }
  }
  for (let leftdrop of leftdrops) {
    if(wallTouched[1]){
    leftdrop.drop();
    }
  }
  for (let rightdrop of rightdrops) {
    if(wallTouched[2]){
    rightdrop.drop();
    }
  }

  renderer.render(scene, camera);
  controls.update();
}
renderer.setAnimationLoop(animate);



