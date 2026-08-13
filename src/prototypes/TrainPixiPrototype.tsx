import { useEffect, useRef, useState } from 'react'
import { Application, Assets, Container, Graphics, Sprite } from 'pixi.js'
import { fitSceneToViewport } from './fitSceneToViewport'
import { draggedBagPosition, grabOffset, isBagInTarget, type Point, type TrainPrototypeState } from './trainPixiModel'
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
    let resizeObserver: ResizeObserver | undefined
    const app = new Application()

    void (async () => {
      await app.init({
        width: 1,
        height: 1,
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

      const [backgroundTexture, playerTexture, standingTexture, seatedTexture, bagTexture] = await Promise.all([
        Assets.load(trainPixiScene.assets.background),
        Assets.load(trainPixiScene.assets.player),
        Assets.load(trainPixiScene.assets.npcStanding),
        Assets.load(trainPixiScene.assets.npcSeated),
        Assets.load(trainPixiScene.assets.bagSprite),
      ])
      if (disposed) return

      const sceneRoot = new Container({ label: 'sceneRoot' })
      const background = new Container({ label: 'background' })
      const player = new Container({ label: 'player' })
      const npc = new Container({ label: 'npc' })
      const dropZone = new Container({ label: 'dropZone' })
      const backgroundSprite = new Sprite(backgroundTexture)
      const playerSprite = new Sprite(playerTexture)
      const standingNpc = new Sprite(standingTexture)
      const seatedNpc = new Sprite(seatedTexture)
      for (const artwork of [backgroundSprite, playerSprite, standingNpc, seatedNpc]) {
        artwork.position.set(trainPixiScene.artwork.x, trainPixiScene.artwork.y)
        artwork.width = trainPixiScene.artwork.width
        artwork.height = trainPixiScene.artwork.height
      }
      seatedNpc.alpha = 0
      background.addChild(backgroundSprite)
      player.addChild(playerSprite)
      npc.addChild(standingNpc, seatedNpc)

      const target = trainPixiScene.dropZones[0]
      const targetMarker = new Graphics()
        .circle(target.x, target.y, target.radius)
        .fill({ color: '#fff8df', alpha: 0.28 })
        .stroke({ color: '#8d7657', width: 8, alpha: 0.75 })
      dropZone.addChild(targetMarker)

      const bag = new Sprite(bagTexture)
      bag.label = 'bag'
      bag.anchor.set(trainPixiScene.bag.anchor.x, trainPixiScene.bag.anchor.y)
      bag.width = trainPixiScene.bag.size.width
      bag.height = trainPixiScene.bag.size.height
      bag.position.set(trainPixiScene.bag.startPosition.x, trainPixiScene.bag.startPosition.y)
      bag.eventMode = 'static'
      bag.cursor = 'grab'
      sceneRoot.addChild(background, player, npc, dropZone, bag)
      app.stage.addChild(sceneRoot)

      const debug = new URLSearchParams(window.location.search).has('debug')
      const viewportDebug = new Graphics({ label: 'viewportDebug' })
      app.stage.addChild(viewportDebug)
      const fitScene = () => {
        const width = Math.max(1, Math.round(host.clientWidth))
        const height = Math.max(1, Math.round(host.clientHeight))
        app.renderer.resize(width, height)
        sceneRoot.scale.set(1)
        sceneRoot.position.set(0)
        const bounds = sceneRoot.getLocalBounds()
        const viewport = { x: 0, y: 0, width: app.screen.width, height: app.screen.height }
        const fit = fitSceneToViewport(bounds, viewport, trainPixiScene.viewportPadding)
        sceneRoot.scale.set(fit.scale)
        sceneRoot.position.set(fit.x, fit.y)
        viewportDebug.clear()
        if (debug) {
          viewportDebug.rect(1, 1, viewport.width - 2, viewport.height - 2).stroke({ color: '#1463ff', width: 2 })
          viewportDebug
            .rect(fit.x + bounds.x * fit.scale, fit.y + bounds.y * fit.scale, bounds.width * fit.scale, bounds.height * fit.scale)
            .stroke({ color: '#ff2d55', width: 2 })
          console.info('[TrainPixi viewport]', { sceneBounds: bounds.rectangle, viewport, fit })
        }
      }
      resizeObserver = new ResizeObserver(fitScene)
      resizeObserver.observe(host)
      fitScene()

      let dragging = false
      let pointerGrabOffset: Point = { x: 0, y: 0 }
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
        standingNpc.alpha = 1
        seatedNpc.alpha = 0
      }
      const crossfade = () => {
        interactionEnabled = false
        bag.visible = false
        const startedAt = performance.now()
        const draw = (now: number) => {
          const progress = Math.min((now - startedAt) / trainPixiScene.successTransition.crossfadeMs, 1)
          standingNpc.alpha = 1 - progress
          seatedNpc.alpha = progress
          if (progress < 1 && !disposed) animationFrame = requestAnimationFrame(draw)
        }
        animationFrame = requestAnimationFrame(draw)
      }

      bag.on('pointerdown', event => {
        if (!interactionEnabled) return
        const pointer = event.getLocalPosition(sceneRoot)
        pointerGrabOffset = grabOffset(pointer, bag.position)
        dragging = true
        bag.cursor = 'grabbing'
      })
      app.stage.eventMode = 'static'
      app.stage.hitArea = app.screen
      app.stage.on('pointermove', event => {
        if (!dragging) return
        const pointer = event.getLocalPosition(sceneRoot)
        const position = draggedBagPosition(pointer, pointerGrabOffset)
        bag.position.set(position.x, position.y)
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
      resizeObserver?.disconnect()
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
    <div ref={hostRef} className="train-pixi-host" />
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
