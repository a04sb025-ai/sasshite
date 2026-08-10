export type Trait = 'awareness' | 'kindness' | 'assertiveness' | 'nerve'
export type Scores = Record<Trait, number>

export type Choice = {
  id: string
  label: string
  reaction: string
  scores: Partial<Scores>
}

export type Scene = {
  id: string
  eyebrow: string
  prompt: string
  timeoutMs: number
  timeoutChoiceId: string
  choices: Choice[]
}
