import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { BeatSineWave, FirstBatchedRain, SecondBatchedRain, SpreadPaint, ThirdBatchedRain } from './class.js';
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
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
  color: 'black',
  transparent: true,
  opacity: 0,
  side: THREE.DoubleSide,
  depthWrite: false
})
const wallGeometry = new THREE.BoxGeometry(2, 3, 0.6);
const frontWall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
frontWall.position.set(0, 0, -1);
world.add(frontWall);
const leftWall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
leftWall.rotation.y = Math.PI / 2;
leftWall.position.set(-1, 0, 0);
world.add(leftWall);
const rightWall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
rightWall.rotation.y = Math.PI / 2;
rightWall.position.set(1, 0, 0);
world.add(rightWall);
let loaded = false;
let lastHandDistance = 0;

//setting the perspective:
camera.position.set(4, 5, 8);
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

//import sound
const singleDrop = new Tone.Player({
  url: '/assets/single drop.wav',
  loop: true
}).toDestination();
const coolWeather = new Tone.Player({
  url: '/assets/cool weather.flac',
  loop: true
}).toDestination();
const storm = new Tone.Player({
  url: 'assets/storm.flac',
  loop: true
}).toDestination();
const hh = new Tone.Player({
  url: '/assets/hh.mp3',
}).toDestination();
const hho = new Tone.Player({
  url: '/assets/hho.mp3',
}).toDestination();
const kick = new Tone.Player({
  url: '/assets/kick.mp3',
}).toDestination();
const snare = new Tone.Player({
  url: '/assets/snare.mp3',
}).toDestination();
let globalBPM = 120;
singleDrop.playbackRate = globalBPM / 99;
coolWeather.playbackRate = globalBPM / 129;
storm.playbackRate = globalBPM / 111;
if (loaded) {
  if (Tone.Transport.state == "stopped") {
    Tone.Transport.bpm.value = globalBPM;
    Tone.Transport.start();
  }
}

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

