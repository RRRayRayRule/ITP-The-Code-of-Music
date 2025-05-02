import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshLine, MeshLineMaterial } from 'three.meshline';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1000 );
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera,renderer.domElement);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// 建立一個邊長 3 公尺的立方體邊框
const boxSize = 3;
const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
const edges = new THREE.EdgesGeometry(boxGeometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: "#bababa" , transparent: true, opacity: 0.5});
const wireframe = new THREE.LineSegments(edges, lineMaterial);
scene.background = new THREE.Color("#ededed");
// 放置在觀眾周圍（以 camera 為中心）
wireframe.position.copy(camera.position); // 可用這行固定在當前位置
scene.add(wireframe);
camera.position.z = 5;



//the class needs to be declared before use
class FirstRain{
  constructor(scene){
    this.scene = scene;
    this.length = 0.1;
    this.x = THREE.MathUtils.randFloat(-1.5, 1.5);
    this.y = THREE.MathUtils.randFloat(0,1.8);
    this.z=-1.5;
    this.speed = THREE.MathUtils.randFloat(-0.005,-0.007);
    const points =[
      new THREE.Vector3(this.x,this.y,this.z),
      new THREE.Vector3(this.x,this.y+this.length, this.z)
    ];
    const material = new THREE.LineBasicMaterial({color: "#d12e2e", transparent: true, opacity: 0.3});
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.line = new THREE.Line(geometry,material);
    scene.add(this.line);
  }
    
    drop(){
      this.y += this.speed;
      if(this.y<-1.5){
        this.y = THREE.MathUtils.randFloat(1.3,1.5);
    }
    const points =[
      new THREE.Vector3(this.x,this.y,this.z),
      new THREE.Vector3(this.x,this.y+this.length, this.z)
    ];
    this.line.geometry.setFromPoints(points);
    }
  }

const frontdrops =[];
for(let i=0; i<5000 ; i++){
  frontdrops.push(new FirstRain(scene));
}

function animate() {
  for(let frontdrop of frontdrops){
    frontdrop.drop();
  }
    renderer.render( scene, camera );
    controls.update();
  }

  renderer.setAnimationLoop( animate );


