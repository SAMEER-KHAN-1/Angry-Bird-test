const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;

let engine, world;
let cnv, restartButton;
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
let muted = false;
let newBest = false;
let paused = false;
let pauseStartFrame = 0;
const TOUCH_GRAB_RADIUS = 70;
const PIG_KILL_IMPACT = 4;
const POINTS_PER_PIG = 100;
const POINTS_PER_LEFTOVER_BIRD = 50;

let popOsc, popEnv;
let whooshNoise, whooshEnv;
let thudOsc, thudEnv;
let lastThudFrame = 0;
const THUD_IMPACT = 3;
const THUD_COOLDOWN_FRAMES = 6;

function preload() {
    backgroundImg = loadImage("sprites/bg.png");
    sprites.bird = loadImage("sprites/bird.png");
    sprites.wood1 = loadImage("sprites/wood1.png");
    sprites.wood2 = loadImage("sprites/wood2.png");
    sprites.enemy = loadImage("sprites/enemy.png");
    sprites.base = loadImage("sprites/base.png");
    sprites.ground = loadImage("sprites/ground.png");
}

function setup(){
    cnv = createCanvas(1200,400);
    frameRate(60);
    engine = Engine.create();
    world = engine.world;

    Matter.Events.on(engine, 'collisionStart', handleCollisions);

    restartButton = createButton('Restart');
    restartButton.class('restart-btn');
    restartButton.mousePressed(buildLevel);
    restartButton.hide();

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

    thudOsc = new p5.Oscillator('sine');
    thudEnv = new p5.Envelope();
    thudEnv.setADSR(0.001, 0.08, 0, 0.05);
    thudEnv.setRange(0.3, 0);
    thudOsc.amp(thudEnv);
    thudOsc.start();
    thudOsc.freq(90);

    highScore = Number(loadSetting('highScore')) || 0;
    muted = loadSetting('muted') === 'true';
    masterVolume(muted ? 0 : 1);

    buildLevel();
}

function loadSetting(key){
    try {
        return window.localStorage.getItem(key);
    } catch (e) {
        return null;
    }
}

function saveSetting(key, value){
    try {
        window.localStorage.setItem(key, String(value));
    } catch (e) {}
}

function unlockAudio(){
    var ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
}

function togglePause(){
    if (gameOver || pigsRemaining() === 0) return;
    paused = !paused;
    if (paused) {
        pauseStartFrame = frameCount;
        bird.cancelDrag();
    } else if (bird.launched) {
        bird.launchFrame += frameCount - pauseStartFrame;
    }
}

function toggleMute(){
    muted = !muted;
    masterVolume(muted ? 0 : 1);
    saveSetting('muted', muted);
}

function playPop(){
    popEnv.play(popOsc);
}

function playThud(){
    if (frameCount - lastThudFrame < THUD_COOLDOWN_FRAMES) return;
    lastThudFrame = frameCount;
    thudEnv.play(thudOsc);
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
    newBest = false;

    ground = new Ground(600,height,1200,20,sprites.base);
    platform = new Ground(150, 310, 300, 170, sprites.ground);

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
        if (hasEverLaunched && impact > THUD_IMPACT) {
            playThud();
        }
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
        if (highScore > 0) newBest = true;
        highScore = score;
        saveSetting('highScore', highScore);
    }
}

function draw(){
    background(backgroundImg);
    if (!paused) Engine.update(engine);

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

    if (!paused) checkBirdStatus();
    drawHUD();
    drawHint();
    if (paused) drawPauseOverlay();
}

function drawPauseOverlay(){
    push();
    fill(0, 120);
    noStroke();
    rect(0, 0, width, height);
    stroke(0, 180);
    strokeWeight(3);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(48);
    text("PAUSED", width / 2, height / 2);
    textSize(20);
    text("Press P to resume", width / 2, height / 2 + 40);
    pop();
}

function drawHint(){
    if (hasEverLaunched) return;
    push();
    stroke(0, 180);
    strokeWeight(3);
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
            if (bird.launched && !bird.removed) {
                Matter.Body.setStatic(bird.body, true);
            }
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
    stroke(0, 180);
    strokeWeight(3);
    fill(255);
    textSize(20);
    textAlign(LEFT, TOP);
    text("Pigs remaining: " + pigsRemaining(), 20, 15);
    text("Birds left: " + birdsRemaining, 20, 40);
    text("Score: " + score + "  (Best: " + highScore + ")", 20, 65);
    if (newBest) {
        fill(255, 215, 0);
        text("New best!", 20, 90);
        fill(255);
    }
    textAlign(RIGHT, TOP);
    text("Sound: " + (muted ? "off" : "on") + " (M)", width - 20, 15);
    text("Pause (P)", width - 20, 40);
    textAlign(LEFT, TOP);
    if (pigsRemaining() === 0) {
        textAlign(CENTER, CENTER);
        textSize(48);
        fill(255, 215, 0);
        text("LEVEL CLEARED!", width / 2, height / 2);
        textSize(20);
        fill(255);
        text("Press R or tap Restart", width / 2, height / 2 + 40);
        updateRestartButton(true);
    } else if (gameOver) {
        textAlign(CENTER, CENTER);
        textSize(48);
        fill(220, 40, 40);
        text("GAME OVER", width / 2, height / 2);
        textSize(20);
        fill(255);
        text("Press R or tap Restart", width / 2, height / 2 + 40);
        updateRestartButton(true);
    } else {
        updateRestartButton(false);
    }
    pop();
}

function updateRestartButton(show){
    if (!show) {
        restartButton.hide();
        return;
    }
    var rect = cnv.elt.getBoundingClientRect();
    restartButton.position(
        rect.left + window.pageXOffset + width / 2 - 45,
        rect.top + window.pageYOffset + height / 2 + 55
    );
    restartButton.show();
}

function keyPressed(){
    unlockAudio();
    if ((key === 'r' || key === 'R') && (gameOver || pigsRemaining() === 0)) {
        buildLevel();
    }
    if (key === 'm' || key === 'M') {
        toggleMute();
    }
    if (key === 'p' || key === 'P') {
        togglePause();
    }
}

function mousePressed(){
    unlockAudio();
    if (paused) return;
    bird.tryGrab(mouseX, mouseY);
}

function mouseDragged(){
    if (paused) return;
    bird.updateDrag(mouseX, mouseY);
}

function mouseReleased(){
    if (paused) return;
    if (bird.release()) {
        playWhoosh();
        hasEverLaunched = true;
    }
}

function touchedCanvas(event){
    return !event || event.target === cnv.elt;
}

function touchStarted(event){
    unlockAudio();
    if (!touchedCanvas(event)) return true;
    if (paused) return false;
    bird.tryGrab(mouseX, mouseY, TOUCH_GRAB_RADIUS);
    return false;
}

function touchMoved(event){
    if (!touchedCanvas(event)) return true;
    if (paused) return false;
    bird.updateDrag(mouseX, mouseY);
    return false;
}

function touchEnded(event){
    if (!touchedCanvas(event)) return true;
    if (paused) return false;
    if (bird.release()) {
        playWhoosh();
        hasEverLaunched = true;
    }
    return false;
}
