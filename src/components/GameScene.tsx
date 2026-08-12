import { useCallback, useEffect, useRef, useState } from 'react'
import type { Action, Scene } from '../types'
import { SceneArtwork } from './SceneArtwork'

type Props = { scene: Scene; number: number; total: number; onComplete: (action: Action) => void }

export function GameScene({ scene, number, total, onComplete }: Props) {
  const [acted, setActed] = useState<Action | null>(null)
  const [showBefore, setShowBefore] = useState(false)
  const actedRef = useRef(false)
  const beforeRef = useRef<HTMLDivElement>(null)

  const finish = useCallback((id: string) => {
    if (actedRef.current) return
    const action = scene.actions.find(item => item.id === id)
    if (!action) return
    actedRef.current = true
    setActed(action)
  }, [scene])

  useEffect(() => {
    const timer = window.setTimeout(() => finish('wait'), scene.timeoutMs)
    return () => window.clearTimeout(timer)
  }, [finish, scene.timeoutMs])

  useEffect(() => {
    beforeRef.current?.setAttribute('inert', '')
  }, [acted])

  const revealBefore = () => setShowBefore(true)
  const revealAfter = () => setShowBefore(false)
  const advance = () => {
    if (!acted) return
    onComplete(acted)
  }

  return <main className={`game-screen ${acted ? 'has-acted' : ''}`}>
    <header className="scene-header"><span>{String(number).padStart(2, '0')} / {String(total).padStart(2, '0')}</span><p>{scene.eyebrow}</p></header>

    <div className={`scene-stage ${acted ? 'is-after' : ''}`}>
      <SceneArtwork sceneId={scene.id} acted={acted?.id ?? null} onAction={finish} />
      {acted && <span className="after-badge" aria-hidden="true">AFTER</span>}
      {acted && <div ref={beforeRef} className={`before-overlay ${showBefore ? 'visible' : ''}`} aria-hidden="true">
        <SceneArtwork sceneId={scene.id} acted={null} onAction={() => undefined} />
        <span className="before-badge">BEFORE</span>
      </div>}
    </div>

    {acted ? <section className="action-result" aria-live="polite">
      <p className="action-reaction"><strong>あなたが動いたあと</strong>{acted.reaction}</p>
      <div className="action-controls">
        <button
          type="button"
          className="compare-button"
          aria-label="押している間、操作する前の場面を見る"
          onPointerDown={revealBefore}
          onPointerUp={revealAfter}
          onPointerCancel={revealAfter}
          onPointerLeave={revealAfter}
          onKeyDown={event => {
            if (event.key === ' ' || event.key === 'Enter') revealBefore()
          }}
          onKeyUp={revealAfter}
          onBlur={revealAfter}
        >BEFORE</button>
        <button type="button" className="next-scene-button" onClick={advance}>{number === total ? '結果' : '次へ'}</button>
      </div>
      <p className="compare-hint">BEFOREを押している間だけ、元の場面に戻ります。</p>
    </section> : <div className="reaction" aria-live="polite"><span aria-hidden="true">&nbsp;</span></div>}

    <div className="timer" aria-hidden="true"><i key={scene.id} style={{ animationDuration: `${scene.timeoutMs}ms` }} /></div>
  </main>
}
