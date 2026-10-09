class World {
  constructor(size, scene) {
    this.size = size;
    this.scene = scene;
    this.tileSize = 16;

    this.grid = [];
    this.agents = [];
    this.resources = [];
    this.obstacles = [];

    this.agentCounter = 1;
    this.resourceCounter = 1;

    this.initGrid();
  }

  initGrid() {
    this.grid = [];
    for (let x = 0; x < this.size; x++) {
      this.grid[x] = [];
      for (let y = 0; y < this.size; y++) {
        this.grid[x][y] = null;
      }
    }
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.size && y < this.size;
  }

  isEmpty(x, y) {
    return this.inBounds(x, y) && this.grid[x][y] == null;
  }

  spawnAgent() {
    const pos = this.randomEmptyTile();
    if (!pos) return;

    const agent = new Agent("Agent_" + this.agentCounter, pos.x, pos.y);

    // Calculate offsets (same as draw())
    const boardSizePx = this.size * this.tileSize;
    const canvasWidth = this.scene.game.config.width;
    const canvasHeight = this.scene.game.config.height;
    const offsetX = (canvasWidth - boardSizePx) / 2;
    const offsetY = (canvasHeight - boardSizePx) / 2;
    // Correct hitbox position
    const px = offsetX + pos.x * this.tileSize;
    const py = offsetY + pos.y * this.tileSize;
    agent.hitbox = this.scene.add.rectangle(
        px,
        py,
        this.tileSize,
        this.tileSize,
        0x000000,
        0
    )
    .setOrigin(0)
    .setInteractive()
    .setDepth(9999); // <-- IMPORTANT: above graphics

    agent.hitbox.on("pointerdown", () => {
        this.setPlayer(agent);
    });

    this.agents.push(agent);
    this.grid[pos.x][pos.y] = { type: "agent", ref: agent };

    this.agentCounter++;
    return agent;
}

  spawnResource() {
    const pos = this.randomEmptyTile();
    if (!pos) return;
    const resource = new Resource(pos.x, pos.y, "Resource_" + this.resourceCounter);
    this.resources.push(resource);
    this.grid[pos.x][pos.y] = { type: "resource", ref: resource };
    this.resourceCounter += 1;
  }

  spawnObstacle() {
    const pos = this.randomEmptyTile();
    if (!pos) return;
    const obstacle = { x: pos.x, y: pos.y };
    this.obstacles.push(obstacle);
    this.grid[pos.x][pos.y] = { type: "obstacle", ref: obstacle };
  }

  randomEmptyTile() {
    const tries = 200;
    for (let i = 0; i < tries; i++) {
      const x = Math.floor(Math.random() * this.size);
      const y = Math.floor(Math.random() * this.size);
      if (this.isEmpty(x, y)) return { x, y };
    }
    return null;
  }

  tryMoveAgent(agent, newX, newY) {
    if (!this.inBounds(newX, newY)) return;
    // Recalculate offsets (same as draw())
    const boardSizePx = this.size * this.tileSize;
    const canvasWidth = this.scene.game.config.width;
    const canvasHeight = this.scene.game.config.height;
    const offsetX = (canvasWidth - boardSizePx) / 2;
    const offsetY = (canvasHeight - boardSizePx) / 2;
    const cell = this.grid[newX][newY];

    if (!cell) {
        // move
        this.grid[agent.x][agent.y] = null;
        agent.x = newX;
        agent.y = newY;
        agent.hitbox.x = offsetX + newX * this.tileSize;
        agent.hitbox.y = offsetY + newY * this.tileSize;
        this.grid[newX][newY] = { type: "agent", ref: agent };
    } 
        // harvest
    else if (cell.type === "resource") {
        return;
    } 
        // attack
    else if (cell.type === "agent") {
        this.resolveCombat(agent, cell.ref);
    }
}

  removeResource(resource) {
    this.resources = this.resources.filter(r => r !== resource);
  }

  resolveCombat(attacker, defender) {
    // ignore attack if charmed
    if (defender.charm > attacker.charm) {
      const charm = (defender.charm - attacker.charm) * 10;
      const roll = Math.random() * 100;
      if (charm > roll) { 
        attacker.charmTimer = 150;
        console.log(`${defender.name} charmed ${attacker.name}`); // <<<<<<<<<<<
        return;
      }
    }
    // Defender takes damage equal to attacker's attack stat
    defender.health -= attacker.attack;
    console.log(`${attacker.name} attacked ${defender.name}`); // <<<<<<<<<<<
    defender.hitTimer = 150;
    // If defender dies, attacker gets kill credit
    if (defender.health <= 0) {
        this.killAgent(defender);
        attacker.onKill(defender);
        console.log(`${attacker.name} killed ${defender.name}`); // <<<<<<<<<<<
        return;
    }
    // defender counter-attacks
    attacker.health -= defender.attack;
    console.log(`${defender.name} hit back ${attacker.name}`); // <<<<<<<<<<<
    attacker.hitTimer = 150;
    if (attacker.health <= 0) {
        this.killAgent(attacker);
        defender.onKill(attacker);
        console.log(`${attacker.name} killed ${defender.name}`); // <<<<<<<<<<<
    }
  }

  resolveHarvest(agent, resource) {
    // agent hits the resource
    resource.health -= agent.attack;
    resource.hitTimer = 150;
    // if resource is destroyed
    if (resource.health <= 0) {
        agent.onResourceGathered(resource.value);
        this.removeResource(resource);
        this.grid[resource.x][resource.y] = null;
        console.log(`${agent.name} harvested ${resource.name}`); // <<<<<<<<<<<
    }
  }

  setPlayer(agent) {
    // clear old player
    for (const a of this.agents) {
      a.isPlayer = false;
    }
    // mark new player
    agent.isPlayer = true;
    console.log("Player selected:", agent.name);
  }

  killAgent(agent) {
    this.grid[agent.x][agent.y] = null;
    this.agents = this.agents.filter(a => a !== agent);
  }

  findNearestResource(x, y) {
    if (this.resources.length === 0) return null;
    let best = null;
    let bestDist = Infinity;
    for (const r of this.resources) {
      const d = Math.abs(r.x - x) + Math.abs(r.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = r;
      }
    }
    return best;
  }

  findNearestEnemy(agent) {
    let best = null;
    let bestDist = Infinity;
    for (const a of this.agents) {
      if (a === agent) continue;
      const d = Math.abs(a.x - agent.x) + Math.abs(a.y - agent.y);
      if (d < bestDist) {
        bestDist = d;
        best = a;
      }
    }
    return best;
  }

  getAdjacentResource(x, y) {
    const dirs = [
        {x: x+1, y: y},
        {x: x-1, y: y},
        {x: x,   y: y+1},
        {x: x,   y: y-1}
    ];
    for (const d of dirs) {
        if (this.inBounds(d.x, d.y)) {
            const cell = this.grid[d.x][d.y];
            if (cell && cell.type === "resource") {
                return cell.ref;
            }
        }
    }
    return null;
  }

  tick() {
    const now = performance.now();
    this.deltaTime = now - (this.lastTickTime || now);
    this.lastTickTime = now;

    const agentsSnapshot = [...this.agents];
    for (const agent of agentsSnapshot) {
      agent.tick(this);
    }

    const resourcesSnapshot = [...this.resources];
    for (const resource of resourcesSnapshot) {
      resource.tick(this);
    }

    this.draw();

    // now decrement hit timers
    for (const resource of this.resources) {
        if (resource.hitTimer > 0) {
            resource.hitTimer -= 50;   // lasts ~3 ticks at 250ms
        }
    }
  }

  draw() {
    const gfx = this.scene.graphics;
    gfx.clear();

    // calculate centering offsets
    const boardSizePx = this.size * this.tileSize;
    const canvasWidth = this.scene.game.config.width;
    const canvasHeight = this.scene.game.config.height;

    const offsetX = (canvasWidth - boardSizePx) / 2;
    const offsetY = (canvasHeight - boardSizePx) / 2;

    // draw grid lines
    gfx.lineStyle(1, 0x333333, 1);
    for (let x = 0; x <= this.size; x++) {
        const px = offsetX + x * this.tileSize;
        gfx.lineBetween(px, offsetY, px, offsetY + boardSizePx);
    }
    for (let y = 0; y <= this.size; y++) {
        const py = offsetY + y * this.tileSize;
        gfx.lineBetween(offsetX, py, offsetX + boardSizePx, py);
    }

    // draw obstacles
    gfx.fillStyle(0x555555, 1);
    for (const o of this.obstacles) {
        const px = offsetX + o.x * this.tileSize;
        const py = offsetY + o.y * this.tileSize;
        gfx.fillRect(px, py, this.tileSize, this.tileSize);
    }

    // draw resources
    gfx.fillStyle(0x00ff00, 1);
    for (const r of this.resources) {
        const px = offsetX + r.x * this.tileSize;
        const py = offsetY + r.y * this.tileSize;
        if (r.hitTimer > 0) {
            gfx.fillStyle(colorNameToHex("lime"), 1); // dmged resource
            } else {
                gfx.fillStyle(colorNameToHex("green"), 1); // normal resource
            }
        gfx.fillRect(px, py, this.tileSize, this.tileSize);
    }

    // draw agents
    for (const a of this.agents) {
        const px = offsetX + a.x * this.tileSize;
        const py = offsetY + a.y * this.tileSize;
        if (a.charmTimer > 0) {
          gfx.fillStyle(colorNameToHex("white"), 1); // charmed
        } else {
          if (a.isPlayer) {
              if (a.hitTimer > 0) {
                  gfx.fillStyle(colorNameToHex("cyan"), 1); // dmged player
              } else {
                  gfx.fillStyle(colorNameToHex("blue"), 1); // normal player
              }
          } else {
              if (a.hitTimer > 0) {
                  gfx.fillStyle(colorNameToHex("orange"), 1); // dmged agent
              } else {
                  gfx.fillStyle(colorNameToHex("brown"), 1); // normal agent
              }
          }
        }
        gfx.fillCircle(
        px + this.tileSize / 2,
        py + this.tileSize / 2,
        this.tileSize / 2 - 2
        );
    }
    }
}
