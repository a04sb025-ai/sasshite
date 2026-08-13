import { describe, expect, it } from 'vitest'
import {
  BAG_START,
  BAG_TARGET,
  beginDropTransition,
  dropOutcomeAt,
  draggedBagPosition,
  grabOffset,
  isBagInTarget,
  stagePoint,
  TRAIN_STAGE,
} from './trainPixiModel'
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
    expect(dropOutcomeAt(300, 960)).toBe('lap')
    expect(dropOutcomeAt(365, 1240)).toBe('floor')
    expect(isBagInTarget(900, 200)).toBe(false)
  })

  it('starts the same Before to After transition for both placements', () => {
    expect(beginDropTransition('lap')).toEqual({ state: 'settling', outcome: 'lap' })
    expect(beginDropTransition('floor')).toEqual({ state: 'settling', outcome: 'floor' })
  })

  it('preserves the grabbed point while dragging in sceneRoot coordinates', () => {
    const pointerDown = { x: BAG_START.x + 74, y: BAG_START.y - 39 }
    const offset = grabOffset(pointerDown, BAG_START)
    expect(offset).toEqual({ x: 74, y: -39 })

    const pointerMove = { x: 421, y: 1184 }
    const movedBag = draggedBagPosition(pointerMove, offset)
    expect(movedBag).toEqual({ x: 347, y: 1223 })
    expect({ x: pointerMove.x - movedBag.x, y: pointerMove.y - movedBag.y }).toEqual(offset)
    expect(isBagInTarget(movedBag.x, movedBag.y)).toBe(true)
  })

  it('keeps all layered artwork in one scene configuration', () => {
    expect(TRAIN_STAGE).toEqual({ width: 1024, height: 1536 })
    expect(BAG_START).toEqual({ x: 650, y: 1035 })
    expect(BAG_TARGET).toMatchObject({ id: 'floor', x: 365, y: 1240, radius: 160, consideration: 1 })
    expect(trainPixiScene.assets).toEqual({
      background: '/prototypes/train-pixi/background.svg',
      player: '/prototypes/train-pixi/player.svg',
      npcStanding: '/prototypes/train-pixi/npc-standing.svg',
      afterLap: '/prototypes/train-pixi/npc-seated.svg',
      afterFloor: '/prototypes/train-pixi/npc-seated.svg',
      bagSprite: '/prototypes/train-pixi/bag.svg',
    })
    expect(trainPixiScene.successTransition.settleMs).toBeGreaterThanOrEqual(100)
    expect(trainPixiScene.successTransition.settleMs).toBeLessThanOrEqual(200)
    expect(trainPixiScene.dropZones.map(zone => [zone.id, zone.consideration, zone.result])).toEqual([
      ['lap', 2, 'ひと席ぶん、空気がやわらいだ。'],
      ['floor', 1, '席は空いた。足元に、少し気をつけたい。'],
    ])
  })
})
