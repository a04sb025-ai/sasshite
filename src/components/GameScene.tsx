import { useCallback, useEffect, useRef, useState } from 'react'
import { describeScoreChange, scoreAction } from '../game/scoring'
import type { Action, Scene } from '../types'
import TrainPixiPrototype from '../prototypes/TrainPixiPrototype'
import { PlayroomScene } from './PlayroomScene'
import { SceneArtwork } from './SceneArtwork'

type Props = { scene: Scene; number: number; total: number; previousScore: number | null; onComplete: (action: Action) => void }

export function GameScene({ scene, number, total, previousScore, onComplete }: Props) {
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

  const artwork = scene.id === 'train'
    ? <TrainPixiPrototype embedded disabled={acted !== null} onAction={finish} />
    : scene.id === 'kindergarten-playhouse'
      ? <PlayroomScene acted={acted?.id ?? null} onAction={finish} />
      : <SceneArtwork sceneId={scene.id} acted={acted?.id ?? null} onAction={finish} />

  return <main className="game-screen">
    <header className="scene-header"><span>{String(number).padStart(2, '0')} / {String(total).padStart(2, '0')}</span><p>{scene.eyebrow}</p></header>
    {artwork}
    <div className="reaction" aria-live="polite">{acted
      ? <><span>{acted.reaction}</span><strong>察しスコア {scoreAction(scene, acted)}点{previousScore !== null && <small>{describeScoreChange(scoreAction(scene, acted), previousScore)}</small>}</strong></>
      : <span aria-hidden="true">&nbsp;</span>}</div>
    <div className={`timer ${acted ? 'resolved' : ''}`} aria-hidden="true"><i key={scene.id} style={{ animationDuration: `${scene.timeoutMs}ms` }} /></div>
  </main>
}
