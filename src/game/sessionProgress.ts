export type SessionProgress = {
  nextIndex: number
  completed: boolean
}

export function advanceSession(currentIndex: number, totalScenes: number): SessionProgress {
  if (!Number.isFinite(totalScenes) || totalScenes <= 0) {
    return { nextIndex: 0, completed: true }
  }

  const lastIndex = totalScenes - 1
  const safeIndex = Number.isFinite(currentIndex) ? Math.floor(currentIndex) : 0
  if (safeIndex >= lastIndex) return { nextIndex: lastIndex, completed: true }

  return { nextIndex: Math.max(0, safeIndex + 1), completed: false }
}
