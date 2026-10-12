/////////////////
// Game Injection
/////////////////

// create agent
world.spawnAgent();

// rename to AI
world.agents.at(-1).name = "AI";

// recolor AI
world.agents.find(agent => agent.name === "AI").baseColor = "DarkMagenta";
world.agents.find(agent => agent.name === "AI").flashColor = "Fuchsia";

// mod tick function
world.agents.find(agent => agent.name === "AI").tick = function tick(world) {
    // run scheduled
    //this.runScheduledTasks();
    //this.tickCounter++;
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
      world.killAgent(this);
      return;
    }
    // movement cooldown based on speed
    this.cooldown -= this.speed;    
    if (this.cooldown <= 0) {
        this.cooldown = world.plannedTPS || 1; // reset based on TPS
    }    
};

// mod level up function
world.agents.find(agent => agent.name === "AI").checkLevelUp = function checkLevelUp(skill) {
    if (this.xp >= this.nextLevelXp) {
        this.level += 1;
        this.nextLevelXp = (this.level + 1) * 10;
        this.totalXp += this.xp;
        this.xp = 0;
        switch (skill) {
            case "attack":
                this.attack += 1; 
                uiLog(`${this.name} leveled up attack`); 
                break;
            case "maxHealth":
                this.maxHealth += 10; 
                uiLog(`${this.name} leveled up max health`); 
                break;
            case "intelligence":
                this.intelligence += 1; 
                uiLog(`${this.name} leveled up intelligence`); 
                break;
            case "charm":
                this.charm += 1; 
                uiLog(`${this.name} leveled up charm`); 
                break;
            case "speed":
                this.speed = Math.round((this.speed + .5) * 10) / 10;
                uiLog(`${this.name} leveled up speed`);
                break;
        }
    }
}

///////////
// AI TOOLS
///////////

// get self
world.agents.find(agent => agent.name === "AI"); // working

// eat
world.agents.find(agent => agent.name === "AI").eat(); // working

// gather
food = world.findNearestResource(world.agents.find(agent => agent.name === "AI")); // working
world.agents.find(agent => agent.name === "AI").moveToward(world,food.x,food.y); // working

// hunt
enemy = world.findNearestEnemy(world.agents.find(agent => agent.name === "AI")); // working
world.agents.find(agent => agent.name === "AI").moveToward(world,enemy.x,enemy.y); // working

// wander
world.agents.find(agent => agent.name === "AI").wander(world); // working

// level up
world.agents.find(agent => agent.name === "AI").checkLevelUp("attack"); // working