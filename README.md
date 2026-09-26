# Angry Birds

A browser-based Angry Birds clone built with [p5.js](https://p5js.org/) and [Matter.js](https://brm.io/matter-js/), using class inheritance for game objects (boxes, logs, pigs, the bird).

## How to play

Open `index.html` in a browser (or serve the folder with any static server).

- Click and drag the bird back from its slingshot, then release to launch it (touch works the same way on mobile). A dotted arc previews the shot while you aim.
- Once the bird is in the air, click or tap once to boost its speed. Each bird can boost once.
- Knock pigs with enough impact to destroy them. Wooden boxes and logs take damage from hard hits and break apart for bonus points.
- Clear all pigs before you run out of birds. Each bird you didn't need scores bonus points and earns stars: 3 stars for 3 or more spare birds, 2 for one or two, 1 otherwise.
- There are 4 levels. Clearing a level unlocks the next one. Your best score and best stars are saved per level, and the game resumes at your furthest unlocked level.

## Controls

| Input | Action |
| --- | --- |
| Drag and release (mouse or touch) | Aim and launch the bird |
| Click or tap while the bird is flying | Boost (once per bird) |
| `P` or the "Pause" label | Pause or resume (tap the screen to resume) |
| `M` or the "Sound" label | Mute or unmute sound (saved between visits) |
| `R` or the on-screen button | Retry after the round ends, win or lose |
| `N` or the on-screen button | Next level after a win |
| `1` to `9` | Jump to an unlocked level (restarts it) |

## Adding a level

Levels are plain data in `levels.js`. Add an entry to the `LEVELS` array with a name, a bird count and a list of objects:

```js
{ type: 'box', x: 700, y: 320, w: 70, h: 70 }
{ type: 'log', x: 810, y: 260, length: 300, angle: Math.PI / 2 }
{ type: 'pig', x: 810, y: 350 }
```

The ground surface is at y = 390, and the slingshot platform covers the left 300 pixels. Use `Math.PI` for angles, because p5's `PI` isn't defined yet when `levels.js` loads.

## Physics

Each object type has its own material in `BaseClass.js` (`MATERIALS`): bounciness, friction and density. The bird and pigs are circles, and boxes and logs are rectangles. Wood health, damage thresholds and the boost strength are constants near the top of `sketch.js`, `BaseClass.js` and `Bird.js`, so they are easy to tune.

## Tech

- `sketch.js` — game loop, level building, collisions, damage, scoring, HUD, particles, pause, mute, progress saving, input handling
- `levels.js` — level layouts as data
- `BaseClass.js` — shared Matter.js body + sprite rendering, and the material table
- `Bird.js`, `Box.js`, `Log.js`, `Pig.js`, `Ground.js` — game object classes
- `style.css` — page layout, responsive canvas sizing, touch behaviour, restart button

The libraries (p5.js 0.7.2, p5.sound, p5.dom, Matter.js) are bundled in the repo, so the game runs offline. Note that p5 0.7.2 has no `storeItem`/`getItem`, which is why settings are saved through `localStorage` directly.
