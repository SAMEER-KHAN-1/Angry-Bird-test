# Angry Birds

A browser-based Angry Birds clone built with [p5.js](https://p5js.org/) and [Matter.js](https://brm.io/matter-js/), using class inheritance for game objects (boxes, logs, pigs, the bird).

## How to play

Open `index.html` in a browser (or serve the folder with any static server).

- Click and drag the bird back from its slingshot, then release to launch it (touch works the same way on mobile). A dotted arc previews the shot while you aim.
- Knock pigs with enough impact to destroy them.
- Clear all pigs before you run out of birds (5 per round). Each bird you didn't need scores bonus points and earns stars: 3 stars for 3 or more spare birds, 2 for one or two, 1 otherwise.
- Destroying a pig and clearing the level with birds to spare both add to your score; your best score is saved between visits.

## Controls

| Input | Action |
| --- | --- |
| Drag and release (mouse or touch) | Aim and launch the bird |
| `P` | Pause or resume |
| `M` | Mute or unmute sound (saved between visits) |
| `R` or the on-screen Restart button | Restart after the round ends, win or lose |

## Tech

- `sketch.js` — game loop, level setup, collisions, scoring, HUD, particles, pause, mute, input handling
- `BaseClass.js` — shared Matter.js body + sprite rendering for game objects
- `Bird.js`, `Box.js`, `Log.js`, `Pig.js`, `Ground.js` — game object classes
- `style.css` — page layout, responsive canvas sizing, touch behaviour, restart button

The libraries (p5.js 0.7.2, p5.sound, p5.dom, Matter.js) are bundled in the repo, so the game runs offline. Note that p5 0.7.2 has no `storeItem`/`getItem`, which is why settings are saved through `localStorage` directly.
