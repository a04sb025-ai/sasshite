import { describe, expect, it } from 'vitest'
import { scenes } from '../data/scenes'
import { createSceneOrder } from './sceneOrder'

describe('scene order', () => {
  it('keeps every scene once and reserves the ending for last', () => {
    const sourceIds = scenes.map(scene => scene.id)
    const ordered = createSceneOrder(scenes, [], () => 0)

    expect(ordered.map(scene => scene.id).sort()).toEqual([...sourceIds].sort())
    expect(ordered.at(-1)?.id).toBe('ending')
    expect(scenes.map(scene => scene.id)).toEqual(sourceIds)
  })

  it('does not repeat the previous playable order', () => {
    const previousIds = scenes.map(scene => scene.id)
    const ordered = createSceneOrder(scenes, previousIds, () => 0.999)

    expect(ordered.map(scene => scene.id)).not.toEqual(previousIds)
    expect(ordered.at(-1)?.id).toBe('ending')
  })
})
