import { useEffect, useRef, useState } from 'react'
import { Application, Assets, Sprite } from 'pixi.js'
import { isBagInTarget, stagePoint, TRAIN_STAGE, type TrainPrototypeState } from './trainPixiModel'
import { trainPixiScene } from './trainPixiScene'

export default function TrainPixiPrototype() {
  const hostRef = useRef<HTMLDivElement>(null)
  const showStateRef = useRef<(state: TrainPrototypeState) => void>(() => undefined)
  const resetSceneRef = useRef<() => void>(() => undefined)
  const [state, setState] = useState<TrainPrototypeState>('before')

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    let initialized = false
    let settleTimer: number | undefined
    let animationFrame: number | undefined
    const app = new Application()

    void (async () => {
      await app.init({
        width: TRAIN_STAGE.width,
        height: TRAIN_STAGE.height,
        background: '#eee9df',
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio, 2),
      })
      initialized = true
      if (disposed) { app.destroy(); return }
      app.canvas.className = 'train-pixi-canvas'
      app.canvas.setAttribute('aria-hidden', 'true')
      host.appendChild(app.canvas)

      const [beforeTexture, afterTexture, bagTexture] = await Promise.all([
        Assets.load(trainPixiScene.assets.beforeBackground),
        Assets.load(trainPixiScene.assets.afterBackground),
        Assets.load(trainPixiScene.assets.bagSprite),
      ])
      if (disposed) return

      const before = new Sprite(beforeTexture)
      const after = new Sprite(afterTexture)
      for (const background of [before, after]) {
        background.width = TRAIN_STAGE.width
        background.height = TRAIN_STAGE.height
      }
      after.alpha = 0
      app.stage.addChild(before, after)

      const bag = new Sprite(bagTexture)
      bag.anchor.set(trainPixiScene.bag.anchor.x, trainPixiScene.bag.anchor.y)
      bag.width = trainPixiScene.bag.size.width
      bag.height = trainPixiScene.bag.size.height
      bag.position.set(trainPixiScene.bag.startPosition.x, trainPixiScene.bag.startPosition.y)
      bag.eventMode = 'static'
      bag.cursor = 'grab'
      app.stage.addChild(bag)

      let dragging = false
      let interactionEnabled = true
      const cancelTransition = () => {
        window.clearTimeout(settleTimer)
        if (animationFrame !== undefined) cancelAnimationFrame(animationFrame)
      }
      const resetScene = () => {
        cancelTransition()
        dragging = false
        interactionEnabled = true
        bag.cursor = 'grab'
        bag.visible = true
        bag.position.set(trainPixiScene.bag.startPosition.x, trainPixiScene.bag.startPosition.y)
        before.alpha = 1
        after.alpha = 0
      }
      const crossfade = () => {
        interactionEnabled = false
        bag.visible = false
        const startedAt = performance.now()
        const draw = (now: number) => {
          const progress = Math.min((now - startedAt) / trainPixiScene.successTransition.crossfadeMs, 1)
          before.alpha = 1 - progress
          after.alpha = progress
          if (progress < 1 && !disposed) animationFrame = requestAnimationFrame(draw)
        }
        animationFrame = requestAnimationFrame(draw)
      }

      bag.on('pointerdown', () => {
        if (!interactionEnabled) return
        dragging = true
        bag.cursor = 'grabbing'
      })
      app.stage.eventMode = 'static'
      app.stage.hitArea = app.screen
      app.stage.on('pointermove', event => {
        if (!dragging) return
        const point = event.getLocalPosition(app.stage)
        bag.position.set(point.x, point.y)
      })
      const finishDrag = () => {
        if (!dragging) return
        dragging = false
        bag.cursor = 'grab'
        if (isBagInTarget(bag.x, bag.y)) {
          interactionEnabled = false
          const target = trainPixiScene.dropZones[0]
          bag.position.set(target.x, target.y)
          setState('settling')
          settleTimer = window.setTimeout(() => setState('after'), trainPixiScene.successTransition.settleMs)
        } else {
          bag.position.set(trainPixiScene.bag.startPosition.x, trainPixiScene.bag.startPosition.y)
        }
      }
      app.stage.on('pointerup', finishDrag)
      app.stage.on('pointerupoutside', finishDrag)

      showStateRef.current = next => {
        if (next === 'before') resetScene()
        if (next === 'after') crossfade()
      }
      resetSceneRef.current = resetScene
      resetScene()
    })()

    return () => {
      disposed = true
      window.clearTimeout(settleTimer)
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame)
      showStateRef.current = () => undefined
      resetSceneRef.current = () => undefined
      if (initialized) app.destroy(true, { children: true, texture: false })
    }
  }, [])

  useEffect(() => { showStateRef.current(state) }, [state])

  const reset = () => {
    resetSceneRef.current()
    setState('before')
  }

  return <main className="train-prototype-page">
    <header className="train-prototype-header">
      <p>Layered Art + PixiJS Prototype v1 · 1024 × 1536</p>
      <h1>電車ステージ技術検証</h1>
      <p>隣の席にあるバッグを床へ移動してください。</p>
    </header>
    <div
      ref={hostRef}
      className="train-pixi-host"
      onPointerDown={event => {
        if (hostRef.current) stagePoint(event.clientX, event.clientY, hostRef.current.getBoundingClientRect())
      }}
    />
    <p className="train-prototype-status" aria-live="polite">
      {state === 'before' && 'Before：バッグが隣の席にあります。'}
      {state === 'settling' && 'バッグを移動しました…'}
      {state === 'after' && 'After：空いた席に乗客が座りました。'}
    </p>
    <div className="train-prototype-controls" aria-label="状態確認">
      <button type="button" onClick={reset} aria-pressed={state === 'before'}>Before</button>
      <button type="button" onClick={() => setState('after')} aria-pressed={state === 'after'}>After</button>
      <button type="button" onClick={reset}>やり直す</button>
    </div>
    <p className="train-prototype-note">背景とバッグを独立した画像として描画する、本番ゲーム未接続の仮素材ページです。</p>
  </main>
}
