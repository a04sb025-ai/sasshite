import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react'
import type { Scene } from '../types'
import bagAsset from '../assets/objects/bag.svg'
import paperAsset from '../assets/objects/paper.svg'
import endingArtwork from '../assets/scenes/ending.svg'
import elevatorArtwork from '../assets/scenes/elevator.svg'
import karaageAsset from '../assets/objects/karaage.svg'
import karaageArtwork from '../assets/scenes/karaage.svg'
import meetingArtwork from '../assets/scenes/meeting.svg'
import trainArtwork from '../assets/scenes/train.svg'
import extra00 from '../assets/scenes/v07/00.txt?raw'
import extra01 from '../assets/scenes/v07/01.txt?raw'
import extra02 from '../assets/scenes/v07/02.txt?raw'
import extra03 from '../assets/scenes/v07/03.txt?raw'
import extra04 from '../assets/scenes/v07/04.txt?raw'
import extra05 from '../assets/scenes/v07/05.txt?raw'

const extraScenesArtwork = `data:image/webp;base64,${extra00}${extra01}${extra02}${extra03}${extra04}${extra05}`

type Props = { sceneId: Scene['id']; acted: string | null; onAction: (id: string) => void }
type HitBox = { left: number; top: number; width: number; height: number }
type Point = { x: number; y: number }
type SceneStyle = CSSProperties & { '--scene-aspect'?: string }
type VibratingNavigator = Navigator & { vibrate?: (pattern: number | number[]) => boolean }
type ChoiceControl = readonly [id: string, label: string, text: string, box: HitBox]

export const sceneHitAreas = {
  train: {
    stand: { left: 13, top: 57, width: 16, height: 12 },
    bag: { left: 37.5, top: 55, width: 20, height: 14 },
  },
  elevator: {
    open: { left: 79, top: 47.8, width: 13, height: 9 },
    close: { left: 79, top: 58.5, width: 13, height: 9 },
  },
  karaage: {
    food: { left: 40.5, top: 42.5, width: 19, height: 12.5 },
  },
  meeting: {
    mic: { left: 28.5, top: 61.1, width: 11, height: 8.5 },
    hand: { left: 45, top: 61.1, width: 11, height: 8.5 },
    chat: { left: 61.5, top: 61.1, width: 11, height: 8.5 },
  },
  bus: {
    stand: { left: 14, top: 56, width: 16, height: 11 },
    invite: { left: 55, top: 48, width: 16, height: 11 },
  },
  cafe: {
    move: { left: 61, top: 59, width: 16, height: 11 },
    invite: { left: 48, top: 42, width: 16, height: 11 },
  },
  snack: {
    take: { left: 43, top: 61, width: 15, height: 10 },
    offer: { left: 60, top: 58, width: 15, height: 10 },
  },
  rain: {
    share: { left: 27, top: 34, width: 16, height: 11 },
    lend: { left: 48, top: 45, width: 16, height: 11 },
  },
  photo: {
    shutter: { left: 7, top: 45, width: 16, height: 11 },
    timer: { left: 24, top: 51, width: 16, height: 11 },
  },
  printer: {
    hand: { left: 14, top: 56, width: 16, height: 11 },
    leave: { left: 30, top: 62, width: 16, height: 11 },
  },
  bill: {
    split: { left: 38, top: 61, width: 15, height: 10 },
    pay: { left: 55, top: 61, width: 15, height: 10 },
  },
  door: {
    hold: { left: 15, top: 60, width: 16, height: 11 },
    release: { left: 32, top: 65, width: 16, height: 11 },
  },
  checkout: {
    yield: { left: 55, top: 54, width: 16, height: 11 },
    proceed: { left: 40, top: 68, width: 16, height: 11 },
  },
  pantry: {
    yield: { left: 22, top: 49, width: 16, height: 11 },
    continue: { left: 42, top: 54, width: 16, height: 11 },
  },
  ending: {
    finish: { left: 73, top: 24, width: 16, height: 13 },
    paper: { left: 15, top: 84, width: 12, height: 9 },
    bin: { left: 72, top: 74, width: 22, height: 21 },
  },
} satisfies Record<Scene['id'], Record<string, HitBox>>

