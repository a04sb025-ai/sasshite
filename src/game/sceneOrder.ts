import type { Scene } from '../types'

export function createSceneOrder(
  source: readonly Scene[],
  previousIds: readonly Scene['id'][] = [],
  random: () => number = Math.random,
): Scene[] {
  const ending = source.find(scene => scene.id === 'ending')
  const playable = source.filter(scene => scene.id !== 'ending')

  for (let index = playable.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = playable[index]
    playable[index] = playable[swapIndex]
    playable[swapIndex] = current
  }

  const ordered = ending ? [...playable, ending] : playable
  const repeated = ordered.length > 2
    && ordered.every((scene, index) => scene.id === previousIds[index])

  if (repeated) {
    const first = ordered.shift()
    if (first) ordered.splice(ordered.length - (ending ? 1 : 0), 0, first)
  }

  return ordered
}
