const LEVELS = [
    {
        name: "Level 1",
        birds: 5,
        objects: [
            { type: 'box', x: 700, y: 355, w: 70, h: 70 },
            { type: 'box', x: 920, y: 355, w: 70, h: 70 },
            { type: 'pig', x: 810, y: 365 },
            { type: 'log', x: 810, y: 310, length: 300, angle: Math.PI / 2 },

            { type: 'box', x: 700, y: 265, w: 70, h: 70 },
            { type: 'box', x: 920, y: 265, w: 70, h: 70 },
            { type: 'pig', x: 810, y: 275 },
            { type: 'log', x: 810, y: 220, length: 300, angle: Math.PI / 2 },

            { type: 'box', x: 810, y: 175, w: 70, h: 70 },
            { type: 'log', x: 810, y: 130, length: 200, angle: Math.PI / 2 }
        ]
    },
    {
        name: "Level 2",
        birds: 5,
        objects: [
            { type: 'box', x: 760, y: 355, w: 70, h: 70 },
            { type: 'box', x: 900, y: 355, w: 70, h: 70 },
            { type: 'pig', x: 830, y: 365 },
            { type: 'log', x: 830, y: 310, length: 200, angle: Math.PI / 2 },

            { type: 'box', x: 760, y: 265, w: 70, h: 70 },
            { type: 'box', x: 900, y: 265, w: 70, h: 70 },
            { type: 'pig', x: 830, y: 275 },
            { type: 'log', x: 830, y: 220, length: 200, angle: Math.PI / 2 },

            { type: 'pig', x: 830, y: 185 }
        ]
    },
    {
        name: "Level 3",
        birds: 6,
        objects: [
            { type: 'box', x: 650, y: 355, w: 70, h: 70 },
            { type: 'box', x: 650, y: 285, w: 70, h: 70 },
            { type: 'pig', x: 650, y: 225 },

            { type: 'box', x: 820, y: 355, w: 70, h: 70 },
            { type: 'pig', x: 820, y: 295 },

            { type: 'log', x: 960, y: 300, length: 180, angle: 0 },
            { type: 'log', x: 1040, y: 300, length: 180, angle: 0 },
            { type: 'pig', x: 1000, y: 365 },
            { type: 'log', x: 1000, y: 200, length: 120, angle: Math.PI / 2 },
            { type: 'pig', x: 1000, y: 165 }
        ]
    },
    {
        name: "Level 4",
        birds: 6,
        objects: [
            { type: 'pig', x: 640, y: 365 },

            { type: 'box', x: 740, y: 355, w: 70, h: 70 },
            { type: 'box', x: 810, y: 355, w: 70, h: 70 },
            { type: 'box', x: 880, y: 355, w: 70, h: 70 },
            { type: 'box', x: 775, y: 285, w: 70, h: 70 },
            { type: 'box', x: 845, y: 285, w: 70, h: 70 },
            { type: 'box', x: 810, y: 215, w: 70, h: 70 },
            { type: 'pig', x: 810, y: 155 },

            { type: 'log', x: 960, y: 340, length: 100, angle: 0 },
            { type: 'log', x: 1040, y: 340, length: 100, angle: 0 },
            { type: 'pig', x: 1000, y: 365 },
            { type: 'log', x: 1000, y: 280, length: 120, angle: Math.PI / 2 },
            { type: 'pig', x: 1000, y: 245 }
        ]
    }
];