function vibrate(duration: number) {
  if (typeof navigator === 'undefined') return
  ;(navigator as VibratingNavigator).vibrate?.(duration)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function hitStyle(box: HitBox): CSSProperties {
  return {
    left: `${box.left}%`,
    top: `${box.top}%`,
    width: `${box.width}%`,
    height: `${box.height}%`,
  }
}

function pointInScene(element: HTMLElement, clientX: number, clientY: number) {
  const art = element.closest<HTMLElement>('.art')
  if (!art) return { point: { x: 50, y: 50 }, clientX, clientY }
  const rect = art.getBoundingClientRect()
  const x = clamp(clientX, rect.left, rect.right)
  const y = clamp(clientY, rect.top, rect.bottom)
  return {
    point: {
      x: ((x - rect.left) / rect.width) * 100,
      y: ((y - rect.top) / rect.height) * 100,
    },
    clientX: x,
    clientY: y,
  }
}

export function classifyTrainDrop(point: Point) {
  if (point.y >= 72) return 'bag-floor'
  if (point.x <= 34 && point.y >= 54 && point.y < 72) return 'bag-lap'
  return 'bag-other'
}

export function classifyKaraageDrop(point: Point) {
  if (point.y >= 70) return 'take-self'
  if (point.x <= 32) return 'give-left'
  if (point.x >= 68) return 'give-right'
  if (point.y <= 58) return 'return'
  return 'table-other'
}

function isEndingBin(point: Point) {
  return point.x >= 70 && point.y >= 72
}

function SceneShell({ artwork, label, className, children, frame }: {
  artwork: string
  label: string
  className: string
  children: ReactNode
  frame?: number
}) {
  const [imageAspect, setImageAspect] = useState<number | null>(null)
  const fixedAspect = frame === undefined ? null : 2 / 3
  const shellStyle: SceneStyle = fixedAspect
    ? { '--scene-aspect': String(fixedAspect) }
    : imageAspect
      ? { '--scene-aspect': String(imageAspect) }
      : {}

  const loaded = (event: SyntheticEvent<HTMLImageElement>) => {
    if (fixedAspect) return
    const { naturalWidth, naturalHeight } = event.currentTarget
    if (naturalWidth > 0 && naturalHeight > 0) setImageAspect(naturalWidth / naturalHeight)
  }

  const backgroundStyle: CSSProperties | undefined = frame === undefined ? undefined : {
    height: '1000%',
    top: `-${frame * 100}%`,
    objectFit: 'fill',
  }

  return <div className={`art ${className}`} data-art-source="generated" aria-label={label} style={shellStyle}>
    <img className="scene-background" src={artwork} alt="" onLoad={loaded} style={backgroundStyle} />
    {children}
  </div>
}

export function Player({ seated = false }: { seated?: boolean }) {
  return <span className={`character player ${seated ? 'seated' : ''}`} aria-hidden="true"><i className="hair" /><i className="head"><b className="face" /></i><i className="body" /><i className="arm" /><i className="legs" /></span>
}

function releaseCapture(element: HTMLButtonElement, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId)
  } catch {
    // Pointer capture can already be lost after cancellation/unmount.
  }
}

function Sprite({ src, className = 'object-sprite' }: { src: string; className?: string }) {
  return <img className={className} src={src} alt="" aria-hidden="true" draggable={false} />
}

