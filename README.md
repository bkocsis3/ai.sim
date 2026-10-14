# AI Sim Game

A lightweight browser-based simulation game built with HTML, JavaScript, and Phaser. The world contains players, resources, and obstacles, with agents gathering resources, fighting, leveling up, and evolving over time.

## Hosted from This Repo

This repo is the primary host for the game. It is designed to run as a web-based sandbox with the game logic exposed and adjustable from the browser.

## Intended Integration

This game was built to be used in conjunction with https://github.com/bkocsis3/ai.sim.agent. ai.sim.agent provides the AI/player logic and external control layer.

## Features

- Procedural world generation with a grid-based map
- Player agents that seek resources, wander, fight, and level up
- Resource nodes that can be harvested
- Obstacle placement and world reset controls
- HUD panels for game performance, player stats, and resource stats
- Simulation loop with pause/resume functionality
- Log box for greater observability

## Project Structure

- `index.html` – page layout and HUD panels
- `main.js` – game bootstrap, simulation loop, and world reset logic
- `world.js` – grid management, spawning, combat, harvesting, and world state
- `player.js` – AI behavior, movement, scheduling, and leveling logic
- `resource.js` – resource data and tick behavior

## Running the Game

### Option 1:

Open bkocsis3.github.io/ai.sim.game/ in a browser.

### Option 2:

Clone and open `index.html` in a browser.

## Controls

- World size: choose the map dimensions
- Starting players: set the initial number of AI agents
- Reset World: rebuild the simulation
- Spawn Player / Spawn Resource / Spawn Obstacle: add entities to the current world
- Pause / Resume: control the simulation loop

## Notes

- The simulation is designed as a prototype/experiment rather than a polished game.
- The visuals and behavior are intentionally simple so the underlying AI logic is easy to extend.
- If you want to tune the NPC behavior, the main logic is in `player.js` and `world.js`.
