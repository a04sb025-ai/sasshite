export type SessionProgress = {
  nextIndex: number
  completed: boolean
}

export function advanceSession(currentIndex: number, totalScenes: number): SessionProgress {
  if (totalScenes <= 0) return { nextIndex: 0, completed: true }

  const lastIndex = totalScenes - 1
  if (currentIndex >= lastIndex) return { nextIndex: lastIndex, completed: true }

  return { nextIndex: Math.max(0, currentIndex + 1), completed: false }
}
