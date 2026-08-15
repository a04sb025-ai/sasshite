import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import type { Scene } from '../types'
import endingArtwork from '../assets/scenes/ending.svg'
import elevatorArtwork from '../assets/scenes/elevator.svg'
import karaageArtwork from '../assets/scenes/karaage.svg'
import meetingArtwork from '../assets/scenes/meeting.svg'
import trainArtwork from '../assets/scenes/train.svg'
import { ageModes } from '../data/ageModes'

type Props = { sceneId: Scene['id']; acted: string | null; onAction: (id: string) => void }
type ArtSource = 'generated' | 'fallback'
type HitBox = { left: number; top: number; width: number; height: number }

export const directInteractionSceneIds = ['kindergarten-blocks', 'kindergarten-playhouse', 'junior-high-cleanup', 'junior-high-break', 'working-adult-documents'] as const
export const directInteractionActionIds = {
  'kindergarten-blocks': ['share', 'finish-first'],
  'kindergarten-playhouse': ['invite', 'bring-toy', 'keep-playing'],
  'junior-high-cleanup': ['help', 'invite', 'leave'],
  'junior-high-break': ['make-room', 'talk-later', 'keep-talking'],
  'working-adult-documents': ['help', 'ask', 'prepare'],
} as const

export const sceneHitAreas = {
  train: {
    player: { left: 9, top: 49, width: 29, height: 34 },
    bag: { left: 39, top: 57, width: 26, height: 19 },
    lap: { left: 18, top: 63, width: 25, height: 18 },
    floor: { left: 10, top: 81, width: 78, height: 16 },
  },
  elevator: {
    open: { left: 73, top: 48, width: 18, height: 10 },
    close: { left: 73, top: 59, width: 18, height: 10 },
  },
  karaage: {
    food: { left: 42, top: 43, width: 18, height: 16 },
    leftPlate: { left: 13, top: 45, width: 22, height: 17 },
    rightPlate: { left: 65, top: 45, width: 22, height: 17 },
    ownPlate: { left: 39, top: 70, width: 23, height: 17 },
    sharedPlate: { left: 34, top: 35, width: 32, height: 25 },
  },
  meeting: {
    mic: { left: 20, top: 81, width: 18, height: 12 },
    hand: { left: 41, top: 81, width: 18, height: 12 },
    chat: { left: 62, top: 81, width: 18, height: 12 },
  },
  ending: {
    finish: { left: 35, top: 52, width: 30, height: 11 },
    paper: { left: 78, top: 86, width: 14, height: 10 },
    bin: { left: 7, top: 79, width: 20, height: 17 },
  },
} satisfies Record<Scene['id'], Record<string, HitBox>>

function hitStyle(box: HitBox): CSSProperties {
  return {
    left: `${box.left}%`,
    top: `${box.top}%`,
    width: `${box.width}%`,
    height: `${box.height}%`,
  }
}

