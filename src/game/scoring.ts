import type { Choice, Scores } from '../types'

export const initialScores: Scores = { awareness: 42, kindness: 42, assertiveness: 42, nerve: 42 }

export function applyChoice(scores: Scores, choice: Choice): Scores {
  return Object.fromEntries(Object.entries(scores).map(([key, value]) => [
    key,
    Math.max(0, Math.min(100, value + (choice.scores[key as keyof Scores] ?? 0))),
  ])) as Scores
}

export function diagnose(scores: Scores) {
  if (scores.awareness >= 72 && scores.kindness >= 68 && scores.assertiveness < 55) {
    return { title: '察しすぎセンサー', comment: '小さな変化によく気づく人。たまには気づかなかったふりも、たぶん必要です。' }
  }
  if (scores.awareness >= 68 && scores.assertiveness >= 62) {
    return { title: '読んで、動く人', comment: '空気は読む。でも空気だけには決めさせない。動くタイミングが自分の中にあります。' }
  }
  if (scores.assertiveness >= 68 || scores.nerve >= 72) {
    return { title: 'マイペース強者', comment: '周りは見えている。けれど最後に決めるのは自分。その潔さ、かなり強めです。' }
  }
  if (scores.kindness >= 66) {
    return { title: '先回りしがち', comment: '頼まれる少し前に動きがち。助かる人も多いけれど、働きすぎにはご注意を。' }
  }
  return { title: 'ちょうどいい察し人', comment: '読むときは読む。流すときは流す。空気との距離感は、かなり自然体です。' }
}
