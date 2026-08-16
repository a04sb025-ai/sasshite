export type SessionProgress = {
  nextIndex: number
  completed: boolean
}

export function advanceSession(currentIndex: number, totalScenes: number): SessionProgress {
  const sceneCount = Math.floor(totalScenes)
  if (!Number.isFinite(sceneCount) || sceneCount <= 0) return { nextIndex: 0, completed: true }

  const lastIndex = sceneCount - 1
  const safeIndex = Number.isNaN(currentIndex) ? 0 : currentIndex
  if (safeIndex >= lastIndex) return { nextIndex: lastIndex, completed: true }

  return { nextIndex: Math.max(0, Math.floor(safeIndex) + 1), completed: false }
}
