/// <reference path="../TSDef/p5.global-mode.d.ts" />

"use strict";

// Mathew Swabey
// PD controller using matter.js

// Module aliases
let Engines = Matter.Engine;
let Bodies = Matter.Bodies;
let Bodys = Matter.Body;
let Render = Matter.Render;
let Runner = Matter.Runner;
let Composite = Matter.Composite;
let Composites = Matter.Composites;
let Constraint = Matter.Constraint;

let bob; 
let cart;
let arm;
let angle = 0;
let error = 0;
let prevError = 0;
let engine;
let world;
let runner;

//Canvas size
const width = 1100;
const height = 600;

//Gain values
const Kp = 0.006;
const Kd = 0.2;
const nullGain = 0.0001; //Needs to be looooow
const desired = 800;

//Cart arm length
const armLength = 200;

function setup() {
  //Create the simulation environment
  let engine = Engines.create();
  let world = engine.world;
  
  let render = Render.create({
    engine: engine,
    element: document.body,
    options: {      
      width: width,
      height: height,
      wireframes: false
    }
  });  
  
  //Create the floor
  let road = Bodies.rectangle(width/2,height-25,width,50, {
    isStatic:true,
    angle: 0,
    friction: 0,
    restitution: 0.5,
    render: {
      fillStyle: '#333'
    }
  });
  
  //Create the walls
  let leftWall = Bodies.rectangle(25, height/2, 50, height, {
    isStatic: true,
    angle: 0,
    friction: 0,
    restitution: 1,
    render: {
      fillStyle: 'grey'
    }
  })
  
   let rightWall = Bodies.rectangle(width-25, height/2, 50, height, {
    isStatic: true,
    angle: 0,
    friction: 0,
    restitution: 1,
    render: {
      fillStyle: 'grey'
    }
  })
  
  //Create a cart and bob and constrain them to one another
  cart = Bodies.rectangle(400, 200, 40, 20, {
    angle: 0,
    friction: 0,
    restitution: 0,
    render: {
      fillStyle: 'red'
    }
  });
  
  bob = Bodies.circle(400, 0, 10, {
    angle: 0,
    friction: 0,
    restitution: 0.5,
    render: {
      fillStyle: 'blue'
    }
  });  

  let constraint = Constraint.create({bodyA: cart, bodyB: bob, length: armLength});
  
  //Add everything to the world 
  Composite.add(world, [
    road,
    leftWall,
    rightWall,
    cart,
    bob,
    constraint
  ]);
  
  
  Render.run(render);  
  runner = Runner.create();
  Runner.run(runner, engine);  
  
}

//Add a keypress function to push the bob
function keyPressed() {
  if (keyCode == RIGHT_ARROW) {
    let force = createVector(0.002, 0);
    Bodys.applyForce(bob, bob.position, force);
  }
  if (keyCode == LEFT_ARROW) {
    let force = createVector(-0.002, 0);
    Bodys.applyForce(bob, bob.position, force);
  }
}


function draw() { 
  //Calculate the angle, + PI/2 to make upright = 0 radians
  let arm = createVector();  
  arm.x = bob.position.x - cart.position.x;
  arm.y = bob.position.y - cart.position.y;
  let angle = arm.heading() + PI / 2;

  //Calculate the error. 
  if (angle > 0 && angle < PI) {
    error = (0 - angle);
  } else {
    error = (2 * PI) - angle;
  }
  error = error % (2 * PI);
  error = error - nullGain * (cart.position.x-desired);
  
  //Calculate the rate of change of error
  let deltaError = (error - prevError) / runner.delta;
  prevError = error;
    
  //P control
  let Pterm = Kp * error;
  
  //D control
  let Dterm = Kd * deltaError;
  
  //PD output (error is negative when arm is right of the cart, hence the negatives)
  let output = (-1 * Pterm) - Dterm;
  
  //Apply the force to the cart
  const force = createVector(output, 0);
  Bodys.applyForce(cart, cart.position, force);

}

