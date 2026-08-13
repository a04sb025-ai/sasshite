import { describe, expect, it } from 'vitest'
import { BAG_TARGET, isBagInTarget, stagePoint, TRAIN_STAGE } from './trainPixiModel'
import { trainPixiScene } from './trainPixiScene'

describe('train Pixi prototype coordinates', () => {
  it('maps an Android-width canvas to the shared 1024 × 1536 space', () => {
    expect(stagePoint(180, 320, { left: 0, top: 50, width: 360, height: 540 })).toEqual({
      x: TRAIN_STAGE.width / 2,
      y: TRAIN_STAGE.height / 2,
    })
  })

  it('recognises the bag drop target', () => {
    expect(isBagInTarget(BAG_TARGET.x, BAG_TARGET.y)).toBe(true)
    expect(isBagInTarget(900, 200)).toBe(false)
  })

  it('keeps all layered artwork in one scene configuration', () => {
    expect(TRAIN_STAGE).toEqual({ width: 1024, height: 1536 })
    expect(trainPixiScene.assets).toEqual({
      background: '/prototypes/train-pixi/background.svg',
      player: '/prototypes/train-pixi/player.svg',
      npcStanding: '/prototypes/train-pixi/npc-standing.svg',
      npcSeated: '/prototypes/train-pixi/npc-seated.svg',
      bagSprite: '/prototypes/train-pixi/bag.svg',
    })
    expect(trainPixiScene.successTransition.settleMs).toBeGreaterThanOrEqual(100)
    expect(trainPixiScene.successTransition.settleMs).toBeLessThanOrEqual(200)
  })
})
