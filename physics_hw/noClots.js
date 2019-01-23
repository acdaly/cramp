// Daniel Shiffman
// Matter.js + p5.js Examples
// This example is based on examples from: http://brm.io/matter-js/

Matter.use('matter-attractors');

function Shape(body, color){
  this.body = body;
  this.color = color;
}


var PILL_NUM = 12;
var CLOT_NUM = 150;

var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Composite = Matter.Composite;
var Events = Matter.Events
var MouseConstraint = Matter.MouseConstraint
var Mouse = Matter.Mouse;

var mouseObject;

var mouseLock = false;

var shapes = [];
var pills = [];
var clots = [];

var blue;
var red;

var engine;

var boxA;
var boxB;
var ground;

function setup() {
  blue = color(0, 255, 255, 200);
  red = color(105, 10, 10, 150);
  createCanvas(500, 600);
  background(237, 68, 91);

  // create an engine
  engine = Engine.create();

  setInterval(function(){ 
    if (clots.length < CLOT_NUM + 50){
      var offsetX = Math.random() * 800 - 250;
      var offsetY = Math.random() * 800 - 250;
      createClots(1, window.width/2 + offsetX, window.height/2 + offsetY); 
    }
  }, 100);
  setInterval(function(){if (pills.length > 0) deletePill()}, 1000);
  setInterval(function(){if (clots.length > 0) deleteClot(clots.length - 1)}, 500);
    // create a body with an attractor
  var attractiveBody = Bodies.circle(
    window.width/2,
    window.height/2,
    2, 
    {
    isStatic: true,

    // example of an attractor function that 
    // returns a force vector that applies to bodyB
    plugin: {
      attractors: [
        function(bodyA, bodyB) {
          return {
            x: (bodyA.position.x - bodyB.position.x) * 1e-6,
            y: (bodyA.position.y - bodyB.position.y) * 1e-6,
          };
        }
      ]
    }
  });


  mouseObject = Bodies.circle(0, 0, 30);

  mouseObject.friction = 0.1;
  mouseObject.restitution = 3;
  mouseObject.frictionAir = 0.001;
  shapes.push(mouseObject)
  World.add(engine.world, mouseObject);

  World.add(engine.world, attractiveBody);

  attractiveBody.friction = 0.1;
  attractiveBody.restitution = 0.8;
  attractiveBody.frictionAir = 0.001;

  engine.world.gravity.scale = 0;

  // run the engine
  Engine.run(engine);


  shapes.push(attractiveBody);
  var pillX = (Math.random() * 500);
  var pillY = Math.random() * 500;
  setTimeout(function(){createPills(PILL_NUM, pillX, pillY)}, 3000);
  var clotX = (Math.random() * 500);
  var clotY = Math.random() * 500;
  createClots(CLOT_NUM, clotX, clotY);


   // add mouse control
    var mouse = Mouse.create(),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    World.add(engine.world, mouseConstraint);

}

function deletePill(){
  World.remove(engine.world, pills[pills.length - 1].body);
  pills.splice(pills.length - 1, 1);
}

function createPills(pillNum, xPos, yPos){
  for (var i = 0; i < pillNum; i++){
    var offset = Math.random() * 20 - 10;
    var pill = Bodies.circle(xPos+ offset, yPos+ offset, 20, 20);

    pill.friction = 1;
    pill.restitution = 1;
    pill.frictionAir = 0.001;
    pill.mass = 1000;

    var p = new Shape(pill, 
      color((0 + Math.random()*30), 255- Math.random()*30, 255- Math.random()*30, 10));
    
    pills.push(p);
    
    World.add(engine.world, p.body);
    
    pill = Matter.Body.scale(pill, 0.5, 1);
    
  }
  
}

function createClots(clotNum, xPos, yPos){
  for (var i = 0; i < clotNum; i++){


    var clotRadius = Math.random() * 7 + 2;
    var sides = int(Math.random() * 6)
    var clot = Bodies.polygon(xPos, yPos, sides, clotRadius);
    clot.friction = 1;
    clot.restitution = 1.2;
    clot.frictionAir = 0.001;

    var c = new Shape(clot, color(125 + Math.random()*30, 0+ Math.random()*30, 0+ Math.random()*30, 150))

    World.add(engine.world, clot);
    clots.push(c);
    clot = Matter.Body.scale(clot, 0.8, 1);
  }
  
}

function drawShape(shape, fillColor){

    var vertices = shape.vertices;
    fill(fillColor);
    beginShape();

    for (var i = 0; i < vertices.length; i++) {
      vertex(vertices[i].x, vertices[i].y);
    }
    endShape();
}

function drawShapes() {

  // for (var s = 0; s < shapes.length; s++){
  //   drawShape(shapes[s], color(0, 10, 10, 255))
  // }
  for (var p = 0; p < pills.length; p++){
    drawShape(pills[p].body, pills[p].color);
    
  }
  for (var c = 0; c < clots.length; c++){
    drawShape(clots[c].body, clots[c].color)
  }
  
}

function deleteClot(clotIndex){
  World.remove(engine.world, clots[clotIndex].body)
  clots.splice(clotIndex, 1);
}

function checkPillCollisions(){

  for (var p = 0; p < pills.length; p++){
    for (var c = 0; c < clots.length; c++){

      var collision = Matter.SAT.collides(clots[c].body, pills[p].body);
      if (collision.collided) {
  
        Matter.Composite.remove(engine.world, clots[c].body);
        deleteClot(c);
      }
  }
}
}



// Using p5 to render
function draw() {
  background(237, 68, 91, 5)
  // I could ask for everything in the world
  // var bodies = Composite.allBodies(engine.world);

  //background(237, 68, 91);

  if (mouseIsPressed && !mouseLock){
    mouseLock = true;
    setTimeout(function(){mouseLock = false;}, 300)
    createPills(4, mouseX, mouseY);
  }
 
  var mousePos = Matter.Vector.create(mouseX, mouseY);
  Matter.Body.setPosition(mouseObject, mousePos);
  // Basic demo
  // Getting vertices of each object
  noStroke();
  drawShapes();
  checkPillCollisions();


}
