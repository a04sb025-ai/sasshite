import type { Scene } from '../types'

// These scenes have interaction ideas, but their current code-drawn placeholder art
// has not passed human visual review. Keep the readable choice presentation in the
// live game until reviewed local artwork is ready.
export const awaitingReviewedArtworkSceneIds = [
  'kindergarten-blocks',
  'junior-high-cleanup',
  'junior-high-break',
  'working-adult-documents',
] as const satisfies readonly Scene['id'][]

export function isAwaitingReviewedArtwork(sceneId: Scene['id']): boolean {
  return (awaitingReviewedArtworkSceneIds as readonly Scene['id'][]).includes(sceneId)
}
