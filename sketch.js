const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;

let engine, world;
let cnv, restartButton;
let restartButtonLabel = '';
let backgroundImg, ground, platform;
let currentLevel = 0;
let unlockedLevel = 0;
let currentBestStars = 0;
let levelObjects = [];
let bird;
let sprites = {};
let pigs = [];
let birdsRemaining = 5;
let gameOver = false;
let score = 0;
let highScore = 0;
let bonusAwarded = false;
let hasEverLaunched = false;
let shotFiredThisLevel = false;
let muted = false;
let newBest = false;
let particles = [];
let popups = [];
let starsEarned = 0;
let paused = false;
let pauseStartFrame = 0;
const TOUCH_GRAB_RADIUS = 70;
const PIG_KILL_IMPACT = 4;
const WOOD_DAMAGE_THRESHOLD = 5;
const WOOD_DAMAGE_FACTOR = 8;
const POINTS_PER_BLOCK = 25;
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
    engine = Engine.create({
        positionIterations: 10,
        velocityIterations: 8
    });
    world = engine.world;

    Matter.Events.on(engine, 'collisionStart', handleCollisions);

    restartButton = createButton('Restart');
    restartButton.class('restart-btn');
    restartButton.mousePressed(onRestartButton);
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

    muted = loadSetting('muted') === 'true';
    masterVolume(muted ? 0 : 1);

    unlockedLevel = constrain(Number(loadSetting('unlockedLevel')) || 0, 0, LEVELS.length - 1);
    currentLevel = unlockedLevel;

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

function highScoreKey(){
    return 'highScore_level' + (currentLevel + 1);
}

function loadHighScore(){
    var saved = loadSetting(highScoreKey());
    if (saved === null && currentLevel === 0) {
        saved = loadSetting('highScore');
    }
    return Number(saved) || 0;
}

function bestStarsFor(levelIndex){
    return Number(loadSetting('stars_level' + (levelIndex + 1))) || 0;
}

function recordProgress(){
    if (starsEarned > currentBestStars) {
        currentBestStars = starsEarned;
        saveSetting('stars_level' + (currentLevel + 1), starsEarned);
    }
    if (hasNextLevel() && currentLevel + 1 > unlockedLevel) {
        unlockedLevel = currentLevel + 1;
        saveSetting('unlockedLevel', unlockedLevel);
    }
}

function selectLevel(levelIndex){
    if (levelIndex < 0 || levelIndex >= LEVELS.length) return;
    if (levelIndex > unlockedLevel || levelIndex === currentLevel) return;
    currentLevel = levelIndex;
    buildLevel();
}

function hasNextLevel(){
    return currentLevel < LEVELS.length - 1;
}

function advanceLevel(){
    if (!hasNextLevel()) return;
    currentLevel++;
    buildLevel();
}

function onRestartButton(){
    if (pigsRemaining() === 0 && hasNextLevel()) {
        advanceLevel();
    } else {
        buildLevel();
    }
}

function createLevelObject(def){
    if (def.type === 'box') return new Box(def.x, def.y, def.w, def.h);
    if (def.type === 'log') return new Log(def.x, def.y, def.length, def.angle);
    if (def.type === 'pig') return new Pig(def.x, def.y);
    throw new Error("Unknown level object type: " + def.type);
}

function buildLevel(){
    World.clear(world, false);
    var level = LEVELS[currentLevel];
    birdsRemaining = level.birds;
    highScore = loadHighScore();
    currentBestStars = bestStarsFor(currentLevel);
    gameOver = false;
    score = 0;
    bonusAwarded = false;
    newBest = false;
    particles = [];
    popups = [];
    starsEarned = 0;
    shotFiredThisLevel = false;

    ground = new Ground(600,height,1200,20,sprites.base);
    platform = new Ground(150, 310, 300, 170, sprites.ground);

    levelObjects = level.objects.map(createLevelObject);
    pigs = levelObjects.filter(function(o){ return o instanceof Pig; });

    bird = new Bird(100,100);
}

function handleCollisions(event){
    for (var pair of event.pairs) {
        var relVel = Matter.Vector.sub(pair.bodyA.velocity, pair.bodyB.velocity);
        var impact = Matter.Vector.magnitude(relVel);
        if (!shotFiredThisLevel) continue;
        if (impact > THUD_IMPACT) {
            playThud();
        }
        if (impact > PIG_KILL_IMPACT) {
            killIfPig(pair.bodyA);
            killIfPig(pair.bodyB);
        }
        if (impact > WOOD_DAMAGE_THRESHOLD) {
            damageBlock(pair.bodyA, impact);
            damageBlock(pair.bodyB, impact);
        }
    }
}

