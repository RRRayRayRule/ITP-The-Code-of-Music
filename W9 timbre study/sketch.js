//a copy just to make sure
//let mic = new Tone.UserMedia();
const love = new Tone.Player("samples/movie/marriage story.wav").toDestination();
let analyzer = new Tone.FFT(2048);
let waveform;
let nodes= [];
let movableNodes=[];
let line1Height;
let line2Height;
let clearButton;
let startButton;
let loaded=false;
let eyeImage; //the image eye
let eyesUp=[]; //the array group for storing all eyes drawn
let eyesDown=[]; //the array group for storing all eyes drawn
love.connect(analyzer);
//mic.open();

Tone.loaded().then(function(){
  loaded=true;
}) //detection for sound loaded

function preload(){
  eyeImage=loadImage("image/eye.gif");

}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB,100);
  clearButton = createButton("clear all nodes");
  startButton = createButton("start sound of love");
  clearButton.mousePressed(clearEverything);
  startButton.mousePressed(playLoveSound);
  line1Height=height/10*9;
  line2Height=height/3;
}

function draw() {
  background(0);
  strokeWeight(2);
  //drawing nodes on the contol line
  push();
  stroke(0,0,100,30);
  line(0,line1Height,width,line1Height);
  for(let node of nodes){
    fill(map(node,0,width,0,100));
    circle(node,line1Height,20);
  }
  pop();
  push();
  stroke(0,0,100,30);
  line(0,line2Height,width,line2Height);
  for(let movableNode of movableNodes){
    fill(movableNode.c);
    circle(movableNode.x,line2Height,20);
  }
  pop();
  waveform = analyzer.getValue();

  if(nodes.length>0){
  //drawing frequency waveform
  beginShape();
  noFill();
  stroke(209,13,100,30);
  for(let j =0; j<nodes.length+1; j++){
    let waveSectionHead;
    let waveSectionEnd;
    let spaceSectionHead;
    let spaceSectionEnd;
    
    if(j==0){
    waveSectionHead=0;
    spaceSectionHead=0;
    }else{
      waveSectionHead=nodes[j-1];
      spaceSectionHead=movableNodes[j-1].x;
    }

    if(j==nodes.length){
    waveSectionEnd=waveform.length;
    spaceSectionEnd=width;
    }else{
      waveSectionEnd=nodes[j];
      spaceSectionEnd=movableNodes[j].x;
    }

    for(let i=waveSectionHead ; i<waveSectionEnd ; i++){
      let x = map(i,waveSectionHead,waveSectionEnd,spaceSectionHead,spaceSectionEnd);
      let y = map(waveform[i],-50,-200,100,height);
      curveVertex(x,y);
    }
  }
  endShape();
}

  beginShape();
  noFill();
  stroke(355,73,80,50);
  fill(355,73,80,50);
    for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -50, -200, line1Height-150, line1Height+100);
    vertex(x, y);
  }
  endShape();

  //drawing eyes
  for(let eyeUp of eyesUp){
    eyeUp.show();
  }
  for(let eyeDown of eyesDown){
    eyeDown.show();
  }
}


//INTERACTION
function mouseClicked(){
  if(abs(mouseY-line1Height)<5){
  let nodeDragged=false;
  for(let node of nodes){
    let d = dist(mouseX,mouseY,node.x,line1Height);
    if(d<10){
      nodeDragged=true;
      break; //stop finding when found one
    }
  }
  if(!nodeDragged){
    nodes.push(mouseX);
    nodes.sort((a,b) => a-b); //sorting the nodes in ascending order
    let newNode = {
      x:mouseX,
      c:map(mouseX,0,width,0,100)
    }
    movableNodes.push(newNode);
    movableNodes.sort((a,b)=>a.x-b.x); //sorting the nodes in ascending order of element x
    // console.log(nodes);
    // console.log(movableNodes);
  }
}
}

function mouseDragged(){
  if(abs(mouseY-line2Height<15)){
    for(let movableNode of movableNodes){
      let d = dist(mouseX,mouseY,movableNode.x,line2Height);
      if(d<10){
        movableNode.x=mouseX;
        break;
      }
    }
  }
}

function keyPressed(){
  if(key === "e"){
    console.log("new eyes added");
    let newEyeUp= new Eyes(mouseX,mouseY,-PI/2*3);
    eyesUp.push(newEyeUp);
  }

  if(key === "r"){
    console.log("new eyes added");
    let newEyeDown= new Eyes(mouseX,mouseY,PI/2*3);
    eyesDown.push(newEyeDown);
  }

  if(key === "t"){
    console.log(waveform);
  }
}

//DEFINED FUNCTION
function clearEverything(){
  nodes.length=0;
  movableNodes=[];
  eyesUp=[];
  eyesDown=[];
}

function playLoveSound(){
  if(loaded){
    love.start();
  }
}


//DEFINED CLASS
class Eyes{
  constructor(x,y,deg){
    this.x=x;
    this.y=y;
    this.deg=deg;
  }

  show(){
    push();
    translate(this.x,this.y);
    rotate(this.deg);
    imageMode(CENTER);
    eyeImage.resize(150,150);
    image(eyeImage,0,0);
    pop();
  }
}