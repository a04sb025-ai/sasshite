import { useEffect, useState } from 'react'
import type { Choice, Scene } from '../types'
import { SceneArtwork } from './SceneArtwork'

export function GameScene({ scene, number, total, onComplete }: { scene: Scene; number: number; total: number; onComplete: (choice: Choice) => void }) {
  const [acted, setActed] = useState<string | null>(null)
  useEffect(() => {
    const timer = window.setTimeout(() => finish('wait'), scene.timeoutMs)
    return () => window.clearTimeout(timer)
  // scene change must restart the timer; onComplete is intentionally omitted
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene])
  const finish = (id: string) => {
    if (acted) return
    const choice = scene.choices.find(item => item.id === id)
    if (!choice) return
    setActed(id)
    window.setTimeout(() => onComplete(choice), 650)
  }
  return <main className="game-screen">
    <header className="scene-header"><span>{String(number).padStart(2, '0')} / {String(total).padStart(2, '0')}</span><p>{scene.eyebrow}</p></header>
    <SceneArtwork sceneId={scene.id} acted={acted} onAction={finish} />
    <div className="timer" aria-hidden="true"><i key={scene.id} style={{ animationDuration: `${scene.timeoutMs}ms` }} /></div>
    <p className="sr-only" aria-live="polite">{acted ? '操作を受け付けました' : ''}</p>
  </main>
}
