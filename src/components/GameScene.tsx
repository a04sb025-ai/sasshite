import { useCallback, useEffect, useRef, useState } from 'react'
import type { Action, Scene } from '../types'
import { SceneArtwork } from './SceneArtwork'

type Props = { scene: Scene; number: number; total: number; onComplete: (action: Action) => void }

export function GameScene({ scene, number, total, onComplete }: Props) {
  const [acted, setActed] = useState<Action | null>(null)
  const actedRef = useRef(false)
  const finish = useCallback((id: string) => {
    if (actedRef.current) return
    const action = scene.actions.find(item => item.id === id)
    if (!action) return
    actedRef.current = true
    setActed(action)
    window.setTimeout(() => onComplete(action), 1250)
  }, [onComplete, scene])

  useEffect(() => {
    const timer = window.setTimeout(() => finish('wait'), scene.timeoutMs)
    return () => window.clearTimeout(timer)
  }, [finish, scene.timeoutMs])

  return <main className="game-screen">
    <header className="scene-header"><span>{String(number).padStart(2, '0')} / {String(total).padStart(2, '0')}</span><p>{scene.eyebrow}</p></header>
    <SceneArtwork sceneId={scene.id} acted={acted?.id ?? null} onAction={finish} />
    <div className="reaction" aria-live="polite">{acted?.reaction ?? <span aria-hidden="true">&nbsp;</span>}</div>
    <div className="timer" aria-hidden="true"><i key={scene.id} style={{ animationDuration: `${scene.timeoutMs}ms` }} /></div>
  </main>
}
