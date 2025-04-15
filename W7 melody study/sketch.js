//chord and melody_Dm7 set
var chordDm7 = ["D4","F4","A4","C5"];
var bassDm7random = ["A1","F1","D1","C1"];
var melodyDm7one = ["F2","A1","F2","A2","F2","A1","F2","A2","F2","A1","F2","A2","F2","E2","D2","C2"];
//chord and melody_Csus2 set
var chordCsus2 = ["C4","D4","G4"];
var bassCsus2random = ["C1","D1","G1"];
var melodyCsus2one = ["F2","E2","D2","C2","B1","C2","B1","A1","B1","A1","G1","A1","B1","C2","B1","A1"];
//chord and melody_G7 set
var chordG7 = ["B4","D4","G4","F4"];
var bassG7random = ["B1","D1","G1","F1"];
var melodyG7one = ["B1","A1","B1","C2","D2","E2","G2","E2","D2","A2","G2","F2","E2","D2","C2","B1"];
//just a button
let button;
//get amplitude
const mic = new Tone.UserMedia(); // Capture audio from the microphone
const meter = new Tone.Meter();   // Meter to analyze the volume (RMS)
mic.open();
meter.normalRange = true;
meter.channels = 1;
mic.connect(meter); // Connect the mic to the meter



var playedChord = chordDm7;
var playedBass = bassDm7random;
var playedMelody = melodyDm7one;
var playedIndex = "Dm7";


//tone related setting
Tone.Transport.timeSignature = [16,4];
Tone.Transport.bpm.value = 120;
//Sampler
const player = new Tone.Sampler(
  {
  "A1" : "samples/casio/A1.mp3",
  "A2" : "samples/casio/A2.mp3"
  }
).toDestination();

//scheduleRepeat for Dm7 set
Tone.Transport.scheduleRepeat(playDm7Chord, "2n");
Tone.Transport.scheduleRepeat(playDm7BassRandom,"4n");
Tone.Transport.scheduleRepeat(playDm7Melodyone,"4n");

function playDm7Chord(time){
  player.triggerAttack(playedChord,time);
}
function playDm7BassRandom(time){
  let beat = Tone.Transport.position.split(":")[1];
  if(beat % 16 == 0){
    for(i=0; i<4; i++){
      let j =Math.floor(random(playedBass.length));
      console.log(j);
      player.triggerAttack(playedBass[j]);
    }
  }
}
function playDm7Melodyone(time){
  let beat = Tone.Transport.position.split(":")[1];
  player.triggerAttack(playedMelody[beat]);
}


function keyPressed(){
  if(playedIndex == "Dm7"){
    playedIndex = "Csus2"
    playedChord = chordCsus2;
    playedBass = bassCsus2random;
    playedMelody = melodyCsus2one;
  }else if(playedIndex == "Csus2"){
    playedIndex = "G7"
    playedChord = chordG7;
    playedBass = bassG7random;
    playedMelody = melodyG7one;
  }else if(playedIndex == "G7"){
    playedIndex = "Dm7"
    playedChord = chordDm7;
    playedBass = bassDm7random;
    playedMelody = melodyDm7one;
  }
}
// //scheduleRepeat for Csus2 set
// Tone.Transport.scheduleRepeat(playCsus2Chord, "2n");
// Tone.Transport.scheduleRepeat(playCsus2BassRandom,"4n");
// Tone.Transport.scheduleRepeat(playCsus2Melodyone,"4n");

// function playCsus2Chord(time){
//   player.triggerAttack(chordCsus2,time);
// }
// function playCsus2BassRandom(time){

//   let beat = Tone.Transport.position.split(":")[1];
//   if(beat % 16 == 0){
//     for(i=0; i<3; i++){
//       let j =Math.floor(random(bassCsus2random.length));
//       console.log(j);
//       player.triggerAttack(bassCsus2random[j]);
//     }
//   }
// }
// function playCsus2Melodyone(time){
//   let beat = Tone.Transport.position.split(":")[1];
//   player.triggerAttack(melodyCsus2one[beat]);
// }

// //scheduleRepeat for G7 set
// Tone.Transport.scheduleRepeat(playG7Chord, "2n");
// Tone.Transport.scheduleRepeat(playG7BassRandom,"4n");
// Tone.Transport.scheduleRepeat(playG7Melodyone,"4n");

// function playG7Chord(time){
//   player.triggerAttack(chordG7,time);
// }
// function playG7BassRandom(time){

//   let beat = Tone.Transport.position.split(":")[1];
//   if(beat % 16 == 0){
//     for(i=0; i<3; i++){
//       let j =Math.floor(random(bassG7random.length));
//       console.log(j);
//       player.triggerAttack(bassG7random[j]);
//     }
//   }
// }
// function playG7Melodyone(time){
//   let beat = Tone.Transport.position.split(":")[1];
//   player.triggerAttack(melodyG7one[beat]);
// }

//other function
function setup() {
    createCanvas(480, 480);
    button = createButton('play');
    button.mouseClicked(togglePlay);
}

function draw(){
  background(200);
  const rms = meter.getValue();
  const threshold = 0.05;
 
  if(rms>threshold){
    console.log(rms);
    console.log("snap detected");
    snapDetected();
  }
}


function togglePlay(){
  console.log("button pressed!");
  if(Tone.Transport.state == "started"){
    Tone.Transport.stop();
    button.html('play');
  }else{
    if(player.loaded){
      Tone.Transport.start();
      button.html('stop');
    }
  }
}

function snapDetected(){
  if(playedIndex == "Dm7"){
    playedIndex = "Csus2"
    playedChord = chordCsus2;
    playedBass = bassCsus2random;
    playedMelody = melodyCsus2one;
  }else if(playedIndex == "Csus2"){
    playedIndex = "G7"
    playedChord = chordG7;
    playedBass = bassG7random;
    playedMelody = melodyG7one;
  }else if(playedIndex == "G7"){
    playedIndex = "Dm7"
    playedChord = chordDm7;
    playedBass = bassDm7random;
    playedMelody = melodyDm7one;
  }
}

