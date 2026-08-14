export type Trait = 'awareness' | 'kindness' | 'assertiveness' | 'nerve' | 'hesitation'
export type Scores = Record<Trait, number>

export type Action = {
  id: string
  history: string
  reaction: string
  scores: Partial<Scores>
}

export type AgeModeId = 'kindergarten' | 'lower-elementary' | 'upper-elementary' | 'junior-high' | 'high-school' | 'university' | 'working-adult'

export type ScenePresentation = {
  situation: string
  choices: { actionId: string; label: string; symbol: string }[]
}

export type Scene = {
  id: string
  eyebrow: string
  timeoutMs: number
  actions: Action[]
  presentation?: ScenePresentation
}

export type GameRecord = { scene: string; action: string; score: number }
