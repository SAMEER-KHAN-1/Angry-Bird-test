const WOOD_HEALTH = 100;

const MATERIALS = {
    box:  { restitution: 0.2, friction: 0.6, density: 1.0 },
    log:  { restitution: 0.2, friction: 0.6, density: 0.8 },
    pig:  { restitution: 0.3, friction: 0.6, density: 0.8, shape: 'circle' },
    bird: { restitution: 0.4, friction: 0.8, density: 2.0, shape: 'circle' }
};

class BaseClass{
    constructor(x, y, width, height, image, angle, material) {
        var options = Object.assign({
            restitution: 0.8,
            friction: 1.0,
            density: 1.0
        }, material);
        if (angle !== undefined) {
            options.angle = angle;
        }
        var isCircle = options.shape === 'circle';
        delete options.shape;
        this.body = isCircle
            ? Bodies.circle(x, y, width / 2, options, 24)
            : Bodies.rectangle(x, y, width, height, options);
        this.width = width;
        this.height = height;
        this.image = image;
        this.alive = true;
        World.add(world, this.body);
      }
      remove(){
        if (!this.alive) return;
        this.alive = false;
        World.remove(world, this.body);
      }
      display(){
        if (!this.alive) return;
        var angle = this.body.angle;
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(angle);
        imageMode(CENTER);
        image(this.image, 0, 0, this.width, this.height);
        pop();
      }
}