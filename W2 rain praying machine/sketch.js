let bodyPose;
let video;
let poses = [];
let connections;
let singleAmount = 2000;
let coolAmount = 2000;
let stormAmount = 2000;
let lightningAmount = 100;
let rain = [];
let coolWeatherRain = [];
let stormRain = [];
let lightningRain = [];
let triggerKeypointsIndex = [11, 12, 15, 16];
let triggerConfident = true;
const singleDrop = new Tone.Player("audio/single drop.wav");
const storm = new Tone.Player("audio/storm.flac");
const coolWeather = new Tone.Player("audio/cool weather.flac");
const lightning = new Tone.Player("audio/lightning.wav");
let loaded = false;
let singleDropPlay = false;
let stormPlay = false;
let coolWeatherPlay = false;
let lastSingleDropPlay = false;
let lastStormPlay = false;
let lastCoolWeatherPlay = false;
let lightningPlay = false;
let lastLightningPlay = false;

let singleDropBPM=123;
let stormBPM=111;
let coolWeatherBPM=129;
let lightningBPM=70;
let globalBPM=120;

let boxWidth = 2;
let threhold = 0.6;

singleDrop.toDestination();
storm.toDestination();
coolWeather.toDestination();
lightning.toDestination();

function preload() {
  bodyPose = ml5.bodyPose("BlazePose", { flipped: true });
}




/// testst 

function setup() {
  createCanvas(600, 900, WEBGL);
  video = createCapture(VIDEO, { flipped: true });
  //video.hide();
  bodyPose.detectStart(video, gotPoses);
  connections = bodyPose.getSkeleton();
  for (i = 0; i < singleAmount; i++) {
    rain[i] = new singleDropRAIN();
  }

  for (i = 0; i < coolAmount; i++) {
    coolWeatherRain[i] = new coolWeatherRAIN();
  }

  for (i = 0; i < stormAmount; i++) {
    stormRain[i] = new stormRAIN();
  }

  for (i = 0; i < lightningAmount; i++) {
    lightningRain[i] = new lightningRAIN();
  }
  
}

function draw() {
  background(220);
  scale(300);
  // stroke(50,50,50);
  // strokeWeight(2);
  // fill(50,50,50);
  // textSize(50);
  // text('RAIN',30,70);
  // text('PRAYING',30,120);
  // text('PROGRAM',30,170);
  //image(video, -width/2, height/2,width,height);
  orbitControl();
  noFill();
  stroke(50, 50, 50, 50);
  strokeWeight(3);
  push();
  translate(0, -0.5, 0);
  box(boxWidth, 3, boxWidth);
  pop();
  
  singleDrop.playbackRate=globalBPM/singleDropBPM;
  storm.playbackRate=globalBPM/stormBPM;
  coolWeather.playbackRate=globalBPM/coolWeatherBPM;
  lightning.playbackRate=globalBPM/lightningBPM;
  

  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    //for drawing keypoints.
    for (let j = 0; j < pose.keypoints3D.length; j++) {
      let keypoint = pose.keypoints3D[j];
      if (keypoint.confidence > 0.1) {
        // push();
        // stroke(50, 50, 50, 50);
        // fill(255, 150, 0, 50);
        // translate(keypoint.x, keypoint.y, keypoint.z);
        // box(0.05);
        // pop();
        strokeWeight(10);
        stroke(255, 0, 0);
        point(keypoint.x, keypoint.y, keypoint.z);
      }
    }
    //for drawing connection line between keypoints.
    for (let j = 0; j < connections.length; j++) {
      let keypointIndexA = connections[j][0];
      let keypointIndexB = connections[j][1];
      let keypointA = pose.keypoints3D[keypointIndexA];
      let keypointB = pose.keypoints3D[keypointIndexB];

      if (keypointA.confidence > 0.1 && keypointB.confidence > 0.1) {
        stroke(0, 200, 200);
        strokeWeight(3);
        beginShape();
        vertex(keypointA.x, keypointA.y, keypointA.z);
        vertex(keypointB.x, keypointB.y, keypointB.z);
        endShape();
      }
    }

    for (i = 0; i < singleAmount; i++) {
      rain[i].show();
    }

    for (i = 0; i < coolAmount; i++) {
      coolWeatherRain[i].show();
    }

    for (i = 0; i < stormAmount; i++) {
      stormRain[i].show();
    }

    for (i = 0; i < lightningAmount; i++) {
      lightningRain[i].show();
    }

    let leftHand = pose.keypoints3D[16];
    let rightHand = pose.keypoints3D[15];
    let leftShoulder = pose.keypoints3D[12];
    let rightShoulder = pose.keypoints3D[11];
    
    if(loaded){
      if(Tone.Transport.state == "stopped"){
        Tone.Transport.bpm.value=120;
        Tone.Transport.start();
      }
    }
    if (
      leftHand.confidence > 0.1 &&
      rightHand.confidence > 0.1 &&
      leftShoulder.confidence > 0.1 &&
      rightShoulder.confidence > 0.1
    ) {
      if (
        leftShoulder.y - leftHand.y > 0.3 ||
        rightShoulder.y - rightHand.y > 0.3
      ) {
        lightningPlay = true;
        for (i = 0; i < lightningAmount; i++) {
          lightningRain[i].drop();
        }
      } else {
        lightningPlay = false;
      }

      if (
        leftShoulder.z - leftHand.z > 0.3 ||
        rightShoulder.z - rightHand.z > 0.3
      ) {
        singleDropPlay = true;
        for (i = 0; i < singleAmount; i++) {
          rain[i].drop();
        }
      } else {
        singleDropPlay = false;
      }

      if (
        leftShoulder.x - leftHand.x > 0.3 ||
        rightShoulder.x - rightShoulder.x > 0.3
      ) {
        coolWeatherPlay = true;
        for (i = 0; i < coolAmount; i++) {
          coolWeatherRain[i].drop();
        }
      } else {
        coolWeatherPlay = false;
      }

      if (
        rightHand.x - rightShoulder.x > 0.3 ||
        leftHand.x - leftShoulder.x > 0.3
      ) {
        stormPlay = true;
        for (i = 0; i < stormAmount; i++) {
          stormRain[i].drop();
        }
      } else {
        stormPlay = false;
      }
    }

    if (loaded) {
      if (singleDropPlay && !lastSingleDropPlay) {
        singleDrop.start("@1m");
      } else if (!singleDropPlay && lastSingleDropPlay) {
        singleDrop.stop();
      }

      if (stormPlay && !lastStormPlay) {
        storm.start("@1m");
      } else if (!stormPlay && lastStormPlay) {
        storm.stop();
      }

      if (coolWeatherPlay && !lastCoolWeatherPlay) {
        coolWeather.start("@1m");
      } else if (!coolWeatherPlay && lastCoolWeatherPlay) {
        coolWeather.stop();
      }

      if (lightningPlay && !lastLightningPlay) {
        lightning.start("@1m");
      } else if (!lightningPlay && lastLightningPlay) {
        lightning.stop();
      }
    }

    lastSingleDropPlay = singleDropPlay;
    lastCoolWeatherPlay = coolWeatherPlay;
    lastStormPlay = stormPlay;
    lastLightningPlay = lightningPlay;
  }

  //fill(50,50,50);
  //noStroke();
  //translate(0,0.5);
  //rotateX(PI/2);
  //rectMode(CENTER);
  //square(0,0,2);
}

