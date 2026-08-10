import type { Scene } from '../types'

export const scenes: Scene[] = [
  { id: 'train', eyebrow: '電車', timeoutMs: 14000, choices: [
    { id: 'move-bag', label: 'バッグを膝へ移す', scores: { awareness: 18, kindness: 20 } },
    { id: 'wait', label: 'そのままにする', scores: { awareness: -8, nerve: 17 } },
  ]},
  { id: 'elevator', eyebrow: 'エレベーター', timeoutMs: 12000, choices: [
    { id: 'open', label: '開く', scores: { awareness: 17, kindness: 18 } },
    { id: 'close', label: '閉じる', scores: { assertiveness: 13, nerve: 20, kindness: -8 } },
    { id: 'wait', label: '何もしない', scores: { awareness: -3, nerve: 7 } },
  ]},
  { id: 'karaage', eyebrow: '最後の唐揚げ', timeoutMs: 12000, choices: [
    { id: 'eat', label: '唐揚げを食べる', scores: { assertiveness: 20, nerve: 18 } },
    { id: 'wait', label: '見守る', scores: { awareness: 12, kindness: 10 } },
  ]},
  { id: 'meeting', eyebrow: 'オンライン会議', timeoutMs: 12000, choices: [
    { id: 'speak', label: 'マイクをオンにする', scores: { awareness: 9, assertiveness: 20, kindness: 5 } },
    { id: 'wait', label: '沈黙する', scores: { awareness: -4, nerve: 8 } },
  ]},
  { id: 'ending', eyebrow: '終了？', timeoutMs: 14000, choices: [
    { id: 'trash', label: '小さな紙くずを拾う', scores: { awareness: 24, kindness: 20 } },
    { id: 'finish', label: '終了する', scores: { assertiveness: 5, nerve: 12 } },
    { id: 'wait', label: 'そのまま待つ', scores: { awareness: 3 } },
  ]},
]
