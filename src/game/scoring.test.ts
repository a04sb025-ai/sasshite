import { describe, expect, it } from 'vitest'
import { scenes } from '../data/scenes'
import { applyChoice, diagnose, initialScores } from './scoring'

describe('game scoring', () => {
  it('provides five playable scenes with three meaningful choices', () => {
    expect(scenes).toHaveLength(5)
    expect(scenes.every(scene => scene.choices.length === 3)).toBe(true)
    expect(scenes.every(scene => scene.choices.some(choice => choice.id === scene.timeoutChoiceId))).toBe(true)
    expect(scenes.every(scene => scene.choices.every(choice => choice.reaction.length > 0))).toBe(true)
  })

  it('applies choices without exceeding the 0–100 range', () => {
    let scores = initialScores
    for (let pass = 0; pass < 10; pass++) for (const scene of scenes) scores = applyChoice(scores, scene.choices[0])
    expect(Object.values(scores).every(value => value >= 0 && value <= 100)).toBe(true)
  })

  it('changes the diagnosis based on the play style', () => {
    expect(diagnose({ awareness: 88, kindness: 82, assertiveness: 42, nerve: 50 }).title).toBe('察しすぎセンサー')
    expect(diagnose({ awareness: 74, kindness: 58, assertiveness: 72, nerve: 62 }).title).toBe('読んで、動く人')
    expect(diagnose({ awareness: 40, kindness: 35, assertiveness: 82, nerve: 82 }).title).toBe('マイペース強者')
  })
})
