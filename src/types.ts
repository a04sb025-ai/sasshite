export type Trait = 'awareness' | 'kindness' | 'assertiveness' | 'nerve' | 'hesitation'
export type Scores = Record<Trait, number>

export type Action = {
  id: string
  history: string
  reaction: string
  scores: Partial<Scores>
}

export type SceneId =
  | 'train'
  | 'elevator'
  | 'karaage'
  | 'meeting'
  | 'bus'
  | 'cafe'
  | 'snack'
  | 'rain'
  | 'photo'
  | 'printer'
  | 'bill'
  | 'door'
  | 'checkout'
  | 'pantry'
  | 'ending'

export type Scene = {
  id: SceneId
  eyebrow: string
  timeoutMs: number
  actions: Action[]
}

export type GameRecord = { scene: string; action: string }
