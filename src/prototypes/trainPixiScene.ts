export const trainPixiScene = {
  canvas: { width: 1024, height: 1536 },
  assets: {
    beforeBackground: '/prototypes/train-pixi/before.svg',
    afterBackground: '/prototypes/train-pixi/after.svg',
    bagSprite: '/prototypes/train-pixi/bag.svg',
  },
  bag: {
    startPosition: { x: 650, y: 1035 },
    anchor: { x: 0.5, y: 0.5 },
    size: { width: 250, height: 221 },
  },
  dropZones: [
    { id: 'floor', x: 365, y: 1240, radius: 185 },
  ],
  successTransition: {
    settleMs: 150,
    crossfadeMs: 260,
  },
} as const
