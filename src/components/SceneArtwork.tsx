import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import type { Scene } from '../types'
import endingArtwork from '../assets/scenes/ending.svg'
import elevatorArtwork from '../assets/scenes/elevator.svg'
import karaageArtwork from '../assets/scenes/karaage.svg'
import meetingArtwork from '../assets/scenes/meeting.svg'
import trainArtwork from '../assets/scenes/train.svg'

type Props = { sceneId: Scene['id']; acted: string | null; onAction: (id: string) => void }

function SceneBackground({ scene, fallback }: { scene: Scene['id']; fallback: string }) {
  const [generatedUnavailable, setGeneratedUnavailable] = useState(false)
  return <img
    className="scene-background"
    src={generatedUnavailable ? fallback : `/scene-art/${scene}.png`}
    alt=""
    onError={() => setGeneratedUnavailable(true)}
  />
}

export function Player({ seated = false }: { seated?: boolean }) {
  return <span className={`character player ${seated ? 'seated' : ''}`} aria-hidden="true"><i className="hair" /><i className="head"><b className="face" /></i><i className="body" /><i className="arm" /><i className="legs" /></span>
}

function Person({ className = '' }: { className?: string }) {
  return <span className={`character person ${className}`} aria-hidden="true"><i className="hair" /><i className="head"><b className="face" /></i><i className="body" /><i className="arm" /><i className="legs" /></span>
}

function Draggable({ className, label, children, onDrop, onReturn, onKeyDown }: {
  className: string; label: string; children: ReactNode; onDrop: (target: string) => void; onReturn?: () => void; onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void
}) {
  const origin = useRef({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const down = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    origin.current = { x: event.clientX, y: event.clientY }
    setDragging(true)
  }
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return
    setOffset({ x: event.clientX - origin.current.x, y: event.clientY - origin.current.y })
  }
  const up = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return
    setDragging(false)
    event.currentTarget.releasePointerCapture(event.pointerId)
    const target = document.elementsFromPoint(event.clientX, event.clientY)
      .map(element => element.closest<HTMLElement>('[data-drop]'))
      .find(Boolean)?.dataset.drop
    setOffset({ x: 0, y: 0 })
    if (target) onDrop(target); else onReturn?.()
  }
  return <button type="button" className={`${className} ${dragging ? 'dragging' : ''}`} aria-label={label} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { setDragging(false); setOffset({ x: 0, y: 0 }) }} onKeyDown={onKeyDown} style={{ transform: `translate3d(${offset.x}px,${offset.y}px,0)` }}>{children}</button>
}

function Train({ acted, onAction }: Omit<Props, 'sceneId'>) {
  return <div className="art train" aria-label="電車内。隣の座席にはバッグがあり、その前に乗客が立っている">
    <SceneBackground scene="train" fallback={trainArtwork} />
    <div className="train-window"><i /><span>つぎは　若葉町</span><i /></div><div className="route-sign">若葉町　→　青葉台</div><div className="strap-row"><i /><i /><i /></div>
    <div className="waiting-passenger"><Person /></div><div className="train-floor" data-drop="floor" />
    <div className="bench"><button className="player-button" aria-label="座っている自分。押すと立つ" onClick={() => onAction('stand')}><Player seated /></button><span className="seat-space"><i className="lap-zone" data-drop="lap" /></span></div>
    {!acted && <Draggable className="bag" label="隣の座席のバッグ。ドラッグして動かす。キーボードでは左矢印で膝、下矢印で床へ移動" onDrop={target => onAction(target === 'lap' ? 'bag-lap' : 'bag-floor')} onKeyDown={event => { if (event.key === 'ArrowLeft') onAction('bag-lap'); if (event.key === 'ArrowDown') onAction('bag-floor') }}><i className="bag-handle" /><i className="bag-pocket" /></Draggable>}
  </div>
}

