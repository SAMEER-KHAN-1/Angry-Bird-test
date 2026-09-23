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
let birdsRemaining = 5;
let gameOver = false;
let score = 0;
let highScore = 0;
let bonusAwarded = false;
let hasEverLaunched = false;
const PIG_KILL_IMPACT = 4;
const POINTS_PER_PIG = 100;
const POINTS_PER_LEFTOVER_BIRD = 50;

let popOsc, popEnv;
let whooshNoise, whooshEnv;

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

    Matter.Events.on(engine, 'collisionStart', handleCollisions);

    popOsc = new p5.Oscillator('sine');
    popEnv = new p5.Envelope();
    popEnv.setADSR(0.001, 0.1, 0, 0.05);
    popEnv.setRange(0.4, 0);
    popOsc.amp(popEnv);
    popOsc.start();
    popOsc.freq(700);

    whooshNoise = new p5.Noise('white');
    whooshEnv = new p5.Envelope();
    whooshEnv.setADSR(0.01, 0.15, 0, 0.05);
    whooshEnv.setRange(0.2, 0);
    whooshNoise.amp(whooshEnv);
    whooshNoise.start();

    highScore = getItem('highScore') || 0;

    buildLevel();
}

function playPop(){
    popEnv.play(popOsc);
}

function playWhoosh(){
    whooshEnv.play(whooshNoise);
}

function buildLevel(){
    World.clear(world, false);
    birdsRemaining = 5;
    gameOver = false;
    score = 0;
    bonusAwarded = false;

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
        if (p.body === body && p.alive) {
            p.remove();
            playPop();
            addScore(POINTS_PER_PIG);
        }
    }
}

function addScore(points){
    score += points;
    if (score > highScore) {
        highScore = score;
        storeItem('highScore', highScore);
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

    checkBirdStatus();
    drawHUD();
    drawHint();
}

function drawHint(){
    if (hasEverLaunched) return;
    push();
    noStroke();
    fill(255);
    textSize(18);
    textAlign(CENTER, TOP);
    text("Drag the bird back and release to launch!", width / 2, 15);
    pop();
}

function checkBirdStatus(){
    if (pigsRemaining() === 0) {
        if (!bonusAwarded) {
            bonusAwarded = true;
            addScore(birdsRemaining * POINTS_PER_LEFTOVER_BIRD);
        }
        return;
    }
    if (gameOver) return;
    if (bird.launched && (bird.isOffscreen() || bird.isResting())) {
        bird.removeFromWorld();
        birdsRemaining--;
        if (birdsRemaining > 0) {
            bird = new Bird(100, 100);
        } else {
            gameOver = true;
        }
    }
}

function pigsRemaining(){
    return pigs.filter(function(p){ return p.alive; }).length;
}

function drawHUD(){
    push();
    noStroke();
    fill(255);
    textSize(20);
    textAlign(LEFT, TOP);
    text("Pigs remaining: " + pigsRemaining(), 20, 15);
    text("Birds left: " + birdsRemaining, 20, 40);
    text("Score: " + score + "  (Best: " + highScore + ")", 20, 65);
    if (pigsRemaining() === 0) {
        textAlign(CENTER, CENTER);
        textSize(48);
        fill(255, 215, 0);
        text("LEVEL CLEARED!", width / 2, height / 2);
        textSize(20);
        fill(255);
        text("Press R to restart", width / 2, height / 2 + 40);
    } else if (gameOver) {
        textAlign(CENTER, CENTER);
        textSize(48);
        fill(220, 40, 40);
        text("GAME OVER", width / 2, height / 2);
        textSize(20);
        fill(255);
        text("Press R to restart", width / 2, height / 2 + 40);
    }
    pop();
}

function keyPressed(){
    if ((key === 'r' || key === 'R') && (gameOver || pigsRemaining() === 0)) {
        buildLevel();
    }
}

function mousePressed(){
    bird.tryGrab(mouseX, mouseY);
}

function mouseDragged(){
    bird.updateDrag(mouseX, mouseY);
}

function mouseReleased(){
    if (bird.release()) {
        playWhoosh();
        hasEverLaunched = true;
    }
}

function touchStarted(){
    bird.tryGrab(mouseX, mouseY);
    return false;
}

function touchMoved(){
    bird.updateDrag(mouseX, mouseY);
    return false;
}

function touchEnded(){
    if (bird.release()) {
        playWhoosh();
        hasEverLaunched = true;
    }
    return false;
}
