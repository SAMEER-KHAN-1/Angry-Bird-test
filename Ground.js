class Ground {
    constructor(x,y,width,height,image) {
      var options = {
          isStatic: true,
          friction: 0.8,
          frictionStatic: 1.0,
          restitution: 0
      }
      this.body = Bodies.rectangle(x,y,width,height,options);
      this.width = width;
      this.height = height;
      this.image = image;
      World.add(world, this.body);
    }
    display(){
      var pos = this.body.position;
      push();
      if (this.image) {
        imageMode(CENTER);
        image(this.image, pos.x, pos.y, this.width, this.height);
      } else {
        rectMode(CENTER);
        fill("brown");
        rect(pos.x, pos.y, this.width, this.height);
      }
      pop();
    }
}
