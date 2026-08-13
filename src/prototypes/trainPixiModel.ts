import { trainPixiScene } from './trainPixiScene'

export const TRAIN_STAGE = trainPixiScene.canvas
export type TrainPrototypeState = 'before' | 'settling' | 'after'
export const BAG_START = trainPixiScene.bag.startPosition
export const BAG_TARGET = trainPixiScene.dropZones[0]

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
  return trainPixiScene.dropZones.some(zone => Math.hypot(x - zone.x, y - zone.y) <= zone.radius)
}
