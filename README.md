# Angry Birds

A browser-based Angry Birds clone built with [p5.js](https://p5js.org/) and [Matter.js](https://brm.io/matter-js/), using class inheritance for game objects (boxes, logs, pigs, the bird).

## How to play

Open `index.html` in a browser (or serve the folder with any static server).

- Click and drag the bird back from its slingshot, then release to launch it (touch works the same way on mobile).
- Knock pigs with enough impact to destroy them.
- Clear all pigs before you run out of birds (5 per round) to score bonus points for every bird you have left.
- Destroying a pig and clearing the level with birds to spare both add to your score; your best score is saved between visits.
- Press `R`, or tap the on-screen Restart button, to restart once the round ends, win or lose.
- Press `M` to mute or unmute sound effects (also saved between visits).

## Tech

- `sketch.js` — game loop, level setup, collisions, scoring, HUD, restart, mute toggle
- `BaseClass.js` — shared Matter.js body + sprite rendering for game objects
- `Bird.js`, `Box.js`, `Log.js`, `Pig.js`, `Ground.js` — game object classes