function SceneShell({ scene, fallback, label, className, children }: {
  scene: Scene['id']
  fallback: string
  label: string
  className: string
  children: ReactNode
}) {
  const [failedScene, setFailedScene] = useState<Scene['id'] | null>(null)
  const source: ArtSource = failedScene === scene ? 'fallback' : 'generated'

  return <div className={`art ${className}`} data-art-source={source} aria-label={label}>
    <img
      key={`${scene}-${source}`}
      className="scene-background"
      src={source === 'generated' ? `/scene-art/${scene}.png` : fallback}
      alt=""
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

function Draggable({ className, label, children, onDrop, onReturn, onKeyDown, style }: {
  className: string
  label: string
  children?: ReactNode
  onDrop: (target: string) => void
  onReturn?: () => void
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void
  style: CSSProperties
}) {
  const origin = useRef({ x: 0, y: 0 })
  const pointerId = useRef<number | null>(null)
  const draggingRef = useRef(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  const reset = (element?: HTMLButtonElement, id?: number) => {
    if (element && id !== undefined) releaseCapture(element, id)
    pointerId.current = null
    draggingRef.current = false
    setDragging(false)
    setOffset({ x: 0, y: 0 })
  }

  const down = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || pointerId.current !== null) return
    event.preventDefault()
    origin.current = { x: event.clientX, y: event.clientY }
    pointerId.current = event.pointerId
    draggingRef.current = true
    setDragging(true)
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* non-fatal */ }
  }

  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current || pointerId.current !== event.pointerId) return
    setOffset({ x: event.clientX - origin.current.x, y: event.clientY - origin.current.y })
  }

  const up = (event: PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current || pointerId.current !== event.pointerId) return
    const target = document.elementsFromPoint(event.clientX, event.clientY)
      .map(element => element.closest<HTMLElement>('[data-drop]'))
      .find(Boolean)?.dataset.drop
    reset(event.currentTarget, event.pointerId)
    if (target) onDrop(target)
    else onReturn?.()
  }

  const cancel = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerId.current !== event.pointerId) return
    reset(event.currentTarget, event.pointerId)
  }

  return <button
    type="button"
    className={`scene-hit draggable-hit ${className} ${dragging ? 'dragging' : ''}`}
    aria-label={label}
    onPointerDown={down}
    onPointerMove={move}
    onPointerUp={up}
    onPointerCancel={cancel}
    onKeyDown={onKeyDown}
    style={{ ...style, transform: `translate3d(${offset.x}px,${offset.y}px,0)` }}
  >{children}</button>
}

function DropZone({ name, box }: { name: string; box: HitBox }) {
  return <span className="drop-zone" data-drop={name} style={hitStyle(box)} aria-hidden="true" />
}

function Train({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const hit = sceneHitAreas.train
  return <SceneShell scene="train" fallback={trainArtwork} className="train" label="電車内。自分の隣の座席をバッグが占め、その前に座りたそうな乗客が立っている">
    <>
      <DropZone name="lap" box={hit.lap} />
      <DropZone name="floor" box={hit.floor} />
      <button className="scene-hit player-hit" style={hitStyle(hit.player)} aria-label="座っている自分。押すと立つ" onClick={() => onAction('stand')} />
      {!acted && <Draggable
        className="bag-hit"
        style={hitStyle(hit.bag)}
        label="隣の座席のバッグ。膝か床へドラッグできる。キーボードでは左矢印で膝、下矢印で床"
        onDrop={target => { if (target === 'lap') onAction('bag-lap'); else if (target === 'floor') onAction('bag-floor') }}
        onKeyDown={event => {
          if (event.key === 'ArrowLeft') { event.preventDefault(); onAction('bag-lap') }
          if (event.key === 'ArrowDown') { event.preventDefault(); onAction('bag-floor') }
        }}
      ><span className="fallback-control">バッグ</span></Draggable>}
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
    <>
      <DropZone name="give-left" box={hit.leftPlate} />
      <DropZone name="give-right" box={hit.rightPlate} />
      <DropZone name="take-self" box={hit.ownPlate} />
      <DropZone name="return" box={hit.sharedPlate} />
      {!acted && <Draggable
        className="karaage-hit"
        style={hitStyle(hit.food)}
        label="最後の唐揚げ。自分や他の人の皿、中央の皿へドラッグできる。キーボードでは上下左右"
        onDrop={onAction}
        onReturn={() => undefined}
        onKeyDown={event => {
          const keys: Record<string, string> = { ArrowDown: 'take-self', ArrowLeft: 'give-left', ArrowRight: 'give-right', ArrowUp: 'return' }
          const action = keys[event.key]
          if (action) { event.preventDefault(); onAction(action) }
        }}
      ><span className="fallback-control fallback-karaage">●</span></Draggable>}
    </>
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
      <DropZone name="bin" box={hit.bin} />
      <button className="scene-hit finish-hit" style={hitStyle(hit.finish)} aria-label="終了" onClick={() => onAction(tidy ? 'trash' : 'finish')}><span className="fallback-control">終了</span></button>
      {!tidy && !acted && <Draggable
        className="paper-hit"
        style={hitStyle(hit.paper)}
        label="床の端の紙くず。ゴミ箱へドラッグできる。キーボードでは左矢印でゴミ箱へ入れる"
        onDrop={target => { if (target === 'bin') setTidy(true) }}
        onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); setTidy(true) } }}
      ><span className="fallback-control fallback-paper">◇</span></Draggable>}
    </>
  </SceneShell>
}

