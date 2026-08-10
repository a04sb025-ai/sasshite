import { describe, expect, it } from 'vitest'
import { scenes } from '../data/scenes'
import { applyChoice, diagnose, initialScores } from './scoring'

describe('game scoring', () => {
  it('provides five playable scenes with a wait outcome', () => {
    expect(scenes).toHaveLength(5)
    expect(scenes.every(scene => scene.choices.some(choice => choice.id === 'wait') || scene.id === 'ending')).toBe(true)
  })
  it('applies choices without exceeding the 0–100 range', () => {
    let scores = initialScores
    for (let pass = 0; pass < 10; pass++) for (const scene of scenes) scores = applyChoice(scores, scene.choices[0])
    expect(Object.values(scores).every(value => value >= 0 && value <= 100)).toBe(true)
  })
  it('changes the diagnosis based on the parameters', () => {
    expect(diagnose({ awareness: 90, kindness: 90, assertiveness: 30, nerve: 30 }).title).toBe('空気読みの忍者')
    expect(diagnose({ awareness: 20, kindness: 30, assertiveness: 80, nerve: 90 }).title).toBe('空気？ありました？')
  })
})
