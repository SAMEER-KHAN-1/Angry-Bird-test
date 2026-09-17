const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;

let engine, world;
let backgroundImg, ground, platform;
let box1, box2, box3, box4, box5;
let pig1, pig3;
let log1, log3, log4, log5;
let bird;
let sprites = {};
let pigs = [];
const PIG_KILL_IMPACT = 4;

function preload() {
    backgroundImg = loadImage("sprites/bg.png");
    sprites.bird = loadImage("sprites/bird.png");
    sprites.wood1 = loadImage("sprites/wood1.png");
    sprites.wood2 = loadImage("sprites/wood2.png");
    sprites.enemy = loadImage("sprites/enemy.png");
}

function setup(){
    createCanvas(1200,400);
    engine = Engine.create();
    world = engine.world;

    ground = new Ground(600,height,1200,20);
    platform = new Ground(150, 310, 300, 170);

    box1 = new Box(700,320,70,70);
    box2 = new Box(920,320,70,70);
    pig1 = new Pig(810, 350);
    log1 = new Log(810,260,300, PI/2);

    box3 = new Box(700,240,70,70);
    box4 = new Box(920,240,70,70);
    pig3 = new Pig(810, 220);

    log3 =  new Log(810,180,300, PI/2);

    box5 = new Box(810,160,70,70);
    log4 = new Log(760,120,150, PI/7);
    log5 = new Log(870,120,150, -PI/7);

    bird = new Bird(100,100);

    pigs = [pig1, pig3];

    Matter.Events.on(engine, 'collisionStart', handleCollisions);
}

function handleCollisions(event){
    for (var pair of event.pairs) {
        var relVel = Matter.Vector.sub(pair.bodyA.velocity, pair.bodyB.velocity);
        var impact = Matter.Vector.magnitude(relVel);
        if (impact > PIG_KILL_IMPACT) {
            killIfPig(pair.bodyA);
            killIfPig(pair.bodyB);
        }
    }
}

function killIfPig(body){
    for (var p of pigs) {
        if (p.body === body) {
            p.remove();
        }
    }
}

function draw(){
    background(backgroundImg);
    Engine.update(engine);

    box1.display();
    box2.display();
    ground.display();
    pig1.display();
    log1.display();

    box3.display();
    box4.display();
    pig3.display();
    log3.display();

    box5.display();
    log4.display();
    log5.display();

    bird.display();
    platform.display();
}

function mousePressed(){
    bird.tryGrab(mouseX, mouseY);
}

function mouseDragged(){
    bird.updateDrag(mouseX, mouseY);
}

function mouseReleased(){
    bird.release();
}
