import { useEffect, useRef, useState } from 'react'
import type { Choice, Scene } from '../types'
import { SceneArtwork } from './SceneArtwork'

export function GameScene({ scene, number, total, onComplete }: { scene: Scene; number: number; total: number; onComplete: (choice: Choice) => void }) {
  const [acted, setActed] = useState<string | null>(null)
  const [reaction, setReaction] = useState('')
  const [choicesVisible, setChoicesVisible] = useState(false)
  const resolved = useRef(false)

  const finish = (id: string) => {
    if (resolved.current) return
    const choice = scene.choices.find(item => item.id === id)
    if (!choice) return
    resolved.current = true
    setActed(id)
    setReaction(choice.reaction)
    setChoicesVisible(false)
    window.setTimeout(() => onComplete(choice), 1450)
  }

  useEffect(() => {
    const reveal = window.setTimeout(() => setChoicesVisible(true), 650)
    const timer = window.setTimeout(() => finish(scene.timeoutChoiceId), scene.timeoutMs)
    return () => {
      window.clearTimeout(reveal)
      window.clearTimeout(timer)
    }
  // The scene key remounts this component; finish intentionally captures this scene.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene])

  return <main className="game-screen">
    <header className="scene-header">
      <span>{String(number).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
      <p>{scene.eyebrow}</p>
    </header>

    <p className="scene-prompt">{scene.prompt}</p>
    <SceneArtwork sceneId={scene.id} acted={acted} />

    <div className="timer" aria-hidden="true"><i key={scene.id} style={{ animationDuration: `${scene.timeoutMs}ms` }} /></div>

    <section className={`decision-panel ${choicesVisible && !acted ? 'is-visible' : ''}`} aria-label="行動を選ぶ">
      <p>あなたなら？</p>
      <div className="decision-grid">
        {scene.choices.map(choice => <button key={choice.id} type="button" onClick={() => finish(choice.id)} disabled={Boolean(acted)}>{choice.label}</button>)}
      </div>
      <small>選ばなくても、時間がくれば進みます。</small>
    </section>

    {acted && <div className="reaction-card" role="status" aria-live="polite"><span>そのあと</span><p>{reaction}</p></div>}
  </main>
}
