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
type ArtSource = 'generated' | 'fallback'
type HitBox = { left: number; top: number; width: number; height: number }
type Point = { x: number; y: number }
type SceneStyle = CSSProperties & { '--scene-aspect'?: string; '--scene-image'?: string }

export const sceneHitAreas = {
  train: {
    player: { left: 5, top: 49, width: 25, height: 35 },
    bag: { left: 29, top: 50, width: 42, height: 31 },
  },
  elevator: {
    open: { left: 65, top: 42, width: 28, height: 17 },
    close: { left: 65, top: 58, width: 28, height: 17 },
  },
  karaage: {
    food: { left: 33, top: 34, width: 34, height: 31 },
  },
  meeting: {
    mic: { left: 4, top: 76, width: 30, height: 19 },
    hand: { left: 35, top: 76, width: 30, height: 19 },
    chat: { left: 66, top: 76, width: 30, height: 19 },
  },
  ending: {
    finish: { left: 30, top: 46, width: 40, height: 21 },
    paper: { left: 68, top: 76, width: 29, height: 22 },
  },
} satisfies Record<Scene['id'], Record<string, HitBox>>

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
  if (!art) return { point: { x: 50, y: 50 }, clientX, clientY, artRect: null }
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
    artRect: rect,
  }
}

export function classifyTrainDrop(point: Point) {
  if (point.y >= 70) return 'bag-floor'
  if (point.x <= 48 && point.y >= 42) return 'bag-lap'
  return 'bag-other'
}

export function classifyKaraageDrop(point: Point) {
  if (point.y >= 64) return 'take-self'
  if (point.x <= 34) return 'give-left'
  if (point.x >= 66) return 'give-right'
  if (point.y <= 49) return 'return'
  return 'table-other'
}

function isEndingBin(point: Point) {
  return point.x <= 31 && point.y >= 68
}

function SceneShell({ scene, fallback, label, className, children }: {
  scene: Scene['id']
  fallback: string
  label: string
  className: string
  children: ReactNode
}) {
  const [failedScene, setFailedScene] = useState<Scene['id'] | null>(null)
  const [imageAspect, setImageAspect] = useState<number | null>(null)
  const source: ArtSource = failedScene === scene ? 'fallback' : 'generated'
  const imageSrc = source === 'generated' ? `/scene-art/${scene}.png` : fallback
  const shellStyle: SceneStyle = {
    '--scene-image': `url("${imageSrc}")`,
    ...(imageAspect ? { '--scene-aspect': String(imageAspect) } : {}),
  }

  const loaded = (event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget
    if (naturalWidth > 0 && naturalHeight > 0) setImageAspect(naturalWidth / naturalHeight)
  }

  return <div className={`art ${className}`} data-art-source={source} aria-label={label} style={shellStyle}>
    <img
      key={`${scene}-${source}`}
      className="scene-background"
      src={imageSrc}
      alt=""
      onLoad={loaded}
      onError={() => { if (source === 'generated') setFailedScene(scene) }}
    />
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

function FreeDraggable({ className, label, children, onDrop, onKeyDown, style, disabled = false }: {
  className: string
  label: string
  children?: ReactNode
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
  const [picked, setPicked] = useState(false)
  const [snapshot, setSnapshot] = useState<CSSProperties | null>(null)

  const createSnapshot = (event: PointerEvent<HTMLButtonElement>) => {
    if (snapshot) return
    const buttonRect = event.currentTarget.getBoundingClientRect()
    const scenePoint = pointInScene(event.currentTarget, event.clientX, event.clientY)
    if (!scenePoint.artRect) return
    const size = 68
    const localX = event.clientX - buttonRect.left
    const localY = event.clientY - buttonRect.top
    const imageX = event.clientX - scenePoint.artRect.left
    const imageY = event.clientY - scenePoint.artRect.top
    setSnapshot({
      left: `${localX}px`,
      top: `${localY}px`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundImage: 'var(--scene-image)',
      backgroundSize: `${scenePoint.artRect.width}px ${scenePoint.artRect.height}px`,
      backgroundPosition: `${-imageX + size / 2}px ${-imageY + size / 2}px`,
    })
  }

  const down = (event: PointerEvent<HTMLButtonElement>) => {
    if (disabled || event.button !== 0 || pointerId.current !== null) return
    event.preventDefault()
    origin.current = { x: event.clientX, y: event.clientY }
    pointerId.current = event.pointerId
    moved.current = false
    setPicked(true)
    setDragging(true)
    createSnapshot(event)
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* non-fatal */ }
  }

  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging || pointerId.current !== event.pointerId) return
    const dx = event.clientX - origin.current.x
    const dy = event.clientY - origin.current.y
    if (Math.hypot(dx, dy) > 8) moved.current = true
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

  return <>
    {picked && <span className="drag-origin-softener" style={style} aria-hidden="true" />}
    <button
      type="button"
      className={`scene-hit draggable-hit ${className} ${picked ? 'picked' : ''} ${dragging ? 'dragging' : ''}`}
      aria-label={label}
      aria-pressed={picked}
      disabled={disabled}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={cancel}
      onKeyDown={onKeyDown}
      style={{ ...style, transform: `translate3d(${offset.x}px,${offset.y}px,0)` }}
    >
      {snapshot && <span className="drag-snapshot" style={snapshot} aria-hidden="true" />}
      {children}
    </button>
  </>
}

