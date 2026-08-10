export type Trait = 'awareness' | 'kindness' | 'assertiveness' | 'nerve' | 'hesitation'
export type Scores = Record<Trait, number>

export type Action = {
  id: string
  history: string
  reaction: string
  scores: Partial<Scores>
}

export type Scene = {
  id: 'train' | 'elevator' | 'karaage' | 'meeting' | 'ending'
  eyebrow: string
  timeoutMs: number
  actions: Action[]
}

export type GameRecord = { scene: string; action: string }
