import { describe, expect, it } from 'vitest'
import { BAG_TARGET, isBagInTarget, isWithinStage, stagePoint, TRAIN_SCENE_BOUNDS, TRAIN_STAGE } from './trainPixiModel'

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

  it('keeps every major visual bound inside the shared scene', () => {
    expect(Object.entries(TRAIN_SCENE_BOUNDS).filter(([, bounds]) => !isWithinStage(bounds))).toEqual([])
  })
})
