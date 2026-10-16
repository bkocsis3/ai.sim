# AI Simulation Lab

A lightweight browser-based simulation built with HTML, JavaScript, and Phaser. The world contains resources,  obstacles, and NPC players whose goals are to gather resources, fight, level up, and live as long as possible. 

The primary goal for this project is to host an environment where AI agents and their configurations (prompts, tools, memory, models, etc) can be tested and observed.

## Screenshot
From the lab:

![Lab](/screenshots/lab.png)

## Hosted from This Repo

This repo is the primary host for the lab. It is designed to run as a web-based sandbox with the logic exposed and adjustable from the browser.

## Intended Integration

The lab is be used in conjunction with https://github.com/bkocsis3/ai.sim.agent which provides the AI agent and controller for injection/integration.

## Features

- Procedural world generation with a grid-based map
- Player agents that seek resources, wander, fight, and level up
- Resource nodes that can be harvested
- Obstacle placement and world reset controls
- HUD panels for game performance, player stats, and resource stats
- Simulation loop with pause/resume functionality
- Log box for greater observability

## Project Structure

```text
.
├── screenshots/
│   └── lab.png
index.html
main.js
world.js
player.js
resource.js
```

- `index.html` – page layout and HUD panels
- `main.js` – game bootstrap, simulation loop, and world reset logic
- `world.js` – grid management, spawning, combat, harvesting, and world state
- `player.js` – AI behavior, movement, scheduling, and leveling logic
- `resource.js` – resource data and tick behavior

## Running the Simulation

### Option 1:

Open bkocsis3.github.io/ai.sim.lab/ from a browser.

### Option 2:

Clone the repository and open `index.html`.

## Controls

- World size: choose the map dimensions
- Starting players: set the initial number of AI agents
- Reset World: rebuild the simulation
- Spawn Player / Spawn Resource / Spawn Obstacle: add entities to the current world
- Pause / Resume: control the simulation loop

## Notes

- The visuals and behavior are intentionally simple so the underlying AI logic is easy to extend.
- If you want to tune the NPC behavior, the main logic is in `src/player.js` and `src/world.js`.
