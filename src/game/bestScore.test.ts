import { describe, expect, it } from 'vitest'
import { describeBestScore, readBestScore, recordBestScore } from './bestScore'

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  }
}

describe('best score', () => {
  it('keeps only the highest score for each age mode', () => {
    const storage = memoryStorage()

    expect(recordBestScore(storage, 'kindergarten', 64)).toEqual({ best: 64, improved: true })
    expect(recordBestScore(storage, 'kindergarten', 51)).toEqual({ best: 64, improved: false })
    expect(recordBestScore(storage, 'kindergarten', 82)).toEqual({ best: 82, improved: true })
    expect(readBestScore(storage, 'kindergarten')).toBe(82)
    expect(readBestScore(storage, 'working-adult')).toBeNull()
  })

  it('ignores invalid saved values', () => {
    const storage = { getItem: () => 'not-a-score', setItem: () => undefined }
    expect(readBestScore(storage, 'junior-high')).toBeNull()
  })

  it('continues when storage is unavailable', () => {
    const storage = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
    }

    expect(recordBestScore(storage, 'working-adult', 73)).toEqual({ best: 73, improved: true })
  })

  it('describes the next replay target from the personal best', () => {
    expect(describeBestScore(82, 82, true)).toBe('自己ベスト 82点・更新！')
    expect(describeBestScore(74, 82, false)).toBe('自己ベスト 82点・あと8点')
    expect(describeBestScore(82, 82, false)).toBe('自己ベスト 82点・同点')
  })
})