function KindergartenBlocks({ acted, onAction }: Omit<Props, 'sceneId'>) {
  return <div className={`art kindergarten-blocks ${acted ? `acted-${acted}` : ''}`} aria-label="つみきで遊んでいる子と、そばで見ている友達">
    <div className="blocks-town" aria-hidden="true"><i /><i /><i /><i /></div>
    <div className="blocks-child blocks-builder" aria-hidden="true" />
    <div className="blocks-child blocks-friend" aria-hidden="true" />
    <button
      type="button"
      className={`blocks-action share-block ${acted === 'share' ? 'selected' : ''}`}
      aria-label="つみきを友達へわたす"
      onClick={() => onAction('share')}
    ><span aria-hidden="true" /></button>
    <button
      type="button"
      className={`blocks-action build-block ${acted === 'finish-first' ? 'selected' : ''}`}
      aria-label="つみきを町へ置いて、もう少しつくる"
      onClick={() => onAction('finish-first')}
    ><span aria-hidden="true" /></button>
  </div>
}

function KindergartenPlayhouse({ acted, onAction }: Omit<Props, 'sceneId'>) {
  return <div className={`art kindergarten-playhouse ${acted ? `acted-${acted}` : ''}`} aria-label="おへやで遊んでいる子たちと、少し離れて見ている友達">
    <div className="playhouse-window" aria-hidden="true" />
    <div className="playhouse-rug" aria-hidden="true" />
    <div className="playhouse-child playhouse-player" aria-hidden="true" />
    <button
      type="button"
      className={`playhouse-action friend-action ${acted === 'invite' ? 'selected' : ''}`}
      aria-label="少し離れて見ている友達を呼ぶ"
      onClick={() => onAction('invite')}
    ><span className="playhouse-child" aria-hidden="true" /></button>
    <button
      type="button"
      className={`playhouse-action toy-action ${acted === 'bring-toy' ? 'selected' : ''}`}
      aria-label="くまのおもちゃを友達のところへ持っていく"
      onClick={() => onAction('bring-toy')}
    ><span aria-hidden="true">●</span></button>
    <button
      type="button"
      className={`playhouse-action house-action ${acted === 'keep-playing' ? 'selected' : ''}`}
      aria-label="おもちゃの家でそのまま遊ぶ"
      onClick={() => onAction('keep-playing')}
    ><span aria-hidden="true" /></button>
  </div>
}

function JuniorHighCleanup({ acted, onAction }: Omit<Props, 'sceneId'>) {
  return <div className={`art junior-high-cleanup ${acted ? `acted-${acted}` : ''}`} aria-label="部活のあと。友達が用具を片付け、少し離れた先輩たちは話している">
    <div className="club-window" aria-hidden="true" />
    <div className="club-shelf" aria-hidden="true"><i /><i /><i /></div>
    <div className="club-boxes" aria-hidden="true"><i /><i /><i /></div>
    <button
      type="button"
      className={`cleanup-action friend-cleanup ${acted === 'help' ? 'selected' : ''}`}
      aria-label="一人で用具を片付けている友達を手伝う"
      onClick={() => onAction('help')}
    ><span className="club-student" aria-hidden="true" /></button>
    <button
      type="button"
      className={`cleanup-action seniors-cleanup ${acted === 'invite' ? 'selected' : ''}`}
      aria-label="話している先輩たちに声をかける"
      onClick={() => onAction('invite')}
    ><span className="club-student" aria-hidden="true" /><span className="club-student" aria-hidden="true" /></button>
    <button
      type="button"
      className={`cleanup-action exit-cleanup ${acted === 'leave' ? 'selected' : ''}`}
      aria-label="出口から先に帰る"
      onClick={() => onAction('leave')}
    ><span aria-hidden="true" /></button>
  </div>
}