function Elevator({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const holdTimer = useRef<number | undefined>(undefined)
  const held = useRef(false)
  const startHold = () => { held.current = false; holdTimer.current = window.setTimeout(() => { held.current = true; onAction('hold-open') }, 650) }
  const endHold = () => { window.clearTimeout(holdTimer.current); if (!held.current) onAction('open') }
  return <div className="art elevator" aria-label="エレベーターの扉が閉まりかけ、廊下の向こうから人が走ってくる">
    <SceneBackground scene="elevator" fallback={elevatorArtwork} />
    <div className="hall"><i className="hall-light" /><span className="runner"><Person className="running" /></span><span className="runner-arm" /></div>
    <div className={`lift-doors ${acted === 'open' || acted === 'hold-open' ? 'open' : acted === 'close' ? 'shut' : ''}`}><i /><i /></div>
    <div className="panel"><span>5</span><button aria-label="開く" onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={() => window.clearTimeout(holdTimer.current)}><b>開</b><i>◁　▷</i></button><button aria-label="閉じる" onClick={() => onAction('close')}><b>閉</b><i>▷　◁</i></button></div>
  </div>
}

function Karaage({ acted, onAction }: Omit<Props, 'sceneId'>) {
  return <div className="art dining" aria-label="4人で囲む食卓。中央の大皿に唐揚げがひとつ残っている">
    <SceneBackground scene="karaage" fallback={karaageArtwork} />
    <div className="diner top"><Person /></div><div className="diner left"><Person /></div><div className="diner right"><Person /></div><div className="diner bottom"><Player /></div>
    <div className="dining-table"><span className="plate top-plate" /><span className="plate other-a" data-drop="give-left" /><span className="plate other-b" data-drop="give-right" /><span className="plate mine" data-drop="take-self" /><span className="serving-plate" data-drop="return"><i className="crumbs" /></span><i className="glass glass-a" /><i className="glass glass-b" /><i className="chopsticks" /></div>
    {!acted && <Draggable className="karaage" label="最後の唐揚げ。皿へドラッグする。キーボードでは下で自分、左右で他の人、上で元の皿" onDrop={onAction} onReturn={() => onAction('return')} onKeyDown={event => { const keys: Record<string,string> = { ArrowDown: 'take-self', ArrowLeft: 'give-left', ArrowRight: 'give-right', ArrowUp: 'return' }; if (keys[event.key]) onAction(keys[event.key]) }}><i /></Draggable>}
  </div>
}

function Meeting({ acted, onAction }: Omit<Props, 'sceneId'>) {
  return <div className="art meeting" aria-label="オンライン会議。司会者が誰か意見ありますかと尋ね、沈黙している">
    <SceneBackground scene="meeting" fallback={meetingArtwork} />
    <div className="meeting-bar"><i /> team meeting <span>10:42</span></div><div className="call-grid"><div><Person /><small>田中</small></div><div><Person /><small>佐藤</small></div><div><Player /><small>自分</small></div><div><Person /><small>鈴木</small></div></div>
    <p className="speech">「誰か、意見ありますか？」</p><span className="silence">……</span>
    <div className="call-controls"><button className={acted === 'mic' ? 'selected' : ''} onClick={() => onAction('mic')} aria-label="マイクをオンにする"><b>●</b><small>ミュート</small></button><button onClick={() => onAction('hand')} aria-label="手を挙げる"><b>♧</b><small>挙手</small></button><button onClick={() => onAction('chat')} aria-label="チャットに短い反応を送る"><b>□</b><small>チャット</small></button></div>
  </div>
}

function Ending({ acted, onAction }: Omit<Props, 'sceneId'>) {
  const [tidy, setTidy] = useState(false)
  return <div className="art final-scene" aria-label="終了画面。部屋の端にはゴミ箱と小さな紙くずがある">
    <SceneBackground scene="ending" fallback={endingArtwork} />
    <div className="office-wall"><i className="clock" /><span className="baseboard" /></div><div className="end-card"><Player /><h2>お疲れさまでした。</h2><button onClick={() => onAction(tidy ? 'trash' : 'finish')}>終了</button></div>
    <span className="wastebasket" data-drop="bin" aria-hidden="true"><i /><i /><i /></span>
    {!tidy && !acted && <Draggable className="paper-scrap" label="床の端の紙くず。ゴミ箱へドラッグできる" onDrop={target => { if (target === 'bin') setTidy(true) }}><i /></Draggable>}
  </div>
}

export function SceneArtwork(props: Props) {
  if (props.sceneId === 'train') return <Train {...props} />
  if (props.sceneId === 'elevator') return <Elevator {...props} />
  if (props.sceneId === 'karaage') return <Karaage {...props} />
  if (props.sceneId === 'meeting') return <Meeting {...props} />
  return <Ending {...props} />
}
