import type { Scene } from '../types'

type Props = {
  scene: Scene
  acted: string | null
  onAction: (id: string) => void
}

export function ChoiceScene({ scene, acted, onAction }: Props) {
  if (!scene.presentation) return null

  return <div className="art choice-scene" aria-label={scene.presentation.situation}>
    <p>{scene.presentation.situation}</p>
    <div>{scene.presentation.choices.map(choice => <button
      type="button"
      key={choice.actionId}
      className={`choice-action ${acted === choice.actionId ? 'selected' : ''}`}
      onClick={() => onAction(choice.actionId)}
    ><span aria-hidden="true">{choice.symbol}</span>{choice.label}</button>)}</div>
  </div>
}
