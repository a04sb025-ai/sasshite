import { useEffect, useRef, useState } from 'react'
import { Application, Assets, Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js'
import { BAG_START, BAG_TARGET, isBagInTarget, stagePoint, TRAIN_STAGE, type TrainPrototypeState } from './trainPixiModel'

const textStyle = new TextStyle({
  fontFamily: 'sans-serif',
  fontSize: 28,
  fill: '#292923',
  fontWeight: '600',
})

export default function TrainPixiPrototype() {
  const hostRef = useRef<HTMLDivElement>(null)
  const setPoseRef = useRef<(state: TrainPrototypeState) => void>(() => undefined)
  const resetBagRef = useRef<() => void>(() => undefined)
  const [state, setState] = useState<TrainPrototypeState>('before')

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    let initialized = false
    const app = new Application()

    void (async () => {
      await app.init({
        width: TRAIN_STAGE.width,
        height: TRAIN_STAGE.height,
        background: '#d8d2c5',
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio, 2),
      })
      initialized = true
      if (disposed) { app.destroy(); return }
      app.canvas.className = 'train-pixi-canvas'
      app.canvas.setAttribute('aria-hidden', 'true')
      host.appendChild(app.canvas)

      const texture = await Assets.load('/scene-art/train.png')
      if (disposed) return
      const background = new Sprite(texture)
      background.width = TRAIN_STAGE.width
      background.height = TRAIN_STAGE.height
      background.alpha = 0.46
      app.stage.addChild(background)

      const wash = new Graphics().rect(0, 0, TRAIN_STAGE.width, TRAIN_STAGE.height).fill({ color: '#f8f3e7', alpha: 0.2 })
      app.stage.addChild(wash)

      const target = new Graphics()
        .roundRect(BAG_TARGET.x - 150, BAG_TARGET.y - 120, 300, 240, 46)
        .fill({ color: '#fff8df', alpha: 0.72 })
        .stroke({ color: '#8d7657', width: 8, alpha: 0.9 })
      app.stage.addChild(target)

      const targetLabel = new Text({ text: 'ここへバッグを移動', style: textStyle })
      targetLabel.anchor.set(0.5)
      targetLabel.position.set(BAG_TARGET.x, BAG_TARGET.y + 6)
      app.stage.addChild(targetLabel)

      const afterLayer = new Container()
      const seatedPassenger = new Graphics()
        .circle(700, 665, 82).fill('#edc59d').stroke({ color: '#39362f', width: 10 })
        .roundRect(590, 740, 220, 250, 70).fill('#6d8592').stroke({ color: '#39362f', width: 10 })
        .roundRect(700, 940, 230, 76, 38).fill('#4f5961').stroke({ color: '#39362f', width: 10 })
      afterLayer.addChild(seatedPassenger)
      const afterLabel = new Text({ text: 'After：乗客が座った', style: textStyle })
      afterLabel.position.set(68, 76)
      afterLayer.addChild(afterLabel)
      afterLayer.visible = false
      app.stage.addChild(afterLayer)

      const beforeLabel = new Text({ text: 'Before：バッグを移動', style: textStyle })
      beforeLabel.position.set(68, 76)
      app.stage.addChild(beforeLabel)

      const bag = new Container()
      const bagBody = new Graphics().roundRect(-118, -82, 236, 164, 32).fill('#b45128').stroke({ color: '#332f2a', width: 10 })
      const handle = new Graphics().roundRect(-58, -130, 116, 76, 36).stroke({ color: '#332f2a', width: 12 })
      const bagLabel = new Text({ text: 'BAG', style: new TextStyle({ ...textStyle, fontSize: 30, fill: '#fff9ec' }) })
      bagLabel.anchor.set(0.5)
      bag.addChild(handle, bagBody, bagLabel)
      bag.position.set(BAG_START.x, BAG_START.y)
      bag.eventMode = 'static'
      bag.cursor = 'grab'
      app.stage.addChild(bag)

      let dragging = false
      bag.on('pointerdown', () => { dragging = true; bag.cursor = 'grabbing' })
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
        if (isBagInTarget(bag.x, bag.y)) setState('after')
        else bag.position.set(BAG_START.x, BAG_START.y)
      }
      app.stage.on('pointerup', finishDrag)
      app.stage.on('pointerupoutside', finishDrag)

      setPoseRef.current = next => {
        const after = next === 'after'
        afterLayer.visible = after
        beforeLabel.visible = !after
        target.visible = !after
        targetLabel.visible = !after
        bag.visible = !after
      }
      resetBagRef.current = () => bag.position.set(BAG_START.x, BAG_START.y)
      setPoseRef.current(state)
    })()

    return () => {
      disposed = true
      setPoseRef.current = () => undefined
      resetBagRef.current = () => undefined
      if (initialized) app.destroy(true, { children: true, texture: false })
    }
  }, [])

  useEffect(() => { setPoseRef.current(state) }, [state])

  const reset = () => {
    resetBagRef.current()
    setState('before')
  }

  return <main className="train-prototype-page">
    <header className="train-prototype-header">
      <p>PixiJS Prototype v1 · 1024 × 1536</p>
      <h1>電車ステージ技術検証</h1>
      <p>バッグを点線の場所へドラッグしてください。</p>
    </header>
    <div
      ref={hostRef}
      className="train-pixi-host"
      onPointerDown={event => {
        // Keep the coordinate conversion exercised at the DOM boundary as documentation for future React hit areas.
        if (hostRef.current) stagePoint(event.clientX, event.clientY, hostRef.current.getBoundingClientRect())
      }}
    />
    <p className="train-prototype-status" aria-live="polite">
      {state === 'before' ? 'Before：バッグが隣の席にあります。' : 'After：バッグを移動し、乗客が座りました。'}
    </p>
    <div className="train-prototype-controls" aria-label="状態確認">
      <button type="button" onClick={() => setState('before')} aria-pressed={state === 'before'}>Before</button>
      <button type="button" onClick={() => setState('after')} aria-pressed={state === 'after'}>After</button>
      <button type="button" onClick={reset}>やり直す</button>
    </div>
    <p className="train-prototype-note">本番ゲームとは接続していない、描画と操作だけの仮素材ページです。</p>
  </main>
}
