import { describe, expect, it } from 'vitest'
import { scenes } from '../data/scenes'
import { ageModes } from '../data/ageModes'
import { awaitingReviewedArtworkSceneIds } from '../data/scenePresentationPolicy'
import { directInteractionActionIds, directInteractionSceneIds } from '../components/SceneArtwork'
import { applyAction, calculatePlayScore, describeReplayFocus, describeScoreChange, diagnose, initialScores, scoreAction } from './scoring'

describe('Ver.0.6 game model', () => {
  it('provides the five core scenes and a timeout action', () => {
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
  it('connects every action to a finite 100-point result', () => {
    const sampleScenes = ageModes.flatMap(mode => mode.scenes)

    for (const scene of sampleScenes) {
      const actionScores = scene.actions.map(action => scoreAction(scene, action))
      expect(actionScores.every(score => Number.isInteger(score) && score >= 0 && score <= 100)).toBe(true)
      expect(Math.max(...actionScores)).toBe(100)
    }

    const records = scenes.map(scene => {
      const action = scene.actions.reduce((best, candidate) =>
        scoreAction(scene, candidate) > scoreAction(scene, best) ? candidate : best,
      )
      return { scene: scene.eyebrow, action: action.history, score: scoreAction(scene, action) }
    })
    expect(calculatePlayScore(records)).toBe(100)
    expect(calculatePlayScore([])).toBe(0)
  })

  it('maps every active meeting control to a distinct direct interaction', () => {
    const meeting = scenes.find(scene => scene.id === 'meeting')

    expect(directInteractionSceneIds).toContain('meeting')
    expect(directInteractionActionIds.meeting).toEqual(['mic', 'hand', 'chat'])
    expect(meeting?.actions.filter(action => action.id !== 'wait').map(action => action.id))
      .toEqual(directInteractionActionIds.meeting)
  })
  it('gives distinct immediate feedback scores when a scene has different action impacts', () => {
    const sampleScenes = ageModes.flatMap(mode => mode.scenes)

    expect(sampleScenes.every(scene =>
      new Set(scene.actions.map(action => scoreAction(scene, action))).size > 1,
    )).toBe(true)
  })
  it('compares replay actions with the previous score without changing the score', () => {
    expect(describeScoreChange(82, null)).toBe('')
    expect(describeScoreChange(82, 64)).toBe('前回より+18点')
    expect(describeScoreChange(64, 82)).toBe('前回より-18点')
    expect(describeScoreChange(82, 82)).toBe('前回と同じ')
  })
  it('turns the lowest-scoring action into a concrete replay prompt', () => {
    const records = [
      { scene: 'エレベーター', action: '開ボタンを押した', score: 100 },
      { scene: '帰り際', action: '少し待った', score: 47 },
      { scene: '会議中', action: '先に話した', score: 47 },
    ]

    expect(describeReplayFocus(records)).toBe('次は「帰り際」で、別の動きも試してみよう。')
    expect(describeReplayFocus(records.map(record => ({ ...record, score: 100 }))))
      .toBe('100点達成。今度は、好きな選び方でもう一度。')
    expect(describeReplayFocus([])).toBe('')
  })
  it('models all age modes and exposes only reviewed representative samples', () => {
    expect(ageModes).toHaveLength(7)
    expect(ageModes.filter(mode => mode.status === 'sample').map(mode => mode.id)).toEqual([
      'kindergarten', 'junior-high', 'working-adult',
    ])
    expect(ageModes.filter(mode => mode.status === 'development').every(mode => mode.scenes.length === 0)).toBe(true)
    expect(ageModes.filter(mode => mode.status === 'sample').every(mode => mode.scenes.length > 0)).toBe(true)
    expect(ageModes.flatMap(mode => mode.scenes).every(scene => scene.actions.some(action => action.id === 'wait'))).toBe(true)
    expect(ageModes.flatMap(mode => mode.scenes).every(scene => scene.presentation?.choices.every(choice =>
      scene.actions.some(action => action.id === choice.actionId),
    ) ?? true)).toBe(true)
  })
  it('offers multiple short kindergarten situations', () => {
    const kindergarten = ageModes.find(mode => mode.id === 'kindergarten')

    expect(kindergarten?.scenes).toHaveLength(2)
    expect(kindergarten?.scenes.every(scene =>
      scene.presentation !== undefined
      && scene.presentation.situation.length <= 35
      && scene.presentation.choices.length >= 2
      && scene.actions.some(action => action.id === 'wait'),
    )).toBe(true)
    expect(awaitingReviewedArtworkSceneIds).toContain('kindergarten-blocks')
    expect(directInteractionSceneIds).toContain('kindergarten-playhouse')
    expect(directInteractionActionIds['kindergarten-playhouse']).toEqual(['invite', 'bring-toy', 'keep-playing'])
    expect(kindergarten?.scenes[1].actions.filter(action => action.id !== 'wait').map(action => action.id))
      .toEqual(directInteractionActionIds['kindergarten-playhouse'])
  })
  it('offers multiple junior-high situations with distinct settings while unreviewed art stays gated', () => {
    const juniorHigh = ageModes.find(mode => mode.id === 'junior-high')

    expect(juniorHigh?.scenes).toHaveLength(2)
    expect(new Set(juniorHigh?.scenes.map(scene => scene.eyebrow)).size).toBe(2)
    expect(juniorHigh?.scenes.every(scene =>
      scene.presentation !== undefined
      && scene.presentation.choices.length >= 3
      && scene.actions.some(action => action.id === 'wait'),
    )).toBe(true)
    expect(awaitingReviewedArtworkSceneIds).toEqual(expect.arrayContaining([
      'junior-high-cleanup',
      'junior-high-break',
    ]))
  })
  it('keeps the representative working-adult situation on choice fallback until reviewed art exists', () => {
    const workingAdult = ageModes.find(mode => mode.id === 'working-adult')
    const documents = workingAdult?.scenes.find(scene => scene.id === 'working-adult-documents')

    expect(documents).toBeDefined()
    expect(documents?.presentation?.choices.length).toBeGreaterThanOrEqual(3)
    expect(awaitingReviewedArtworkSceneIds).toContain('working-adult-documents')
  })
})