//teleport
let isTeleported = false;
let palmsAreTouching = false;
let lastPalmsTouching = false;
const teleportTarget = new THREE.Vector3(4, 5, 8);
const originPosition = new THREE.Vector3(0, -1, 0);
function toggleTeleport() {
  const target = isTeleported ? originPosition : teleportTarget;
  world.position.set(-target.x, -target.y, -target.z);
  isTeleported = !isTeleported;
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
for (let i = 0; i < 15; i++) {
  leftdrops.push(new SecondBatchedRain(world));
}
const rightdrops = [];
for (let i = 0; i < 50; i++) {
  rightdrops.push(new ThirdBatchedRain(world));
}
// //making sinewave and trigger box
const sinedrops1 = new BeatSineWave(world, -0.6, 0, 0.2);
const sinedrops2 = new BeatSineWave(world, 0, 0, -0.3);
const sinedrops3 = new BeatSineWave(world, 0.6, 0, 0.2);
const sineBoxMat = new THREE.MeshBasicMaterial({
  color: 'black',
  transparent: true,
  opacity: 0.3,
  depthWrite: false
})
const sineBoxGeo1 = new THREE.BoxGeometry(0.3, 0.1, 0.01);
const sineBoxGeo2 = new THREE.BoxGeometry(0.3, 0.1, 0.01);
const sineBoxGeo3 = new THREE.BoxGeometry(0.3, 0.1, 0.01);
const sinebox1 = new THREE.Mesh(sineBoxGeo1, sineBoxMat.clone())
const sinebox2 = new THREE.Mesh(sineBoxGeo2, sineBoxMat.clone())
const sinebox3 = new THREE.Mesh(sineBoxGeo3, sineBoxMat.clone())
sinebox1.position.set(-0.45, 0, 0.4);
sinebox2.position.set(0.15, 0, -0.6);
sinebox3.position.set(0.75, 0, 0.4);
world.add(sinebox1, sinebox2, sinebox3);

let triggerWalls = [frontWall, leftWall, rightWall, sinebox1, sinebox2, sinebox3];
let wallTouched = [false, false, false, false, false, false]; // [front, left, right]
let lastWallTouched = [false, false, false, false, false, false];
let played = [false, false, false, false, false, false];
let lastPlayed = [false, false, false, false, false, false];
let spreadPaints = [];



//animation:
function animate(timestamp, frame) {
  renderer.render(scene, camera);
  controls.update();
  let leftPalmPos = null;
  let rightPalmPos = null;

  //if(frame), meaning that only when enter XR mode
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
          wallTouched[i] = true;
        } else {
          wallTouched[i] = false;
        }
        if (wallTouched[i] && !lastWallTouched[i]) {
          played[i] = !played[i];
        }
      });

      const isLeft = source.handedness === 'left';
      const wristJoint = source.hand.get('wrist');
      if (!wristJoint) continue;

      const pose = frame.getJointPose(wristJoint, referenceSpace);
      if (!pose) continue;

      const pos = new THREE.Vector3(
        pose.transform.position.x,
        pose.transform.position.y,
        pose.transform.position.z
      );

      if (isLeft) leftPalmPos = pos;
      else rightPalmPos = pos;
    }

    if (leftPalmPos && rightPalmPos) {
      const palmDistance = leftPalmPos.distanceTo(rightPalmPos);
      palmsAreTouching = palmDistance < 0.05; // clap threshold (5cm)

      if (palmsAreTouching && !lastPalmsTouching) {
        toggleTeleport();
      }

      lastPalmsTouching = palmsAreTouching;
    }
  }
  for (let frontdrop of frontdrops) {
    if (played[0]) {
      frontdrop.drop();
    }
  }
  for (let leftdrop of leftdrops) {
    if (played[1]) {
      leftdrop.drop();
    }
  }
  for (let rightdrop of rightdrops) {
    if (played[2]) {
      rightdrop.drop();
    }
  }

  if (!played[3]) {
    const time = performance.now() * 0.001;
    sinedrops1.oscillate(time);
  }
  if (!played[4]) {
    const time = performance.now() * 0.001;
    sinedrops2.oscillate(time);
  }
  if (!played[5]) {
    const time = performance.now() * 0.001;
    sinedrops3.oscillate(time);
  }

  if (loaded) {
    if (played[0] && !lastPlayed[0]) {
      singleDrop.start("@1m");
    } else if (!played[0] && lastPlayed[0]) {
      singleDrop.stop();
    }
    if (played[1] && !lastPlayed[1]) {
      coolWeather.start("@1m");
    } else if (!played[1] && lastPlayed[1]) {
      coolWeather.stop();
    }
    if (played[2] && !lastPlayed[2]) {
      storm.start("@1m");
    } else if (!played[2] && lastPlayed[2]) {
      storm.stop();
    }
    if (played[3] && !lastPlayed[3]) {
      hho.start();
      spreadPaints.push(new SpreadPaint(world));
    }

    if (played[4] && !lastPlayed[4]) {
      kick.start();
      spreadPaints.push(new SpreadPaint(world));
    }
    if (played[5] && !lastPlayed[5]) {
      snare.start();
      spreadPaints.push(new SpreadPaint(world));
    }
  }
  for (let i = 0; i <6; i++) {
    lastWallTouched[i] = wallTouched[i];
    lastPlayed[i] = played[i];
  }

  //for browser debugging
  if (!renderer.xr.isPresenting) {
    window.addEventListener('keydown', (event) => {
      for (let testdrop of frontdrops) {
        testdrop.drop();
      }
      for (let testdrop of leftdrops) {
        testdrop.drop();
      }
      for (let testdrop of rightdrops) {
        testdrop.drop();
      }
      const time = performance.now() * 0.001;
      sinedrops1.oscillate(time);
      singleDrop.start("@1m");
      coolWeather.start("@1m");
      storm.start("@1m");
      hho.start();
    })
  }
}
renderer.setAnimationLoop(animate);

Tone.loaded().then(function () {
  loaded = true;
});

