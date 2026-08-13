import { trainPixiScene } from './trainPixiScene'

export const TRAIN_STAGE = trainPixiScene.canvas
export type TrainPrototypeState = 'before' | 'settling' | 'after'
export const BAG_START = trainPixiScene.bag.startPosition
export type TrainOutcome = typeof trainPixiScene.dropZones[number]['id']
export const BAG_TARGET = trainPixiScene.dropZones[1]

export interface Point {
  x: number
  y: number
}

export function grabOffset(pointerPosition: Point, bagPosition: Point): Point {
  return {
    x: pointerPosition.x - bagPosition.x,
    y: pointerPosition.y - bagPosition.y,
  }
}

export function draggedBagPosition(pointerPosition: Point, offset: Point): Point {
  return {
    x: pointerPosition.x - offset.x,
    y: pointerPosition.y - offset.y,
  }
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

export function dropOutcomeAt(x: number, y: number): TrainOutcome | null {
  return trainPixiScene.dropZones.find(zone => Math.hypot(x - zone.x, y - zone.y) <= zone.radius)?.id ?? null
}

export function beginDropTransition(outcome: TrainOutcome) {
  return { state: 'settling' as const, outcome }
}

export function isBagInTarget(x: number, y: number) {
  return dropOutcomeAt(x, y) !== null
}
