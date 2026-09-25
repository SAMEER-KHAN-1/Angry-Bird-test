const LEVELS = [
    {
        name: "Level 1",
        birds: 5,
        objects: [
            { type: 'box', x: 700, y: 320, w: 70, h: 70 },
            { type: 'box', x: 920, y: 320, w: 70, h: 70 },
            { type: 'pig', x: 810, y: 350 },
            { type: 'log', x: 810, y: 260, length: 300, angle: Math.PI / 2 },

            { type: 'box', x: 700, y: 240, w: 70, h: 70 },
            { type: 'box', x: 920, y: 240, w: 70, h: 70 },
            { type: 'pig', x: 810, y: 220 },
            { type: 'log', x: 810, y: 180, length: 300, angle: Math.PI / 2 },

            { type: 'box', x: 810, y: 160, w: 70, h: 70 },
            { type: 'log', x: 760, y: 120, length: 150, angle: Math.PI / 7 },
            { type: 'log', x: 870, y: 120, length: 150, angle: -Math.PI / 7 }
        ]
    }
];
