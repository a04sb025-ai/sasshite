export const TRAIN_STAGE = { width: 1024, height: 1536 } as const

export type TrainPrototypeState = 'before' | 'after'

export const BAG_START = { x: 670, y: 900 } as const
export const BAG_TARGET = { x: 350, y: 1080, radius: 170 } as const

export type SceneBounds = { x: number; y: number; width: number; height: number }

export const TRAIN_SCENE_BOUNDS = {
  scene: { x: 0, y: 0, width: 1024, height: 1536 },
  background: { x: 0, y: 0, width: 1024, height: 1536 },
  player: { x: 38, y: 474, width: 330, height: 860 },
  npc: { x: 655, y: 319, width: 322, height: 1010 },
  bag: { x: BAG_START.x - 118, y: BAG_START.y - 130, width: 236, height: 212 },
  dropZone: { x: BAG_TARGET.x - 150, y: BAG_TARGET.y - 120, width: 300, height: 240 },
} satisfies Record<string, SceneBounds>

export function isWithinStage(bounds: SceneBounds) {
  return bounds.x >= 0
    && bounds.y >= 0
    && bounds.x + bounds.width <= TRAIN_STAGE.width
    && bounds.y + bounds.height <= TRAIN_STAGE.height
}

export function stagePoint(
  clientX: number,
  clientY: number,
  bounds: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
) {
  return {
    x: (clientX - bounds.left) * TRAIN_STAGE.width / bounds.width,
    y: (clientY - bounds.top) * TRAIN_STAGE.height / bounds.height,
  }
}

export function isBagInTarget(x: number, y: number) {
  return Math.hypot(x - BAG_TARGET.x, y - BAG_TARGET.y) <= BAG_TARGET.radius
}