function gotPoses(results) {
  poses = results;
}

class singleDropRAIN {
  constructor() {
    //2 is the width of the cube
    this.x = random(-0.95, 0.95);
    this.y = -random(1, 1.6) * 2;
    this.z = -1;
    this.speed = random(0.01, 0.02);
  }

  show() {
    stroke(255, 0, 0, 50);
    strokeWeight(5);
    line(this.x, this.y, this.z, this.x, this.y + 0.08, this.z);
  }

  drop() {
    this.y += this.speed;
    if (this.y > 1) {
      this.y = -random(1, 1.6) * 2;
    }
  }
}

class coolWeatherRAIN {
  constructor() {
    //2 is the width of the cube
    this.y = random(-1.9, 0.9);
    this.z = random(1, 2) * 2;
    this.x = -1;
    this.speed = random(0.02, 0.03);
  }

  show() {
    stroke(255, 0, 0, 50);
    strokeWeight(random(5, 30));
    point(this.x, this.y, this.z);
  }

  drop() {
    this.z -= this.speed;
    if (this.z < -1) {
      this.z = random(1, 2) * 2;
    }
  }
}

class stormRAIN {
  constructor() {
    //2 is the width of the cube
    this.x = 1;
    this.y = -2;
    this.z = -1;
    this.speedy = random(0, 0.03);
    this.speedz = random(0, 0.02);
  }

  show() {
    stroke(255, 0, 0, 50);
    strokeWeight(5);
    let a = random(0.06, 0.1);
    line(this.x, this.y, this.z, this.x, this.y + (a / 2) * 3, this.z + a);
  }

  drop() {
    this.y += this.speedy;
    this.z += this.speedz;
    if (this.y > 1 || this.z > 1) {
      this.y = -2;
      this.z = -1;
    }
  }
}

class lightningRAIN {
  constructor() {
    //2 is the width of the cube
    this.x = random(-1, 1);
    this.z = -random(1, 1.2) * 2;
    this.y = -2;
    this.speed = random(0.02, 0.03);
  }

  show() {
    stroke(255, 0, 0, 50);
    strokeWeight(10);
    line(this.x, this.y, this.z, this.x, this.y, this.z + 1);
  }

  drop() {
    this.z += this.speed;
    if (this.z > 1) {
      this.z = -random(1, 2) * 2;
    }
  }
}

Tone.loaded().then(function () {
  loaded = true;
});
