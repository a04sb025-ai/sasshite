export const TRAIN_STAGE = { width: 1024, height: 1536 } as const

export type TrainPrototypeState = 'before' | 'after'

export const BAG_START = { x: 670, y: 900 } as const
export const BAG_TARGET = { x: 350, y: 1080, radius: 170 } as const

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
