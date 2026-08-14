import { describe, expect, it } from 'vitest'
import { scenes } from '../data/scenes'
import type { Scene } from '../types'
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

  it('builds a session of at most ten unique scenes', () => {
    const pool: Scene[] = Array.from({ length: 12 }, (_, index) => ({
      id: `scene-${index}`,
      eyebrow: `場面${index}`,
      timeoutMs: 10_000,
      actions: [],
    }))

    const ordered = createSceneOrder(pool, [], () => 0)

    expect(ordered).toHaveLength(10)
    expect(new Set(ordered.map(scene => scene.id)).size).toBe(10)
    expect(pool).toHaveLength(12)
  })

  it('reserves an ending within the ten-scene session', () => {
    const pool: Scene[] = Array.from({ length: 11 }, (_, index) => ({
      id: `scene-${index}`,
      eyebrow: `場面${index}`,
      timeoutMs: 10_000,
      actions: [],
    }))
    pool.push({ id: 'ending', eyebrow: '終幕', timeoutMs: 10_000, actions: [] })

    const ordered = createSceneOrder(pool, [], () => 0)

    expect(ordered).toHaveLength(10)
    expect(ordered.at(-1)?.id).toBe('ending')
    expect(new Set(ordered.map(scene => scene.id)).size).toBe(10)
  })
})
