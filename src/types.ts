export type Trait = 'awareness' | 'kindness' | 'assertiveness' | 'nerve'
export type Scores = Record<Trait, number>
export type Choice = { id: string; label: string; scores: Partial<Scores> }
export type Scene = { id: string; eyebrow: string; timeoutMs: number; choices: Choice[] }
