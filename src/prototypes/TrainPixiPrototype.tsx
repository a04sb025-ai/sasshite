import { useEffect, useRef, useState } from 'react'
import { Application, Assets, Container, Graphics, Sprite } from 'pixi.js'
import { fitSceneToViewport } from './fitSceneToViewport'
import { beginDropTransition, draggedBagPosition, dropOutcomeAt, grabOffset, type Point, type TrainOutcome, type TrainPrototypeState } from './trainPixiModel'
import { trainPixiScene } from './trainPixiScene'

export default function TrainPixiPrototype() {
  const hostRef = useRef<HTMLDivElement>(null)
  const showStateRef = useRef<(state: TrainPrototypeState) => void>(() => undefined)
  const resetSceneRef = useRef<() => void>(() => undefined)
  const outcomeRef = useRef<TrainOutcome | null>(null)
  const [state, setState] = useState<TrainPrototypeState>('before')
  const [outcome, setOutcome] = useState<TrainOutcome | null>(null)

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

      const [backgroundTexture, playerTexture, standingTexture, afterLapTexture, afterFloorTexture, bagTexture] = await Promise.all([
        Assets.load(trainPixiScene.assets.background),
        Assets.load(trainPixiScene.assets.player),
        Assets.load(trainPixiScene.assets.npcStanding),
        Assets.load(trainPixiScene.assets.afterLap),
        Assets.load(trainPixiScene.assets.afterFloor),
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
      const afterLapNpc = new Sprite(afterLapTexture)
      const afterFloorNpc = new Sprite(afterFloorTexture)
      for (const artwork of [backgroundSprite, playerSprite, standingNpc, afterLapNpc, afterFloorNpc]) {
        artwork.position.set(trainPixiScene.artwork.x, trainPixiScene.artwork.y)
        artwork.width = trainPixiScene.artwork.width
        artwork.height = trainPixiScene.artwork.height
      }
      afterLapNpc.alpha = 0
      afterFloorNpc.alpha = 0
      background.addChild(backgroundSprite)
      player.addChild(playerSprite)
      npc.addChild(standingNpc, afterLapNpc, afterFloorNpc)

      for (const target of trainPixiScene.dropZones) {
        // Invisible geometry keeps both destinations in sceneRoot bounds without revealing an answer guide.
        dropZone.addChild(new Graphics().circle(target.x, target.y, target.radius).fill({ color: '#000000', alpha: 0 }))
      }

      const bag = new Sprite(bagTexture)
      bag.label = 'bag'
      bag.anchor.set(trainPixiScene.bag.anchor.x, trainPixiScene.bag.anchor.y)
      bag.width = trainPixiScene.bag.size.width
      bag.height = trainPixiScene.bag.size.height
      const restingBagScale = { x: bag.scale.x, y: bag.scale.y }
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
        bag.scale.set(restingBagScale.x, restingBagScale.y)
        bag.visible = true
        bag.position.set(trainPixiScene.bag.startPosition.x, trainPixiScene.bag.startPosition.y)
        standingNpc.alpha = 1
        afterLapNpc.alpha = 0
        afterFloorNpc.alpha = 0
      }
      const crossfade = (result: TrainOutcome) => {
        interactionEnabled = false
        bag.visible = false
        const afterNpc = result === 'lap' ? afterLapNpc : afterFloorNpc
        const startedAt = performance.now()
        const draw = (now: number) => {
          const progress = Math.min((now - startedAt) / trainPixiScene.successTransition.crossfadeMs, 1)
          standingNpc.alpha = 1 - progress
          afterNpc.alpha = progress
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
        bag.scale.set(restingBagScale.x * 1.05, restingBagScale.y * 1.05)
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
        bag.scale.set(restingBagScale.x, restingBagScale.y)
        const result = dropOutcomeAt(bag.x, bag.y)
        if (result) {
          const transition = beginDropTransition(result)
          interactionEnabled = false
          const target = trainPixiScene.dropZones.find(zone => zone.id === transition.outcome)!
          bag.position.set(target.x, target.y)
          outcomeRef.current = transition.outcome
          setOutcome(transition.outcome)
          setState(transition.state)
          settleTimer = window.setTimeout(() => setState('after'), trainPixiScene.successTransition.settleMs)
        } else {
          bag.position.set(trainPixiScene.bag.startPosition.x, trainPixiScene.bag.startPosition.y)
        }
      }
      app.stage.on('pointerup', finishDrag)
      app.stage.on('pointerupoutside', finishDrag)

      showStateRef.current = next => {
        if (next === 'before') resetScene()
        if (next === 'after' && outcomeRef.current) crossfade(outcomeRef.current)
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
    outcomeRef.current = null
    setOutcome(null)
    setState('before')
  }

  return <main className="train-prototype-page">
    <header className="train-prototype-header">
      <h1>電車の中</h1>
    </header>
    <div ref={hostRef} className="train-pixi-host" />
    <p className="train-prototype-status" aria-live="polite">
      {state === 'after' && outcome && trainPixiScene.dropZones.find(zone => zone.id === outcome)?.result}
    </p>
    <div className="train-prototype-controls train-prototype-controls--reset">
      <button type="button" onClick={reset}>やり直す</button>
    </div>
  </main>
}
