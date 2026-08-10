import type { Action, Scores } from '../types'

export const initialScores: Scores = { awareness: 40, kindness: 40, assertiveness: 40, nerve: 40, hesitation: 0 }

export function applyAction(scores: Scores, action: Action): Scores {
  return Object.fromEntries(Object.entries(scores).map(([key, value]) => [
    key, Math.max(0, Math.min(100, value + (action.scores[key as keyof Scores] ?? 0))),
  ])) as Scores
}

export function diagnose(scores: Scores) {
  if (scores.hesitation >= 35 && scores.awareness >= 58) return { title: '気づいているけど動かない人', comment: '見えているからこそ、ひと呼吸。間もあなたの選択です。' }
  if (scores.awareness >= 75 && scores.kindness >= 70) return { title: '察しすぎてちょっと疲れる人', comment: '小さな気配まで、いつの間にか拾っています。' }
  if (scores.assertiveness >= 70 && scores.awareness >= 55) return { title: '空気を見つつ自分も通す人', comment: 'あたりを見て、それでも自分の手で決められます。' }
  if (scores.nerve >= 70) return { title: '鋼のマイペース', comment: '空気は空気、自分は自分。ぶれない歩幅です。' }
  if (scores.kindness >= 67) return { title: '先回りしがちな人', comment: '誰かが言うより、ほんの少し早く手が動きます。' }
  return { title: 'ちょうどよく気が回る人', comment: '見たり、動いたり、待ったり。ほどよい距離感です。' }
}
