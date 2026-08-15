import type { Action, GameRecord, Scene, Scores } from '../types'

export const initialScores: Scores = { awareness: 40, kindness: 40, assertiveness: 40, nerve: 40, hesitation: 0 }

export function applyAction(scores: Scores, action: Action): Scores {
  return Object.fromEntries(Object.entries(scores).map(([key, value]) => [
    key, Math.max(0, Math.min(100, value + (action.scores[key as keyof Scores] ?? 0))),
  ])) as Scores
}

function actionImpact(action: Action): number {
  return Object.values(action.scores).reduce((total, value) => total + Math.max(0, value ?? 0), 0)
}

export function scoreAction(scene: Scene, action: Action): number {
  const maximum = Math.max(0, ...scene.actions.map(actionImpact))
  return maximum === 0 ? 0 : Math.round(actionImpact(action) / maximum * 100)
}

export function calculatePlayScore(records: readonly GameRecord[]): number {
  if (records.length === 0) return 0
  return Math.round(records.reduce((total, record) => total + record.score, 0) / records.length)
}

export function describeScoreChange(score: number, previousScore: number | null): string {
  if (previousScore === null) return ''

  const difference = score - previousScore
  if (difference === 0) return '前回と同じ'
  return `前回より${difference > 0 ? '+' : ''}${difference}点`
}

export function describeReplayFocus(records: readonly GameRecord[]): string {
  if (records.length === 0) return ''
  if (records.every(record => record.score === 100)) return '100点達成。今度は、好きな選び方でもう一度。'

  const focus = records.reduce((lowest, record) => record.score < lowest.score ? record : lowest)
  return `次は「${focus.scene}」で、別の動きも試してみよう。`
}

export function diagnose(scores: Scores) {
  if (scores.hesitation >= 35 && scores.awareness >= 58) return { title: '気づいているけど動かない人', comment: '見えているからこそ、ひと呼吸。間もあなたの選択です。' }
  if (scores.awareness >= 75 && scores.kindness >= 70) return { title: '察しすぎてちょっと疲れる人', comment: '小さな気配まで、いつの間にか拾っています。' }
  if (scores.assertiveness >= 70 && scores.awareness >= 55) return { title: '空気を見つつ自分も通す人', comment: 'あたりを見て、それでも自分の手で決められます。' }
  if (scores.nerve >= 70) return { title: '鋼のマイペース', comment: '空気は空気、自分は自分。ぶれない歩幅です。' }
  if (scores.kindness >= 67) return { title: '先回りしがちな人', comment: '誰かが言うより、ほんの少し早く手が動きます。' }
  return { title: 'ちょうどよく気が回る人', comment: '見たり、動いたり、待ったり。ほどよい距離感です。' }
}
