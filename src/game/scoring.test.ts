import { describe, expect, it } from 'vitest'
import { scenes } from '../data/scenes'
import { applyAction, diagnose, initialScores } from './scoring'

describe('Ver.0.6 game model', () => {
  it('provides five direct-interaction scenes and a timeout action', () => {
    expect(scenes).toHaveLength(5)
    expect(scenes.every(scene => scene.timeoutMs >= 10_000 && scene.actions.some(item => item.id === 'wait'))).toBe(true)
    expect(scenes.flatMap(scene => scene.actions).every(item => item.history && item.reaction)).toBe(true)
  })
  it('applies actions without mutating or exceeding the score range', () => {
    const before = { ...initialScores }
    const result = scenes.flatMap(scene => scene.actions).reduce(applyAction, initialScores)
    expect(initialScores).toEqual(before)
    expect(Object.values(result).every(value => value >= 0 && value <= 100)).toBe(true)
  })
  it('describes different habits without a right-answer count', () => {
    expect(diagnose({ awareness: 90, kindness: 90, assertiveness: 40, nerve: 40, hesitation: 0 }).title).toContain('疲れる')
    expect(diagnose({ awareness: 40, kindness: 40, assertiveness: 40, nerve: 90, hesitation: 0 }).title).toBe('鋼のマイペース')
  })
})
