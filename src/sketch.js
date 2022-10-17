// Mathew Swabey
// PID controller using p5.js and matter.js


//Reference p5 definitions for Visual Studio Code
/// <reference path="../TSDef/p5.global-mode.d.ts" />
"use strict";

// Module aliases
const Engine = Matter.Engine;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Composite = Matter.Composite;
const Composites = Matter.Composites;
const Constraint = Matter.Constraint;

// Cart, bob and the distance constraint
let bob, cart, constraint;

// Previous error to track rate of change of error
let prevError = 0;

// Matter modules to build and run the simulation
let engine, render, runner, world;

// Canvas size
const width = 1100;
const height = 600;
const armLength = 200;

// Gain Sliders
let pSlider;
let dSlider;

function setup() {
  // Create the world and pendulum
  buildWorld();
  buildPendulum(); 

  // Create the gain sliders
  pSlider = createSlider(0, 0.007, 0.005, 0.001);
  createSpan('&ensp; Proportional Gain<br/>');
  dSlider = createSlider(0, 0.500, 0.200, 0.001);
  createSpan('&ensp; Derivative Gain<br/>'); 
  createSpan('Use the left and right arrows to destabalise the pendulum<br/>');
  let resetButton = createButton('Reset');
  resetButton.mousePressed(reset);
}

function draw() { 
  // Calculate the angle, + PI/2 to make upright = 0 radians
  let arm = createVector();  
  arm.x = bob.position.x - cart.position.x;
  arm.y = bob.position.y - cart.position.y;
  let angle = arm.heading() + PI / 2;

  // Calculate the error. 
  let error;
  if (angle > 0 && angle < PI) {
    error = (0 - angle);
  } else {
    error = (2 * PI) - angle;
  }
  error = error % (2 * PI);
  
  // Calculate the rate of change of error
  let deltaError = (error - prevError) / runner.delta;
  prevError = error;
    
  //P control
  let Pterm = pSlider.value() * error;
  
  //D control
  let Dterm = dSlider.value() * deltaError;
  
  //PD output (error is negative when arm is right of the cart, hence the negatives)
  let output = (-1 * Pterm) - Dterm;
  
  //Apply the force to the cart
  const force = createVector(output, 0);
  Body.applyForce(cart, cart.position, force);
}

function buildPendulum() {  
  // The cart
  cart = Bodies.rectangle(400, 200, 40, 20, {
    angle: 0,
    friction: 0,
    restitution: 0,
    render: {
      fillStyle: 'red'
    }
  });
  Composite.add(world,cart);
  
  // The bob
  bob = Bodies.circle(400, 0, 10, {
    angle: 0,
    friction: 0,
    restitution: 0.5,
    render: {
      fillStyle: 'blue'
    }
  });  
  Composite.add(world,bob);

  // Constrain the bob to the cart at the armLength
  constraint = Constraint.create({bodyA: cart, bodyB: bob, length: armLength});
  Composite.add(world,constraint);  

  // Start the renderer and runner
  Render.run(render);  
  runner = Runner.create();
  Runner.run(runner, engine);
}

function buildWorld() {
  // Create the simulation environment
  engine = Engine.create();
  world = engine.world;
  
  // Matter renderer. Renders to the document body
  render = Render.create({
    engine: engine,
    element: document.body,
    options: {      
      width: width,
      height: height,
      wireframes: false
    }
  });
  
  // Options for static world items
  const options = {
      isStatic: true,
      angle: 0,
      friction: 0,
      restitution: 1,
      render: {fillStyle: 'grey'}
  };
  
  // Create the floor and walls
  let road = Bodies.rectangle(width/2, height-25, width, 50, options);
  Composite.add(world,road);
  
  let leftWall = Bodies.rectangle(25, height/2, 50, height, options);
  Composite.add(world,leftWall);
  
  let rightWall = Bodies.rectangle(width-25, height/2, 50, height, options);
  Composite.add(world,rightWall); 
};

// Destabalise the bob with the left or right arrows
function keyPressed() {
  if (keyCode == RIGHT_ARROW) {
    let force = createVector(0.002, 0);
    Body.applyForce(bob, bob.position, force);
  }
  if (keyCode == LEFT_ARROW) {
    let force = createVector(-0.002, 0);
    Body.applyForce(bob, bob.position, force);
  }
}

function reset() {
  // Clear the cart, bob and their constraint
  Composite.clear(world, {cart,bob,constraint});

  // Reset the previous error and gain slider values
  prevError = 0;
  pSlider.value(0.005);
  dSlider.value(0.200);

  // Stop the renderer and runner
  Render.stop(render);
  Runner.stop(runner);

  // Rebuild the pendulum
  buildPendulum();
}