function DraggableObject({ className, label, children, onDrop, onKeyDown, style, disabled = false }: {
  className: string
  label: string
  children: ReactNode
  onDrop: (point: Point) => void
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void
  style: CSSProperties
  disabled?: boolean
}) {
  const origin = useRef({ x: 0, y: 0 })
  const pointerId = useRef<number | null>(null)
  const baseOffset = useRef({ x: 0, y: 0 })
  const moved = useRef(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [selected, setSelected] = useState(false)

  const down = (event: PointerEvent<HTMLButtonElement>) => {
    if (disabled || event.button !== 0 || pointerId.current !== null) return
    event.preventDefault()
    vibrate(10)
    origin.current = { x: event.clientX, y: event.clientY }
    pointerId.current = event.pointerId
    moved.current = false
    setSelected(true)
    setDragging(true)
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* non-fatal */ }
  }

  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerId.current !== event.pointerId) return
    const scenePoint = pointInScene(event.currentTarget, event.clientX, event.clientY)
    const dx = scenePoint.clientX - origin.current.x
    const dy = scenePoint.clientY - origin.current.y
    if (Math.hypot(dx, dy) > 10) moved.current = true
    setOffset({ x: baseOffset.current.x + dx, y: baseOffset.current.y + dy })
  }

  const up = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerId.current !== event.pointerId) return
    const scenePoint = pointInScene(event.currentTarget, event.clientX, event.clientY)
    const dx = scenePoint.clientX - origin.current.x
    const dy = scenePoint.clientY - origin.current.y
    const finalOffset = { x: baseOffset.current.x + dx, y: baseOffset.current.y + dy }
    releaseCapture(event.currentTarget, event.pointerId)
    pointerId.current = null
    setDragging(false)

    if (!moved.current) {
      setOffset(baseOffset.current)
      return
    }

    vibrate(14)
    baseOffset.current = finalOffset
    setOffset(finalOffset)
    onDrop(scenePoint.point)
  }

  const cancel = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerId.current !== event.pointerId) return
    releaseCapture(event.currentTarget, event.pointerId)
    pointerId.current = null
    moved.current = false
    setDragging(false)
    setOffset(baseOffset.current)
  }

  return <button
    type="button"
    className={`object-button ${className} ${selected ? 'selected' : ''} ${dragging ? 'dragging' : ''}`}
    aria-label={label}
    aria-pressed={selected}
    disabled={disabled}
    onPointerDown={down}
    onPointerMove={move}
    onPointerUp={up}
    onPointerCancel={cancel}
    onKeyDown={onKeyDown}
    style={{ ...style, transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
  >{children}</button>
}

function ChoiceScene({ frame, className, label, controls, acted, onAction }: {
  frame: number
  className: string
  label: string
  controls: readonly ChoiceControl[]
  acted: string | null
  onAction: (id: string) => void
}) {
  return <SceneShell artwork={extraScenesArtwork} frame={frame} className={className} label={label}>
    <>{controls.map(([id, ariaLabel, text, box]) => <button
      type="button"
      key={id}
      className={`scene-control context-control ${acted === id ? 'selected' : ''}`}
      style={hitStyle(box)}
      aria-label={ariaLabel}
      disabled={Boolean(acted)}
      onClick={() => { vibrate(8); onAction(id) }}
    ><span aria-hidden="true">{text}</span></button>)}</>
  </SceneShell>
}

function Train({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.train
  return <SceneShell artwork={trainArtwork} className="train" label="電車内。オレンジ色の服の自分が座り、隣席にはバッグ、前には座りたそうな乗客が立っている">
    <>
      <button type="button" className="scene-control stand-control" style={hitStyle(hit.stand)} aria-label="席を立つ" onClick={() => onAction('stand')}><span aria-hidden="true">立</span></button>
      <DraggableObject
        className="bag-object"
        style={hitStyle(hit.bag)}
        label="バッグ。タップすると選択でき、画面内の好きな場所へドラッグできる。キーボードでは左矢印で膝、下矢印で床"
        disabled={Boolean(acted)}
        onDrop={point => onAction(classifyTrainDrop(point))}
        onKeyDown={event => {
          if (event.key === 'ArrowLeft') { event.preventDefault(); onAction('bag-lap') }
          if (event.key === 'ArrowDown') { event.preventDefault(); onAction('bag-floor') }
        }}
      ><Sprite src={bagAsset} /></DraggableObject>
    </>
  </SceneShell>
}

function Elevator({ onAction }: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.elevator
  const holdTimer = useRef<number | null>(null)
  const activePointer = useRef<number | null>(null)
  const held = useRef(false)

  const clearHold = () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
    holdTimer.current = null
  }

  const startHold = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || activePointer.current !== null) return
    event.preventDefault()
    vibrate(8)
    activePointer.current = event.pointerId
    held.current = false
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* non-fatal */ }
    clearHold()
    holdTimer.current = window.setTimeout(() => {
      held.current = true
      holdTimer.current = null
      vibrate(16)
      onAction('hold-open')
    }, 650)
  }

  const finishHold = (event: PointerEvent<HTMLButtonElement>) => {
    if (activePointer.current !== event.pointerId) return
    clearHold()
    releaseCapture(event.currentTarget, event.pointerId)
    activePointer.current = null
    if (!held.current) onAction('open')
  }

  const cancelHold = (event: PointerEvent<HTMLButtonElement>) => {
    if (activePointer.current !== event.pointerId) return
    clearHold()
    releaseCapture(event.currentTarget, event.pointerId)
    activePointer.current = null
    held.current = false
  }

  return <SceneShell artwork={elevatorArtwork} className="elevator" label="自分はエレベーターの中。閉まりかけた扉の向こうから人が走ってきて、右手の操作盤に開く・閉じるボタンがある">
    <>
      <button
        type="button"
        className="scene-control elevator-button open-hit"
        style={hitStyle(hit.open)}
        aria-label="開く。長押しもできる。キーボードでは上矢印が長押し相当"
        onPointerDown={startHold}
        onPointerUp={finishHold}
        onPointerCancel={cancelHold}
        onPointerLeave={cancelHold}
        onKeyDown={event => { if (event.key === 'ArrowUp') { event.preventDefault(); onAction('hold-open') } }}
        onClick={(event: MouseEvent<HTMLButtonElement>) => { if (event.detail === 0) onAction('open') }}
      ><span aria-hidden="true">◀▶</span></button>
      <button type="button" className="scene-control elevator-button close-hit" style={hitStyle(hit.close)} aria-label="閉じる" onClick={() => onAction('close')}><span aria-hidden="true">▶◀</span></button>
    </>
  </SceneShell>
}

