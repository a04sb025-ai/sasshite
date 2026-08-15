import { describe, expect, it } from 'vitest'
import { advanceSession } from './sessionProgress'

describe('session progress', () => {
  it.each([1, 2, 10])('finishes a %i-scene session only after its final scene', totalScenes => {
    let index = 0

    for (let answered = 1; answered <= totalScenes; answered += 1) {
      const progress = advanceSession(index, totalScenes)

      expect(progress.completed).toBe(answered === totalScenes)
      expect(progress.nextIndex).toBe(Math.min(answered, totalScenes - 1))
      index = progress.nextIndex
    }
  })

  it('does not produce an invalid index for an empty or stale session', () => {
    expect(advanceSession(0, 0)).toEqual({ nextIndex: 0, completed: true })
    expect(advanceSession(12, 10)).toEqual({ nextIndex: 9, completed: true })
    expect(advanceSession(-1, 2)).toEqual({ nextIndex: 0, completed: false })
  })
})
