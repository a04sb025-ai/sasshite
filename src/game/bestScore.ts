import type { AgeModeId } from '../types'

type BestScoreStorage = Pick<Storage, 'getItem' | 'setItem'>

const storageKey = (ageModeId: AgeModeId) => `sasshite:best-score:${ageModeId}`

export function readBestScore(storage: BestScoreStorage | null, ageModeId: AgeModeId): number | null {
  if (!storage) return null

  try {
    const saved = storage.getItem(storageKey(ageModeId))
    if (saved === null) return null
    const value = Number(saved)
    return Number.isInteger(value) && value >= 0 && value <= 100 ? value : null
  } catch {
    return null
  }
}

export function getBestScoreStorage(): BestScoreStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function recordBestScore(
  storage: BestScoreStorage | null,
  ageModeId: AgeModeId,
  score: number,
): { best: number, improved: boolean } {
  const currentBest = readBestScore(storage, ageModeId)
  const improved = currentBest === null || score > currentBest
  const best = improved ? score : currentBest

  if (improved && storage) {
    try {
      storage.setItem(storageKey(ageModeId), String(score))
    } catch {
      // A full or restricted localStorage must not stop the result screen.
    }
  }

  return { best, improved }
}
