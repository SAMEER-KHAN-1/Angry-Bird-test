class Bird extends BaseClass {
  constructor(x,y){
    super(x, y, 50, 50, sprites.bird, undefined, MATERIALS.bird);
    this.anchorX = x;
    this.anchorY = y;
    this.maxStretch = 90;
    this.launchPower = 0.18;
    this.dragging = false;
    this.launched = false;
    this.removed = false;
    this.trail = [];
    Matter.Body.setStatic(this.body, true);
  }

  tryGrab(mx, my, radius) {
    if (this.launched || this.removed) return;
    var d = dist(mx, my, this.body.position.x, this.body.position.y);
    if (d < (radius || 40)) {
      this.dragging = true;
    }
  }

  updateDrag(mx, my) {
    if (!this.dragging) return;
    var d = dist(mx, my, this.anchorX, this.anchorY);
    var angle = atan2(my - this.anchorY, mx - this.anchorX);
    var stretch = min(d, this.maxStretch);
    var x = this.anchorX + cos(angle) * stretch;
    var y = this.anchorY + sin(angle) * stretch;
    Matter.Body.setPosition(this.body, {x: x, y: y});
  }

  release() {
    if (!this.dragging || this.removed) return false;
    this.dragging = false;
    var pos = this.body.position;
    if (dist(pos.x, pos.y, this.anchorX, this.anchorY) < 10) {
      Matter.Body.setPosition(this.body, {x: this.anchorX, y: this.anchorY});
      return false;
    }
    this.launched = true;
    this.launchFrame = frameCount;
    Matter.Body.setStatic(this.body, false);
    var vx = (this.anchorX - pos.x) * this.launchPower;
    var vy = (this.anchorY - pos.y) * this.launchPower;
    Matter.Body.setVelocity(this.body, {x: vx, y: vy});
    return true;
  }

  cancelDrag() {
    if (!this.dragging) return;
    this.dragging = false;
    Matter.Body.setPosition(this.body, {x: this.anchorX, y: this.anchorY});
  }

  removeFromWorld() {
    if (this.removed) return;
    this.removed = true;
    World.remove(world, this.body);
  }

  isOffscreen() {
    var p = this.body.position;
    return p.x < -100 || p.x > width + 100 || p.y > height + 200;
  }

  isResting() {
    if (!this.launched) return false;
    // Matter.js resting-contact jitter can keep velocity hovering just
    // above threshold forever, so force settle after a few seconds too.
    var timedOut = frameCount - this.launchFrame > 300;
    return Matter.Vector.magnitude(this.body.velocity) < 0.05 || timedOut;
  }

  drawSling() {
    if (!this.dragging) return;
    var pos = this.body.position;
    push();
    stroke(90, 60, 30);
    strokeWeight(4);
    line(this.anchorX - 15, this.anchorY - 40, pos.x, pos.y);
    line(this.anchorX + 15, this.anchorY - 40, pos.x, pos.y);
    pop();
  }

  drawTrajectory() {
    if (!this.dragging) return;
    var pos = this.body.position;
    var vx = (this.anchorX - pos.x) * this.launchPower;
    var vy = (this.anchorY - pos.y) * this.launchPower;
    var dt = 1000 / 60;
    var g = world.gravity.y * world.gravity.scale * dt * dt;
    var airFriction = 1 - this.body.frictionAir;
    var x = pos.x;
    var y = pos.y;
    push();
    noStroke();
    for (var step = 1; step <= 60; step++) {
      vx *= airFriction;
      vy = vy * airFriction + g;
      x += vx;
      y += vy;
      if (y > height) break;
      if (step % 3 === 0) {
        fill(255, 255 - step * 3.5);
        ellipse(x, y, 6, 6);
      }
    }
    pop();
  }

  drawTrail() {
    if (this.launched && !this.body.isStatic && !paused && frameCount % 3 === 0) {
      this.trail.push({x: this.body.position.x, y: this.body.position.y});
      if (this.trail.length > 18) this.trail.shift();
    }
    push();
    noStroke();
    for (var i = 0; i < this.trail.length; i++) {
      var t = (i + 1) / this.trail.length;
      fill(255, 255 * t * 0.6);
      ellipse(this.trail[i].x, this.trail[i].y, 4 + 6 * t, 4 + 6 * t);
    }
    pop();
  }

  display() {
    if (this.removed) return;
    this.drawTrail();
    this.drawTrajectory();
    this.drawSling();
    super.display();
  }
}
