class Player {
  constructor(name, x, y) {
    // basic info
    this.name = name;
    this.age = 0;
    this.health = 20;
    // color
    this.baseColor = "brown";
    this.flashColor = "orange";
    // position
    this.x = x;
    this.y = y;
    // xp
    this.level = 0;
    this.xp = 0;
    this.nextLevelXp = (this.level +1) * 10;
    this.totalXp = 0;
    // player stats
    this.attack = 1;
    this.charm = 1;
    this.intelligence = 1;
    this.maxHealth = this.health;
    this.speed = 1;
    // current game progression stats
    this.food = 0;
    this.kills = 0;
    // timers, cooldowns
    this.hitTimer = 0; // number of ticks
    this.charmTimer = 0; // number of ticks
    this.cooldown = 5; //number of ticks
    // tick scheduler
    this.tickCounter = 0;
    this.scheduledTasks = [];
    this.every(5, () => {this.age += 1;}); // every x ticks, age
    this.every(25, () => {this.health -= 1;}); // every x ticks, hunger
    this.every(5, () => { this.xp += 1; this.totalXp += 1;}); // every x ticks, gain xp for survival
  }

  tick(world) {
    // eat if hungry
    if (this.health < (this.maxHealth * .5) && this.food > 0) {this.eat();}
    // level up if possible
    this.checkLevelUp(world);
    // run scheduled
    this.runScheduledTasks();
    this.tickCounter++;
    // hit flash cooldown
    if (this.hitTimer > 0) {
        this.hitTimer -= 50
    }
    // charm flash cooldown
    if (this.charmTimer > 0) {
        this.charmTimer -= 50
    }
    // remove if killed
    if (this.health <= 0) {
      world.killPlayer(this);
      return;
    }
    // movement based on speed
    this.cooldown -= this.speed;
    if (this.cooldown <= 0) {
        this.cooldown = world.plannedTPS || 1; // reset based on TPS
        // 1. Seek nearest resource
        const nearest = world.findNearestResource(this);
        if (nearest) {
            this.moveToward(world, nearest.x, nearest.y);
            return;
        }
        // 2. If starving and no resources, hunt nearest enemy
        if (this.food <= 0 && world.resources.length === 0) {
            const enemy = world.findNearestEnemy(this);
            if (enemy) {
                this.moveToward(world, enemy.x, enemy.y);
                return;
            }
        }
        // 3. Wander
        this.wander(world);
    }
  }

  runScheduledTasks() {
    for (const task of this.scheduledTasks) {
        if (this.tickCounter % task.interval === 0) {
            task.fn();
        }
    }
  }

  every(interval, fn) {
    this.scheduledTasks.push({ interval, fn });
  }

  findPath(world, startX, startY, targetX, targetY) {
    const queue = [];
    const visited = new Set();
    const parent = new Map();
    const key = (x, y) => `${x},${y}`;
    queue.push({ x: startX, y: startY });
    visited.add(key(startX, startY));
    const dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
    ];
    while (queue.length > 0) {
        const node = queue.shift();
        if (node.x === targetX && node.y === targetY) {
            // reconstruct path
            const path = [];
            let cur = key(targetX, targetY);
            while (parent.has(cur)) {
                path.push(cur);
                cur = parent.get(cur);
            }
            path.reverse();
            return path;
        }
        for (const d of dirs) {
            const nx = node.x + d.dx;
            const ny = node.y + d.dy;
            if (!world.inBounds(nx, ny)) continue;
            if (!world.isEmpty(nx, ny) && !(nx === targetX && ny === targetY)) continue;
            const k = key(nx, ny);
            if (!visited.has(k)) {
                visited.add(k);
                parent.set(k, key(node.x, node.y));
                queue.push({ x: nx, y: ny });
            }
        }
    }
    return null; // no path found
  }

  moveToward(world, tx, ty) {
    const path = this.findPath(world, this.x, this.y, tx, ty);
    if (!path || path.length === 0) {
        // No path found → fallback to wander
        this.wander(world);
        return;
    }
    // BFS returns full path; first step is the next tile
    const [next] = path;
    const [nx, ny] = next.split(",").map(Number);
    world.tryMovePlayer(this, nx, ny);
  }

  wander(world) {
    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];
    const choice = dirs[Math.floor(Math.random() * dirs.length)];
    const newX = this.x + choice.dx;
    const newY = this.y + choice.dy;
    world.tryMovePlayer(this, newX, newY);
  }

  onResourceGathered(value) {
    this.health = Math.min(this.maxHealth, (this.health + value));
    this.food += this.intelligence;
    this.xp += value;
    this.totalXp += value;
  }

  onKill(killed) {
    this.kills += 1;
    this.food += killed.food
    this.xp += killed.totalXp;
    this.totalXp += killed.totalXp
  }

  eat() {
    this.food -= 1;
    this.health = Math.min(this.maxHealth, (this.health + this.intelligence));
  }

  checkLevelUp(world) {
    if (this.xp >= this.nextLevelXp) {
        this.level += 1;
        this.nextLevelXp = (this.level + 1) * 10;
        this.totalXp += this.xp;
        this.xp = 0;

        let roll; 

        if (this.speed >= world.plannedTPS) {
          roll = Math.floor(Math.random() * 4) + 1;
        } else {
          roll = Math.floor(Math.random() * 5) + 1;
        } 
        switch (roll) {
            case 1:
                this.attack += 1; //working
                uiLog(`${this.name} leveled up attack`); // <<<<<<<<<<<
                break;
            case 2:
                this.maxHealth += 10; //working
                uiLog(`${this.name} leveled up max health`); // <<<<<<<<<<<
                break;
            case 3:
                this.intelligence += 1; //working
                uiLog(`${this.name} leveled up intelligence`); // <<<<<<<<<<<
                break;
            case 4:
                this.charm += 1; //working
                uiLog(`${this.name} leveled up charm`); // <<<<<<<<<<<
                break;
            case 5:
                this.speed = Math.round((this.speed + .5) * 10) / 10; //working, max is TPS
                uiLog(`${this.name} leveled up speed`); // <<<<<<<<<<<
                break;
        }
    }
  }
} 