class Pig extends BaseClass {
  constructor(x, y){
    super(x, y, 50, 50, sprites.enemy);
    this.alive = true;
  }

  remove(){
    if (!this.alive) return;
    this.alive = false;
    World.remove(world, this.body);
  }

  display(){
    if (!this.alive) return;
    super.display();
  }
};
