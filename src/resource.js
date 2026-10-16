class Resource {
  constructor(x, y, name) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.value = 10;
    this.health = 5;
    this.hitTimer = 0;
  }

  tick() {
    if (this.hitTimer > 0) {
        this.hitTimer -= 50;
        if (this.hitTimer < 0) this.hitTimer = 0;
    }
  }
}