function damageBlock(body, impact){
    var block = levelObjects.find(function(o){ return o.body === body; });
    if (!block || !block.breakable || !block.alive) return;
    block.health -= (impact - WOOD_DAMAGE_THRESHOLD) * WOOD_DAMAGE_FACTOR;
    if (block.health <= 0) {
        spawnPopEffect(block.body.position.x, block.body.position.y, [181, 132, 76]);
        block.remove();
        addScore(POINTS_PER_BLOCK, block.body.position.x, block.body.position.y);
    }
}

function cullOffscreenObjects(){
    for (var obj of levelObjects) {
        if (!obj.alive) continue;
        var p = obj.body.position;
        if (p.x > -100 && p.x < width + 100 && p.y < height + 100) continue;
        obj.remove();
        if (obj instanceof Pig) {
            playPop();
            addScore(POINTS_PER_PIG);
        }
    }
}

function killIfPig(body){
    for (var p of pigs) {
        if (p.body === body && p.alive) {
            spawnPopEffect(p.body.position.x, p.body.position.y);
            p.remove();
            playPop();
            addScore(POINTS_PER_PIG, p.body.position.x, p.body.position.y);
        }
    }
}

function spawnPopEffect(x, y, color){
    for (var i = 0; i < 14; i++) {
        var angle = random(TWO_PI);
        var speed = random(1, 4);
        particles.push({
            x: x,
            y: y,
            vx: cos(angle) * speed,
            vy: sin(angle) * speed - 1,
            life: 30,
            color: color || [140, 220, 90],
            size: random(4, 9)
        });
    }
}

function updateParticles(){
    for (var pt of particles) {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.15;
        pt.life--;
    }
    particles = particles.filter(function(pt){ return pt.life > 0; });
}

function drawParticles(){
    push();
    noStroke();
    for (var pt of particles) {
        fill(pt.color[0], pt.color[1], pt.color[2], 255 * pt.life / 30);
        ellipse(pt.x, pt.y, pt.size, pt.size);
    }
    pop();
}

function updatePopups(){
    for (var pu of popups) {
        pu.y -= 0.8;
        pu.life--;
    }
    popups = popups.filter(function(pu){ return pu.life > 0; });
}

function drawPopups(){
    push();
    stroke(0, 180);
    strokeWeight(3);
    textSize(22);
    textAlign(CENTER, CENTER);
    for (var pu of popups) {
        fill(255, 215, 0, 255 * pu.life / 45);
        text("+" + pu.points, pu.x, pu.y);
    }
    pop();
}

function addScore(points, x, y){
    if (x !== undefined) {
        popups.push({ x: x, y: y, points: points, life: 45 });
    }
    score += points;
    if (score > highScore) {
        if (highScore > 0) newBest = true;
        highScore = score;
        saveSetting(highScoreKey(), highScore);
    }
}

function draw(){
    background(backgroundImg);
    if (!paused) Engine.update(engine);

    ground.display();
    for (var obj of levelObjects) {
        obj.display();
    }

    drawSlingshot();
    bird.display();
    platform.display();

    if (!paused) {
        updateParticles();
        updatePopups();
    }
    drawParticles();
    drawPopups();

    if (!paused) {
        cullOffscreenObjects();
        checkBirdStatus();
    }
    drawHUD();
    drawHint();
    if (paused) drawPauseOverlay();
}

