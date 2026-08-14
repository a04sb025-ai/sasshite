export interface BoundsLike {
  x: number
  y: number
  width: number
  height: number
}

export interface SceneFit {
  scale: number
  x: number
  y: number
}

/** Fits the complete scene into a viewport with one uniform scale and translation. */
export function fitSceneToViewport(
  sceneBounds: BoundsLike,
  viewportBounds: BoundsLike,
  padding = 0,
): SceneFit {
  const availableWidth = Math.max(0, viewportBounds.width - padding * 2)
  const availableHeight = Math.max(0, viewportBounds.height - padding * 2)
  if (sceneBounds.width <= 0 || sceneBounds.height <= 0 || availableWidth <= 0 || availableHeight <= 0) {
    return { scale: 1, x: viewportBounds.x, y: viewportBounds.y }
  }

  const scale = Math.min(availableWidth / sceneBounds.width, availableHeight / sceneBounds.height)
  return {
    scale,
    x: viewportBounds.x + (viewportBounds.width - sceneBounds.width * scale) / 2 - sceneBounds.x * scale,
    y: viewportBounds.y + (viewportBounds.height - sceneBounds.height * scale) / 2 - sceneBounds.y * scale,
  }
}