function Train({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.train
  return <SceneShell scene="train" fallback={trainArtwork} className="train" label="電車内。自分の隣の座席をバッグが占め、その前に座りたそうな乗客が立っている">
    <>
      <button className="scene-hit player-hit" style={hitStyle(hit.player)} aria-label="座っている自分。押すと立つ" onClick={() => onAction('stand')} />
      <FreeDraggable
        className="bag-hit"
        style={hitStyle(hit.bag)}
        label="バッグ。タップすると選択し、そのまま画面内の好きな場所へドラッグできる。キーボードでは左矢印で膝、下矢印で床"
        disabled={Boolean(acted)}
        onDrop={point => onAction(classifyTrainDrop(point))}
        onKeyDown={event => {
          if (event.key === 'ArrowLeft') { event.preventDefault(); onAction('bag-lap') }
          if (event.key === 'ArrowDown') { event.preventDefault(); onAction('bag-floor') }
        }}
      ><span className="fallback-control">バッグ</span></FreeDraggable>
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
    activePointer.current = event.pointerId
    held.current = false
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* non-fatal */ }
    clearHold()
    holdTimer.current = window.setTimeout(() => {
      held.current = true
      holdTimer.current = null
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

  const openByKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowUp') { event.preventDefault(); onAction('hold-open') }
  }

  return <SceneShell scene="elevator" fallback={elevatorArtwork} className="elevator" label="エレベーターの扉が閉まりかけ、廊下の向こうから人が走ってくる">
    <>
      <button
        className="scene-hit elevator-button open-hit"
        style={hitStyle(hit.open)}
        aria-label="開く。長押しもできる。キーボードでは上矢印が長押し相当"
        onPointerDown={startHold}
        onPointerUp={finishHold}
        onPointerCancel={cancelHold}
        onPointerLeave={cancelHold}
        onKeyDown={openByKeyboard}
        onClick={(event: MouseEvent<HTMLButtonElement>) => { if (event.detail === 0) onAction('open') }}
      ><span className="fallback-control">開</span></button>
      <button className="scene-hit elevator-button close-hit" style={hitStyle(hit.close)} aria-label="閉じる" onClick={() => onAction('close')}><span className="fallback-control">閉</span></button>
    </>
  </SceneShell>
}

function Karaage({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.karaage
  return <SceneShell scene="karaage" fallback={karaageArtwork} className="dining" label="4人で囲む食卓。中央の大皿に唐揚げがひとつ残り、全員の視線がそこへ向いている">
    <FreeDraggable
      className="karaage-hit"
      style={hitStyle(hit.food)}
      label="最後の唐揚げ。タップすると選択し、そのまま画面内の好きな場所へドラッグできる。キーボードでは上下左右"
      disabled={Boolean(acted)}
      onDrop={point => onAction(classifyKaraageDrop(point))}
      onKeyDown={event => {
        const keys: Record<string, string> = { ArrowDown: 'take-self', ArrowLeft: 'give-left', ArrowRight: 'give-right', ArrowUp: 'return' }
        const action = keys[event.key]
        if (action) { event.preventDefault(); onAction(action) }
      }}
    ><span className="fallback-control fallback-karaage">●</span></FreeDraggable>
  </SceneShell>
}

function Meeting({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.meeting
  const controls = [
    ['mic', 'マイクをオンにする', 'ミュート', hit.mic],
    ['hand', '手を挙げる', '挙手', hit.hand],
    ['chat', 'チャットに短い反応を送る', 'チャット', hit.chat],
  ] as const
  return <SceneShell scene="meeting" fallback={meetingArtwork} className="meeting" label="オンライン会議。司会者が意見を求めたあと、4人が黙って待っている">
    <>{controls.map(([id, label, fallbackLabel, box]) => <button
      key={id}
      className={`scene-hit meeting-hit ${acted === id ? 'selected' : ''}`}
      style={hitStyle(box)}
      aria-label={label}
      onClick={() => onAction(id)}
    ><span className="fallback-control">{fallbackLabel}</span></button>)}</>
  </SceneShell>
}

function Ending({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.ending
  const [tidy, setTidy] = useState(false)
  return <SceneShell scene="ending" fallback={endingArtwork} className="final-scene" label="仕事の終了画面。部屋の端にはゴミ箱と小さな紙くずがある">
    <>
      <button className="scene-hit finish-hit" style={hitStyle(hit.finish)} aria-label="終了" onClick={() => onAction(tidy ? 'trash' : 'finish')}><span className="fallback-control">終了</span></button>
      <FreeDraggable
        className="paper-hit"
        style={hitStyle(hit.paper)}
        label="紙くず。タップすると選択し、画面内の好きな場所へドラッグできる。ゴミ箱へ入れてから終了することもできる。キーボードでは左矢印でゴミ箱へ入れる"
        disabled={Boolean(acted)}
        onDrop={point => setTidy(isEndingBin(point))}
        onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); setTidy(true) } }}
      ><span className="fallback-control fallback-paper">◇</span></FreeDraggable>
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
