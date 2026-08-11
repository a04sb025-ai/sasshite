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
import endingArtwork from '../assets/scenes/ending.svg'
import elevatorArtwork from '../assets/scenes/elevator.svg'
import karaageArtwork from '../assets/scenes/karaage.svg'
import meetingArtwork from '../assets/scenes/meeting.svg'
import trainArtwork from '../assets/scenes/train.svg'

type Props = { sceneId: Scene['id']; acted: string | null; onAction: (id: string) => void }
type HitBox = { left: number; top: number; width: number; height: number }
type Point = { x: number; y: number }
type SceneStyle = CSSProperties & { '--scene-aspect'?: string }
type VibratingNavigator = Navigator & { vibrate?: (pattern: number | number[]) => boolean }

export const sceneHitAreas = {
  train: {
    stand: { left: 17, top: 69, width: 14, height: 9 },
    bag: { left: 48, top: 61, width: 22, height: 12 },
  },
  elevator: {
    open: { left: 79, top: 50, width: 14, height: 9 },
    close: { left: 79, top: 61, width: 14, height: 9 },
  },
  karaage: {
    food: { left: 42.5, top: 45, width: 15, height: 10 },
  },
  meeting: {
    mic: { left: 21, top: 84, width: 14, height: 8.5 },
    hand: { left: 43, top: 84, width: 14, height: 8.5 },
    chat: { left: 65, top: 84, width: 14, height: 8.5 },
  },
  ending: {
    finish: { left: 35, top: 53.5, width: 30, height: 8.5 },
    paper: { left: 78, top: 86, width: 12, height: 8 },
    bin: { left: 7, top: 82, width: 16, height: 14 },
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
  if (point.y >= 80) return 'bag-floor'
  if (point.x <= 48 && point.y >= 64) return 'bag-lap'
  return 'bag-other'
}

export function classifyKaraageDrop(point: Point) {
  if (point.y >= 70) return 'take-self'
  if (point.x <= 32) return 'give-left'
  if (point.x >= 68) return 'give-right'
  if (point.y <= 56) return 'return'
  return 'table-other'
}

function isEndingBin(point: Point) {
  return point.x <= 30 && point.y >= 78
}

function SceneShell({ artwork, label, className, children }: {
  artwork: string
  label: string
  className: string
  children: ReactNode
}) {
  const [imageAspect, setImageAspect] = useState<number | null>(null)
  const shellStyle: SceneStyle = imageAspect ? { '--scene-aspect': String(imageAspect) } : {}

  const loaded = (event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget
    if (naturalWidth > 0 && naturalHeight > 0) setImageAspect(naturalWidth / naturalHeight)
  }

  return <div className={`art ${className}`} data-art-source="composed" aria-label={label} style={shellStyle}>
    <img className="scene-background" src={artwork} alt="" onLoad={loaded} />
    {children}
  </div>
}

export function Player({ seated = false }: { seated?: boolean }) {
  return <span className={`character player ${seated ? 'seated' : ''}`} aria-hidden="true"><i className="hair" /><i className="head"><b className="face" /></i><i className="body" /><i className="arm" /><i className="legs" /></span>
}

function BagSprite() {
  return <svg className="object-sprite bag-sprite" viewBox="0 0 96 64" aria-hidden="true">
    <defs>
      <linearGradient id="bagBody" x2="0" y2="1"><stop stopColor="#a98161"/><stop offset=".55" stopColor="#806044"/><stop offset="1" stopColor="#664a36"/></linearGradient>
      <linearGradient id="bagShine" x2="1" y2="1"><stop stopColor="#d3ad84" stopOpacity=".72"/><stop offset="1" stopColor="#d3ad84" stopOpacity="0"/></linearGradient>
    </defs>
    <path d="M27 20C29 8 36 3 48 3s19 5 21 17" fill="none" stroke="#543b2d" strokeWidth="6" strokeLinecap="round" />
    <path d="M10 23c0-6 5-10 11-10h54c7 0 11 4 11 10v27c0 7-5 11-12 11H21c-7 0-11-4-11-11Z" fill="url(#bagBody)" stroke="#4d382b" strokeWidth="3" />
    <path d="M13 27c18 7 48 7 70 0" fill="none" stroke="#c49a74" strokeWidth="2" opacity=".62" />
    <path d="M17 19h62v10H17z" fill="url(#bagShine)" opacity=".7"/>
    <path d="M47 13v46M15 44h68" stroke="#563e2f" strokeWidth="1.6" opacity=".62" />
    <rect x="43" y="30" width="10" height="9" rx="2" fill="#caa45f" stroke="#59422f" strokeWidth="1.5" />
    <path d="M21 59v3M75 59v3" stroke="#4d382b" strokeWidth="4" strokeLinecap="round" />
  </svg>
}

function KaraageSprite() {
  return <svg className="object-sprite karaage-sprite" viewBox="0 0 72 72" aria-hidden="true">
    <defs>
      <radialGradient id="karaageBody" cx="38%" cy="30%" r="72%"><stop stopColor="#d88747"/><stop offset=".5" stopColor="#ac5b31"/><stop offset="1" stopColor="#6f351f"/></radialGradient>
    </defs>
    <path d="M15 23 25 11l13 4 12-5 10 11 3 13-7 10-2 13-14 6-13-5-12 1-8-14 5-11Z" fill="url(#karaageBody)" stroke="#6c3823" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="m23 25 9-5m11 6 9-5m-29 18 10 4m9-7 11 5m-23 9 7-4" stroke="#eba069" strokeWidth="3" strokeLinecap="round" opacity=".72" />
    <circle cx="25" cy="31" r="3" fill="#f1b37c" opacity=".62"/><circle cx="48" cy="31" r="2.5" fill="#8c4528" opacity=".7"/>
  </svg>
}

function PaperSprite() {
  return <svg className="object-sprite paper-sprite" viewBox="0 0 64 64" aria-hidden="true">
    <defs><linearGradient id="paperShade" x2="1" y2="1"><stop stopColor="#fffdf7"/><stop offset="1" stopColor="#ded8cd"/></linearGradient></defs>
    <path d="m12 15 16-7 21 4 5 14-4 22-15 8-17-5-7-14 6-9Z" fill="url(#paperShade)" stroke="#a8a095" strokeWidth="2" strokeLinejoin="round" />
    <path d="m17 29 11-7 10 7 11-6M19 47l10-12 9 13m-12-26 3 13" fill="none" stroke="#bbb2a6" strokeWidth="2" strokeLinecap="round" />
  </svg>
}

function BinSprite() {
  return <svg className="bin-sprite" viewBox="0 0 70 82" aria-hidden="true">
    <defs><linearGradient id="binMetal" x1="0" x2="1"><stop stopColor="#626865"/><stop offset=".45" stopColor="#aeb3af"/><stop offset="1" stopColor="#5f6562"/></linearGradient></defs>
    <path d="M14 23h42l-5 51H19Z" fill="url(#binMetal)" stroke="#454a47" strokeWidth="3" />
    <path d="M9 22h52M25 14h20" stroke="#454a47" strokeWidth="5" strokeLinecap="round" />
    <path d="M28 31v33M42 31v33" stroke="#d5d8d5" strokeWidth="2" opacity=".55" />
    <path d="M18 27h34" stroke="#e3e5e2" strokeWidth="2" opacity=".4" />
  </svg>
}

function releaseCapture(element: HTMLButtonElement, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId)
  } catch {
    // Pointer capture can already be lost after cancellation/unmount.
  }
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

