// Variables for the HandPose model
let handpose;
let video;
let predictions = [];
let particles = [];
let prevFingerPos = { 
  thumb: null,
  indexFinger: null,
  middleFinger: null,
  ringFinger: null,
  pinky: null,
  palmBase: null,
};

// Line thickness and dynamic colors
let baseColors = {
  thumb: [[255, 255, 255]], // White
  indexFinger: [255, 204, 0], // Orange
  middleFinger: [25, 255, 255], // Blue
  ringFinger: [255, 204, 0], // Orange
  pinky: [255, 255, 255], // White
  palmBase: [0, 0, 0], // Orange for wrist
};

// Persistent canvas for particles
let trailCanvas;
let canvas; // To store the reference to the canvas

function setup() {
  canvas = createCanvas(310 * 2, 176 * 2); // Store canvas reference
  centerCanvas(); // Center the canvas on the screen
  trailCanvas = createGraphics(width, height);
  trailCanvas.background(20); // Dark initial background for the trail canvas

  video = createCapture(VIDEO);
  video.size(width, height);
  print("loading");
  handpose = ml5.handpose(video, modelReady);
  video.hide();

  // Listen for spacebar press
  window.addEventListener("keydown", handleKeyPress);
  
  // Adjust canvas position when window is resized
  window.addEventListener("resize", centerCanvas);
}

function centerCanvas() {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  canvas.position(x, y); // Use the stored canvas instance
}

function modelReady() {
  console.log("Model ready!");
  handpose.on("predict", (results) => {
    predictions = results;
  });
}

function draw() {
  // Display video feed
  push();
  translate(width, 0);
  scale(-1, 1); // Mirroring for a more natural interaction
  tint(255, 50); // Semi-transparent video
  image(video, 0, 0, width, height);
  pop();

  // Display persistent drawing layer
  image(trailCanvas, 0, 0);

  // Draw particles
  updateAndDrawParticles();

  // Draw interactive elements
  if (predictions.length > 0) {
    createParticlesFromHand();
  
  } else {
    displayNoHandMessage();
  }
}

function createParticlesFromHand() {
  let prediction = predictions[0];

  // Define finger annotations
  let fingers = [
    { name: "thumb", points: prediction.annotations.thumb[3] },
    { name: "indexFinger", points: prediction.annotations.indexFinger[3] },
    { name: "middleFinger", points: prediction.annotations.middleFinger[3] },
    { name: "ringFinger", points: prediction.annotations.ringFinger[3] },
    { name: "pinky", points: prediction.annotations.pinky[3] },
  ];

  for (let finger of fingers) {
    let tip = finger.points;
    let x = width - tip[0]; // Mirror horizontally
    let y = tip[1];
    let color = baseColors[finger.name];

    // Add particles at the finger tip
    addParticles(x, y, color);
  }
}

function addParticles(x, y, color) {
  for (let i = 0; i < 10; i++) { // Emit multiple particles per frame
    particles.push(new Particle(x, y, color));
  }
}

function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.draw(trailCanvas);
    if (p.isDead()) {
      particles.splice(i, 1); // Remove dead particles
    }
  }
}

class Particle {
  constructor(x, y, color) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 8)); // Random velocity
   
    this.lifespan = 100; // Particle lifespan
    this.color = color;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 10; // Decrease lifespan
  }

  draw(canvas) {
    canvas.noStroke();
    canvas.fill(...this.color, this.lifespan);
    canvas.ellipse(this.pos.x, this.pos.y, 1); // Particle size
  }

  isDead() {
    return this.lifespan <= 0;
  }
}

function handleKeyPress(event) {
  if (event.code === "Space") {
    takeScreenshot();
  }
}

function takeScreenshot() {
  // Temporarily render trailCanvas to main canvas for screenshot
  image(trailCanvas, 0, 0);
  saveCanvas("screenshot", "png");
  console.log("Screenshot taken!");
}

function displayNoHandMessage() {
  // Reset finger positions
  prevFingerPos = {
    thumb: null,
    indexFinger: null,
    middleFinger: null,
    ringFinger: null,
    pinky: null,
    palmBase: null,
  };

 

}