function Karaage({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.karaage
  return <SceneShell artwork={karaageArtwork} className="dining" label="4人で囲む食卓。中央の大皿に最後の唐揚げがひとつ残っている">
    <DraggableObject
      className="karaage-object"
      style={hitStyle(hit.food)}
      label="最後の唐揚げ。タップすると選択でき、画面内の好きな場所へドラッグできる。キーボードでは上下左右"
      disabled={Boolean(acted)}
      onDrop={point => onAction(classifyKaraageDrop(point))}
      onKeyDown={event => {
        const keys: Record<string, string> = { ArrowDown: 'take-self', ArrowLeft: 'give-left', ArrowRight: 'give-right', ArrowUp: 'return' }
        const action = keys[event.key]
        if (action) { event.preventDefault(); onAction(action) }
      }}
    ><Sprite src={karaageAsset} /></DraggableObject>
  </SceneShell>
}

function Meeting({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.meeting
  const controls = [
    ['mic', 'マイクをオンにする', '', hit.mic],
    ['hand', '手を挙げる', '✋', hit.hand],
    ['chat', 'チャットに短い反応を送る', '…', hit.chat],
  ] as const

  return <SceneShell artwork={meetingArtwork} className="meeting" label="オンライン会議。司会者が意見を求めたあと、4人が黙って待っている">
    <>
      <div className="meeting-controls-plate" aria-hidden="true" />
      {controls.map(([id, label, text, box]) => <button
        type="button"
        key={id}
        className={`scene-control meeting-control ${id}-control ${acted === id ? 'selected' : ''}`}
        style={hitStyle(box)}
        aria-label={label}
        onClick={() => { vibrate(8); onAction(id) }}
      ><span aria-hidden="true">{text}</span></button>)}
    </>
  </SceneShell>
}

function Bus(props: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.bus
  const controls = [
    ['stand', '席を立つ', '立', hit.stand],
    ['invite', '席を指してどうぞと合図する', 'どうぞ', hit.invite],
  ] as const
  return <ChoiceScene frame={0} className="bus" label="バス車内。オレンジ色の服の自分が座り、杖を持つ高齢の乗客が近くに立っている" controls={controls} {...props} />
}

function Cafe(props: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.cafe
  const controls = [
    ['move-bag', '隣の椅子からバッグをどける', '移', hit.move],
    ['invite', '席を使うよう声をかける', 'どうぞ', hit.invite],
  ] as const
  return <ChoiceScene frame={1} className="cafe" label="混んだカフェ。自分の隣の椅子にバッグがあり、席を探す人が近くに立っている" controls={controls} {...props} />
}

function Snack(props: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.snack
  const controls = [
    ['take', '最後のお菓子を取る', '取', hit.take],
    ['offer', '最後のお菓子を誰かに勧める', '勧', hit.offer],
  ] as const
  return <ChoiceScene frame={2} className="snack" label="休憩室。4人がテーブル中央の最後のお菓子を見つめている" controls={controls} {...props} />
}

function Rain(props: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.rain
  const controls = [
    ['share', '傘に一緒に入るよう寄る', '入', hit.share],
    ['lend', '傘を相手に渡す', '渡', hit.lend],
  ] as const
  return <ChoiceScene frame={3} className="rain" label="雨の日の軒下。オレンジ色の服の自分だけが傘を持ち、隣の人は傘を持っていない" controls={controls} {...props} />
}

function Photo(props: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.photo
  const controls = [
    ['shutter', 'そのままシャッターを切る', '撮', hit.shutter],
    ['timer', 'タイマーを使って撮り直す', '⏱', hit.timer],
  ] as const
  return <ChoiceScene frame={4} className="photo" label="観光先。オレンジ色の服の自分がスマートフォンを持ち、仲間と写真を撮ろうとしている" controls={controls} {...props} />
}

function Printer(props: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.printer
  const controls = [
    ['hand', '印刷物を同僚に渡す', '渡', hit.hand],
    ['leave', '取り出し口に置いておく', '置', hit.leave],
  ] as const
  return <ChoiceScene frame={5} className="printer" label="オフィスの複合機。オレンジ色の服の自分が印刷物を取り、後ろから同僚が近づいている" controls={controls} {...props} />
}

function Bill(props: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.bill
  const controls = [
    ['split', '割り勘にしようと声をかける', '割', hit.split],
    ['pay', 'まとめて払うと手を伸ばす', '払', hit.pay],
  ] as const
  return <ChoiceScene frame={6} className="bill" label="食事のあと。4人がテーブル中央の会計票を見つめている" controls={controls} {...props} />
}

function Door(props: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.door
  const controls = [
    ['hold', 'ドアをそのまま押さえて待つ', '待', hit.hold],
    ['release', '先にドアから手を離す', '離', hit.release],
  ] as const
  return <ChoiceScene frame={7} className="door" label="入口のドアを自分が押さえ、荷物を抱えた人が近づいている" controls={controls} {...props} />
}

function Checkout(props: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.checkout
  const controls = [
    ['yield', '後ろの人に先を譲る', '譲', hit.yield],
    ['proceed', 'そのまま会計を進める', '先', hit.proceed],
  ] as const
  return <ChoiceScene frame={8} className="checkout" label="レジ。買い物かごがいっぱいの自分の後ろに、飲み物ひとつだけの人が並んでいる" controls={controls} {...props} />
}

function Pantry(props: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.pantry
  const controls = [
    ['yield', 'いったん共用スペースを空ける', '譲', hit.yield],
    ['continue', '先に自分の用事を済ませる', '続', hit.continue],
  ] as const
  return <ChoiceScene frame={9} className="pantry" label="オフィスの給湯スペース。オレンジ色の服の自分が共用スペースを使い、マグを持った同僚が待っている" controls={controls} {...props} />
}

function Ending({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.ending
  const [tidy, setTidy] = useState(false)

  return <SceneShell artwork={endingArtwork} className="final-scene" label="仕事の終了画面。部屋の端にはゴミ箱と小さな紙くずがある">
    <>
      <button type="button" className="scene-control finish-hit" style={hitStyle(hit.finish)} aria-label="終了" onClick={() => onAction(tidy ? 'trash' : 'finish')}><span aria-hidden="true">終了</span></button>
      {!tidy && !acted && <DraggableObject
        className="paper-object"
        style={hitStyle(hit.paper)}
        label="紙くず。画面内の好きな場所へドラッグできる。ゴミ箱の近くに置くと捨てる。キーボードでは右矢印でゴミ箱へ入れる"
        onDrop={point => { if (isEndingBin(point)) setTidy(true) }}
        onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); setTidy(true) } }}
      ><Sprite src={paperAsset} /></DraggableObject>}
    </>
  </SceneShell>
}

export function SceneArtwork(props: Props) {
  switch (props.sceneId) {
    case 'train': return <Train {...props} />
    case 'elevator': return <Elevator {...props} />
    case 'karaage': return <Karaage {...props} />
    case 'meeting': return <Meeting {...props} />
    case 'bus': return <Bus {...props} />
    case 'cafe': return <Cafe {...props} />
    case 'snack': return <Snack {...props} />
    case 'rain': return <Rain {...props} />
    case 'photo': return <Photo {...props} />
    case 'printer': return <Printer {...props} />
    case 'bill': return <Bill {...props} />
    case 'door': return <Door {...props} />
    case 'checkout': return <Checkout {...props} />
    case 'pantry': return <Pantry {...props} />
    case 'ending': return <Ending {...props} />
  }
  return <Ending {...props} />
}
