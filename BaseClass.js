const MATERIALS = {
    box:  { restitution: 0.2, friction: 0.6, density: 1.0 },
    log:  { restitution: 0.2, friction: 0.6, density: 0.8 },
    pig:  { restitution: 0.3, friction: 0.6, density: 0.8 },
    bird: { restitution: 0.4, friction: 0.8, density: 2.0 }
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
        this.body = Bodies.rectangle(x, y, width, height, options);
        this.width = width;
        this.height = height;
        this.image = image;
        World.add(world, this.body);
      }
      display(){
        var angle = this.body.angle;
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(angle);
        imageMode(CENTER);
        image(this.image, 0, 0, this.width, this.height);
        pop();
      }
}