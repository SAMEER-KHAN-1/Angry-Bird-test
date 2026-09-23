class Bird extends BaseClass {
  constructor(x,y){
    super(x, y, 50, 50, sprites.bird);
    this.anchorX = x;
    this.anchorY = y;
    this.maxStretch = 90;
    this.launchPower = 0.18;
    this.dragging = false;
    this.launched = false;
    this.removed = false;
    Matter.Body.setStatic(this.body, true);
  }

  tryGrab(mx, my) {
    if (this.launched || this.removed) return;
    var d = dist(mx, my, this.body.position.x, this.body.position.y);
    if (d < 40) {
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

  display() {
    if (this.removed) return;
    this.drawSling();
    super.display();
  }
}
