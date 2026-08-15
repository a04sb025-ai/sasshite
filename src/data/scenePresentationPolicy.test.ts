import { describe, expect, it } from 'vitest'
import { ageModes } from './ageModes'
import { awaitingReviewedArtworkSceneIds, isAwaitingReviewedArtwork } from './scenePresentationPolicy'

describe('scene presentation quality gate', () => {
  it('keeps unreviewed code-drawn sample scenes on the readable choice fallback', () => {
    expect(awaitingReviewedArtworkSceneIds).toEqual([
      'kindergarten-blocks',
      'junior-high-cleanup',
      'junior-high-break',
      'working-adult-documents',
    ])

    for (const sceneId of awaitingReviewedArtworkSceneIds) {
      const scene = ageModes.flatMap(mode => mode.scenes).find(item => item.id === sceneId)
      expect(scene?.presentation).toBeDefined()
      expect(isAwaitingReviewedArtwork(sceneId)).toBe(true)
    }
  })

  it('does not block reviewed image-backed scenes', () => {
    expect(isAwaitingReviewedArtwork('kindergarten-playhouse')).toBe(false)
    expect(isAwaitingReviewedArtwork('meeting')).toBe(false)
    expect(isAwaitingReviewedArtwork('train')).toBe(false)
  })
})