function JuniorHighBreak({ acted, onAction }: Omit<Props, 'sceneId'>) {
  return <div className={`art junior-high-break ${acted ? `acted-${acted}` : ''}`} aria-label="休み時間。友達と話す輪の少し外で、クラスメイトがこちらを見ている">
    <div className="classroom-board" aria-hidden="true" />
    <div className="classroom-desks" aria-hidden="true"><i /><i /><i /></div>
    <button
      type="button"
      className={`break-action circle-gap ${acted === 'make-room' ? 'selected' : ''}`}
      aria-label="会話の輪のすき間をあける"
      onClick={() => onAction('make-room')}
    ><span className="break-student" aria-hidden="true" /><span className="break-student" aria-hidden="true" /></button>
    <button
      type="button"
      className={`break-action watching-classmate ${acted === 'talk-later' ? 'selected' : ''}`}
      aria-label="近くでこちらを見ているクラスメイトに、あとで声をかける"
      onClick={() => onAction('talk-later')}
    ><span className="break-student" aria-hidden="true" /></button>
    <button
      type="button"
      className={`break-action talking-friend ${acted === 'keep-talking' ? 'selected' : ''}`}
      aria-label="話している友達との会話を続ける"
      onClick={() => onAction('keep-talking')}
    ><span className="break-student" aria-hidden="true" /></button>
  </div>
}

function WorkingAdultDocuments({ acted, onAction }: Omit<Props, 'sceneId'>) {
  return <div className={`art working-adult-documents ${acted ? `acted-${acted}` : ''}`} aria-label="会議の前。同僚が資料を配り、自分の席には準備中のパソコンがある">
    <div className="office-screen" aria-hidden="true"><i /><i /></div>
    <div className="office-table" aria-hidden="true" />
    <button
      type="button"
      className={`documents-action colleague-documents ${acted === 'ask' ? 'selected' : ''}`}
      aria-label="資料を配っている同僚に、手伝うか聞く"
      onClick={() => onAction('ask')}
    ><span className="office-colleague" aria-hidden="true" /></button>
    <button
      type="button"
      className={`documents-action papers-documents ${acted === 'help' ? 'selected' : ''}`}
      aria-label="同僚が持つ残りの資料を受け取って配る"
      onClick={() => onAction('help')}
    ><span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" /></button>
    <button
      type="button"
      className={`documents-action laptop-documents ${acted === 'prepare' ? 'selected' : ''}`}
      aria-label="自分の席のパソコンで会議の準備を続ける"
      onClick={() => onAction('prepare')}
    ><span aria-hidden="true" /></button>
  </div>
}

export function SceneArtwork(props: Props) {
  if (props.sceneId === 'train') return <Train {...props} />
  if (props.sceneId === 'elevator') return <Elevator {...props} />
  if (props.sceneId === 'karaage') return <Karaage {...props} />
  if (props.sceneId === 'meeting') return <Meeting {...props} />
  if (props.sceneId === 'ending') return <Ending {...props} />
  if (props.sceneId === 'kindergarten-blocks') return <KindergartenBlocks {...props} />
  if (props.sceneId === 'kindergarten-playhouse') return <KindergartenPlayhouse {...props} />
  if (props.sceneId === 'junior-high-cleanup') return <JuniorHighCleanup {...props} />
  if (props.sceneId === 'junior-high-break') return <JuniorHighBreak {...props} />
  if (props.sceneId === 'working-adult-documents') return <WorkingAdultDocuments {...props} />
  const scene = ageModes.flatMap(mode => mode.scenes).find(item => item.id === props.sceneId)
  if (!scene?.presentation) return null
  return <div className="art choice-scene" aria-label={scene.presentation.situation}>
    <p>{scene.presentation.situation}</p>
    <div>{scene.presentation.choices.map(choice => <button
      type="button"
      key={choice.actionId}
      className={`choice-action ${props.acted === choice.actionId ? 'selected' : ''}`}
      onClick={() => props.onAction(choice.actionId)}
    ><span aria-hidden="true">{choice.symbol}</span>{choice.label}</button>)}</div>
  </div>
}
