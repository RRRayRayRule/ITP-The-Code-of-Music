//Note: 
//Calibrate ampThreshold before using!!
//harmonyFactor can be changed to do different scale of harmony as well.
let ampThreshold = -60;
let harmonyFactor=2;

let fftResolution =8192;
let analyzer = new Tone.FFT(fftResolution);
let mic = new Tone.UserMedia();
let nyquist = Tone.context.sampleRate/2; // Nyquist Theorem: To accurately represent a frequency, you must sample it at at least twice its frequency.
mic.open();
let scaleRatio=[]
let syn = new Tone.PolySynth().toDestination();
let maxAmp;
let maxFreq;
let harmonyFreq;



mic.connect(analyzer);


function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    rectMode(CENTER);
}

function draw(){
  background(90,173,244);
  
  findDominantFreq();
  
  harmonyFreq = maxFreq*harmonyFactor;
  syn.triggerAttackRelease(harmonyFreq,"4n");

  drawComplexVisual();
  //drawSimpleVisual();
}


function findDominantFreq(){
  waveform = analyzer.getValue();
  maxAmp= waveform[0];
  maxFreq=0;
  for(let i=0;i<waveform.length;i++){
    if(waveform[i]>maxAmp){
      if(waveform[i]>ampThreshold){
      maxAmp=waveform[i];
      maxFreq=(i+1)*nyquist/waveform.length;
      }
    }
  }
  if(maxFreq!==0){console.log(maxAmp, maxFreq);
  }
}

function drawComplexVisual(){
  // noFill();
  // translate(width/2,height/2);
  // for(let j=0 ; j<300; j++){
  //   rotate(j);
  //   stroke(200,200,200,30);
  //   rect(0,0,maxFreq/10,300-j*10,200);
  //   stroke(150,150,150,30);
  //   rect(0,0,harmonyFreq/1.5,300-j*10,200);
  // }

  noFill();
  translate(width/2,height/2);
  for(let j=0 ; j<300; j++){
    push();
    rotate(frameCount/10+j);
    stroke(240,240,200,50);
    rect(0,0,maxFreq/7,300-j*10,200);
    stroke(200,200,150,50);
    rect(0,0,harmonyFreq/1.5,300-j*10,200);
    pop();
  }
}

function drawSimpleVisual(){
  let lineFreq=map(maxFreq,0,1000,0,height);
  let lineHarmony = map(harmonyFreq, 0,1000,0,height);
  strokeWeight(100);
  stroke(239,245,66,50);
  line(width/4,height,width/4,height-lineFreq);
  stroke(66,135,245,50);
  line(width/4*3,height,width/4*3,height-lineHarmony);

}