function drawSlingshot(){
    push();
    stroke(101, 67, 33);
    strokeCap(ROUND);
    strokeWeight(12);
    line(100, 230, 100, 145);
    strokeWeight(9);
    line(100, 145, 85, 60);
    line(100, 145, 115, 60);
    pop();
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
    if (bird.canBoost() && !paused) {
        push();
        stroke(0, 180);
        strokeWeight(3);
        fill(255, 215, 0);
        textSize(18);
        textAlign(CENTER, TOP);
        text("Tap or click to boost!", width / 2, 15);
        pop();
        return;
    }
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
            var unused = unusedBirds();
            starsEarned = unused >= 3 ? 3 : (unused >= 1 ? 2 : 1);
            addScore(unused * POINTS_PER_LEFTOVER_BIRD);
            recordProgress();
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

function unusedBirds(){
    return birdsRemaining - (bird.launched ? 1 : 0);
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
    text("Birds left:", 20, 40);
    var iconX = 20 + textWidth("Birds left:") + 8;
    imageMode(CORNER);
    for (var i = 0; i < birdsRemaining; i++) {
        image(sprites.bird, iconX + i * 26, 41, 22, 22);
    }
    text("Score: " + score + "  (Best: " + highScore + ")", 20, 65);
    if (newBest) {
        fill(255, 215, 0);
        text("New best!", 20, 90);
        fill(255);
    }
    textAlign(RIGHT, TOP);
    text("Sound: " + (muted ? "off" : "on") + " (M)", width - 20, 15);
    text("Pause (P)", width - 20, 40);
    text("Level " + (currentLevel + 1) + " / " + LEVELS.length, width - 20, 65);
    strokeWeight(2);
    for (var b = 0; b < 3; b++) {
        fill(b < currentBestStars ? color(255, 215, 0) : color(90));
        drawStar(width - 31 - (2 - b) * 26, 104, 5, 12);
    }
    strokeWeight(3);
    fill(255);
    textAlign(LEFT, TOP);
    if (pigsRemaining() === 0) {
        for (var s = 0; s < 3; s++) {
            if (s < starsEarned) {
                fill(255, 215, 0);
            } else {
                fill(90);
            }
            drawStar(width / 2 + (s - 1) * 70, height / 2 - 70, 13, 30);
        }
        textAlign(CENTER, CENTER);
        textSize(48);
        fill(255, 215, 0);
        text(hasNextLevel() ? "LEVEL CLEARED!" : "ALL LEVELS CLEARED!", width / 2, height / 2);
        textSize(20);
        fill(255);
        text(hasNextLevel() ? "Press N for the next level, R to retry" : "Press R to play this level again", width / 2, height / 2 + 40);
        updateRestartButton(true, hasNextLevel() ? "Next Level" : "Replay");
    } else if (gameOver) {
        textAlign(CENTER, CENTER);
        textSize(48);
        fill(220, 40, 40);
        text("GAME OVER", width / 2, height / 2);
        textSize(20);
        fill(255);
        text("Press R or tap Retry", width / 2, height / 2 + 40);
        updateRestartButton(true, "Retry");
    } else {
        updateRestartButton(false);
    }
    pop();
}

function drawStar(cx, cy, innerRadius, outerRadius){
    beginShape();
    for (var i = 0; i < 10; i++) {
        var angle = -HALF_PI + i * PI / 5;
        var r = i % 2 === 0 ? outerRadius : innerRadius;
        vertex(cx + cos(angle) * r, cy + sin(angle) * r);
    }
    endShape(CLOSE);
}

function updateRestartButton(show, label){
    if (!show) {
        restartButton.hide();
        return;
    }
    if (restartButtonLabel !== label) {
        restartButtonLabel = label;
        restartButton.html(label);
    }
    var rect = cnv.elt.getBoundingClientRect();
    var scale = rect.width / width;
    restartButton.position(
        rect.left + window.pageXOffset + rect.width / 2 - 55,
        rect.top + window.pageYOffset + (height / 2 + 55) * scale
    );
    restartButton.show();
}

function keyPressed(){
    unlockAudio();
    if ((key === 'r' || key === 'R') && (gameOver || pigsRemaining() === 0)) {
        buildLevel();
    }
    if ((key === 'n' || key === 'N') && pigsRemaining() === 0) {
        advanceLevel();
    }
    if (!paused && key >= '1' && key <= '9') {
        selectLevel(Number(key) - 1);
    }
    if (key === 'm' || key === 'M') {
        toggleMute();
    }
    if (key === 'p' || key === 'P') {
        togglePause();
    }
}

function tryBoost(){
    if (!bird.useBoost()) return;
    playWhoosh();
    spawnPopEffect(bird.body.position.x, bird.body.position.y, [255, 255, 255]);
}

function mousePressed(){
    unlockAudio();
    if (paused) return;
    var onCanvas = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
    if (!onCanvas) return;
    bird.tryGrab(mouseX, mouseY);
    tryBoost();
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
        shotFiredThisLevel = true;
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
    tryBoost();
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
        shotFiredThisLevel = true;
    }
    return false;
}
