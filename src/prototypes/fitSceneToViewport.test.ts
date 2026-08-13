import { describe, expect, it } from 'vitest'
import { fitSceneToViewport } from './fitSceneToViewport'

const scene = { x: 0, y: 86, width: 1024, height: 1339 }
const screens = [
  { device: '320 × 700', width: 320, height: 400 },
  { device: '360 × 800', width: 360, height: 450 },
  { device: '430 × 900', width: 430, height: 538 },
]

describe('fitSceneToViewport', () => {
  it.each(screens)('fits the entire scene at $width × $height with one transform', viewport => {
    const fit = fitSceneToViewport(scene, { x: 0, y: 0, ...viewport }, 12)
    const left = scene.x * fit.scale + fit.x
    const top = scene.y * fit.scale + fit.y
    const right = (scene.x + scene.width) * fit.scale + fit.x
    const bottom = (scene.y + scene.height) * fit.scale + fit.y
    expect(left).toBeGreaterThanOrEqual(11.999)
    expect(top).toBeGreaterThanOrEqual(11.999)
    expect(right).toBeLessThanOrEqual(viewport.width - 11.999)
    expect(bottom).toBeLessThanOrEqual(viewport.height - 11.999)
  })

  it('keeps the same composition across Pixel-class portrait widths', () => {
    const fits = screens.map(viewport => fitSceneToViewport(scene, { x: 0, y: 0, ...viewport }, 12))
    expect(fits.map(fit => Number(fit.scale.toFixed(4)))).toEqual([0.2808, 0.3181, 0.3839])
  })
})
