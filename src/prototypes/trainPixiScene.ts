export const trainPixiScene = {
  canvas: { width: 1024, height: 1536 },
  assets: {
    background: '/prototypes/train-pixi/background.svg',
    player: '/prototypes/train-pixi/player.svg',
    npcStanding: '/prototypes/train-pixi/npc-standing.svg',
    afterLap: '/prototypes/train-pixi/npc-seated.svg',
    afterFloor: '/prototypes/train-pixi/npc-seated.svg',
    bagSprite: '/prototypes/train-pixi/bag.svg',
  },
  artwork: { x: 0, y: 86, width: 1024, height: 1316 },
  bag: {
    startPosition: { x: 650, y: 1035 },
    anchor: { x: 0.5, y: 0.5 },
    size: { width: 250, height: 221 },
  },
  dropZones: [
    {
      id: 'lap', x: 300, y: 960, radius: 130, consideration: 2,
      result: 'ひと席ぶん、空気がやわらいだ。',
    },
    {
      id: 'floor', x: 365, y: 1240, radius: 160, consideration: 1,
      result: '席は空いた。足元に、少し気をつけたい。',
    },
  ],
  successTransition: {
    settleMs: 150,
    crossfadeMs: 260,
  },
  viewportPadding: 12,
} as const
