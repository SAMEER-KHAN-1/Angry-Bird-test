class Box extends BaseClass {
  constructor(x, y, width, height){
    super(x, y, width, height, sprites.wood1, undefined, MATERIALS.box);
    this.breakable = true;
    this.health = WOOD_HEALTH;
  }

};
