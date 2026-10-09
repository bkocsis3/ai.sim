let world;
let game;

const Simulation = {
    tps: 0,
    tpsCounter: 0,
    tpsLastTime: performance.now(),
    plannedTPS: 0
};

window.addEventListener("load", () => {
  // phaser game configs
  const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 640,
    parent: "game-container",
    backgroundColor: "#111",
    scene: {
      preload: preload,
      create: create,
      update: update,
    }
  };

  // instantiate phaser game with configs
  game = new Phaser.Game(config);

  // window listener events
  document.getElementById("resetWorld").onclick = () => {
    const size = parseInt(document.getElementById("worldSize").value, 10);
    resetWorld(size, window.currentScene);
  };
  document.getElementById("spawnAgent").onclick = () => {
    const agent = world.spawnAgent();
  };
  document.getElementById("spawnResource").onclick = () => {
    world.spawnResource();
  };
  document.getElementById("spawnObstacle").onclick = () => {
    world.spawnObstacle();
  };
});

// phaser scene functions
function preload() {}

function create() {
  this.graphics = this.add.graphics();
  window.currentScene = this;
  // delay world creation until the next frame
  this.time.delayedCall(0, () => {
    resetWorld(20, this);
  });

  // store the timer event so we can pause/resume it
  this.simulationEvent = this.time.addEvent({
    delay: 200, //delay in milliseconds (ms)
    loop: true,
    callback: () => {
      world.tick();
      computeTPS();
      world.plannedTPS = Simulation.plannedTPS;
      updateWorldStats();
      updatePlayerStats();
    }
  });

  Simulation.plannedTPS = 1000 / this.simulationEvent.delay;
  
  // hook up pause/resume buttons
  document.getElementById("pauseGame").onclick = () => {
    this.simulationEvent.paused = true;
  };
  document.getElementById("resumeGame").onclick = () => {
    this.simulationEvent.paused = false;
  };
}

function update() {}

// non phaser scene functions
function computeTPS() {
  Simulation.tpsCounter++;
  const now = performance.now();
  if (now - Simulation.tpsLastTime >= 1000) {
      Simulation.tps = Simulation.tpsCounter;
      Simulation.tpsCounter = 0;
      Simulation.tpsLastTime = now;
  }
}

function updateWorldStats() {
  document.getElementById("psActualTPS").textContent = Simulation.tps.toFixed(0);
  document.getElementById("psPlannedTPS").textContent = Simulation.plannedTPS.toFixed(0);
  const eff = (Simulation.tps / Simulation.plannedTPS) * 100;
  document.getElementById("psTPSEff").textContent = eff.toFixed(0) + "%";
}

function updatePlayerStats() {
  const player = world.agents.find(a => a.isPlayer);
  if (!player) return;
  document.getElementById("psName").textContent = player.name;
  document.getElementById("psAge").textContent = player.age;
  document.getElementById("psHealth").textContent = player.health;

  document.getElementById("psX").textContent = player.x;
  document.getElementById("psY").textContent = player.y;

  document.getElementById("psLevel").textContent = player.level;
  document.getElementById("psXP").textContent = player.xp;
  document.getElementById("psNextLvlXP").textContent = player.nextLevelXp;
  document.getElementById("psTotalXP").textContent = player.totalXp;

  document.getElementById("psAttack").textContent = player.attack;
  document.getElementById("psCharm").textContent = player.charm;
  document.getElementById("psIntelligence").textContent = player.intelligence;
  document.getElementById("psMaxHealth").textContent = player.maxHealth;
  document.getElementById("psSpeed").textContent = player.speed;
  
  document.getElementById("psFood").textContent = player.food;
  document.getElementById("psKills").textContent = player.kills;
}

function resetWorld(size, scene) {
  console.clear();
  const s = scene || window.currentScene;
  world = new World(size, s);
  // spawn initial resources
  for (let i = 0; i < size / 2; i++) {
    world.spawnResource();
  }
  // spawn initial obstacles
  for (let i = 0; i < size * 2; i++) {
    world.spawnObstacle();
  }
  // spawn initial agents
  const startCount = parseInt(document.getElementById("startAgents").value, 10);
  for (let i = 0; i < startCount; i++) {
    world.spawnAgent();
  }
  // reset HUD stats
  const fields = [
    "psName",
    "psAge",
    "psHealth",
    "psX",
    "psY",
    "psLevel",
    "psXP",
    "psNextLvlXP",
    "psTotalXP",
    "psAttack",
    "psCharm",
    "psIntelligence",
    "psMaxHealth",
    "psSpeed",
    "psFood",
    "psKills"
  ];

  fields.forEach(id => {
    document.getElementById(id).textContent = "-";
  });

  world.draw();
}

function colorNameToHex(name) {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = name;
    return parseInt(ctx.fillStyle.replace("#", "0x"));
}