function Train({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.train
  return <SceneShell artwork={trainArtwork} className="train" label="電車内。自分の隣の座席をバッグが占め、その前に座りたそうな乗客が立っている">
    <>
      <button type="button" className="scene-control stand-control" style={hitStyle(hit.stand)} aria-label="席を立つ" onClick={() => onAction('stand')}><span aria-hidden="true">↥</span></button>
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
      ><BagSprite /></DraggableObject>
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

  return <SceneShell artwork={elevatorArtwork} className="elevator" label="エレベーターの扉が閉まりかけ、廊下の向こうから人が走ってくる">
    <>
      <span className="elevator-panel" aria-hidden="true" />
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
      ><span aria-hidden="true">開</span></button>
      <button type="button" className="scene-control elevator-button close-hit" style={hitStyle(hit.close)} aria-label="閉じる" onClick={() => onAction('close')}><span aria-hidden="true">閉</span></button>
    </>
  </SceneShell>
}

function Karaage({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.karaage
  return <SceneShell artwork={karaageArtwork} className="dining" label="4人で囲む食卓。中央の大皿に唐揚げがひとつ残り、全員の視線がそこへ向いている">
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
    ><KaraageSprite /></DraggableObject>
  </SceneShell>
}

function Meeting({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.meeting
  const controls = [
    ['mic', 'マイクをオンにする', '●', hit.mic],
    ['hand', '手を挙げる', '✋', hit.hand],
    ['chat', 'チャットに短い反応を送る', '…', hit.chat],
  ] as const

  return <SceneShell artwork={meetingArtwork} className="meeting" label="オンライン会議。司会者が意見を求めたあと、4人が黙って待っている">
    <>{controls.map(([id, label, glyph, box]) => <button
      type="button"
      key={id}
      className={`scene-control meeting-control ${acted === id ? 'selected' : ''}`}
      style={hitStyle(box)}
      aria-label={label}
      onClick={() => { vibrate(8); onAction(id) }}
    ><span aria-hidden="true">{glyph}</span></button>)}</>
  </SceneShell>
}

function Ending({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.ending
  const [tidy, setTidy] = useState(false)

  return <SceneShell artwork={endingArtwork} className="final-scene" label="仕事の終了画面。部屋の端にはゴミ箱と小さな紙くずがある">
    <>
      <span className={`bin-visual ${tidy ? 'received' : ''}`} style={hitStyle(hit.bin)} aria-hidden="true"><BinSprite /></span>
      <button type="button" className="scene-control finish-hit" style={hitStyle(hit.finish)} aria-label="終了" onClick={() => onAction(tidy ? 'trash' : 'finish')}><span aria-hidden="true">終了</span></button>
      {!tidy && !acted && <DraggableObject
        className="paper-object"
        style={hitStyle(hit.paper)}
        label="紙くず。画面内の好きな場所へドラッグできる。ゴミ箱の近くに置くと捨てる。キーボードでは左矢印でゴミ箱へ入れる"
        onDrop={point => { if (isEndingBin(point)) setTidy(true) }}
        onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); setTidy(true) } }}
      ><PaperSprite /></DraggableObject>}
    </>
  </SceneShell>
}

export function SceneArtwork(props: Props) {
  if (props.sceneId === 'train') return <Train {...props} />
  if (props.sceneId === 'elevator') return <Elevator {...props} />
  if (props.sceneId === 'karaage') return <Karaage {...props} />
  if (props.sceneId === 'meeting') return <Meeting {...props} />
  return <Ending {...props} />
}
