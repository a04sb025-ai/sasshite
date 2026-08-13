export const trainPixiScene = {
  canvas: { width: 1024, height: 1536 },
  assets: {
    background: '/prototypes/train-pixi/background.svg',
    player: '/prototypes/train-pixi/player.svg',
    npcStanding: '/prototypes/train-pixi/npc-standing.svg',
    npcSeated: '/prototypes/train-pixi/npc-seated.svg',
    bagSprite: '/prototypes/train-pixi/bag.svg',
  },
  artwork: { x: 0, y: 86, width: 1024, height: 1316 },
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
  viewportPadding: 12,
} as const
