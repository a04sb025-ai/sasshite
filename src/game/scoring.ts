import type { Choice, Scores } from '../types'

export const initialScores: Scores = { awareness: 42, kindness: 42, assertiveness: 42, nerve: 42 }

export function applyChoice(scores: Scores, choice: Choice): Scores {
  return Object.fromEntries(Object.entries(scores).map(([key, value]) => [
    key, Math.max(0, Math.min(100, value + (choice.scores[key as keyof Scores] ?? 0))),
  ])) as Scores
}

export function diagnose(scores: Scores) {
  if (scores.awareness >= 75 && scores.kindness >= 70) return { title: '空気読みの忍者', comment: '気配を捉えたころには、もう片づいています。' }
  if (scores.nerve >= 70 || (scores.assertiveness >= 65 && scores.awareness < 45)) return { title: '空気？ありました？', comment: '風通しのよさでは、たぶん優勝です。' }
  if (scores.kindness >= 65 || scores.awareness >= 68) return { title: '頼まれてない係長', comment: '誰も頼んでいないのに、なぜか助かりました。' }
  return { title: '人類の平均値', comment: '読みすぎず、読まなすぎず。今日も平和です。' }
}
