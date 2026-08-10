import type { Scene } from '../types'

export const scenes: Scene[] = [
  {
    id: 'train',
    eyebrow: '電車',
    prompt: '隣の席に、自分のバッグ。目の前には立っている人。',
    timeoutMs: 14000,
    timeoutChoiceId: 'watch',
    choices: [
      { id: 'move-bag', label: 'バッグを膝へ移す', reaction: '席がひとつ空いた。', scores: { awareness: 15, kindness: 14 } },
      { id: 'watch', label: '少し様子を見る', reaction: 'その人は、もう一度だけ空いた席を見た。', scores: { awareness: 8, kindness: 2, nerve: 3 } },
      { id: 'ignore', label: 'そのままにする', reaction: 'その人は、少し離れた場所へ移った。', scores: { assertiveness: 8, nerve: 12, kindness: -8 } },
    ],
  },
  {
    id: 'elevator',
    eyebrow: 'エレベーター',
    prompt: '扉が閉まりはじめた。向こうから人が走ってくる。',
    timeoutMs: 12000,
    timeoutChoiceId: 'wait',
    choices: [
      { id: 'open', label: '「開」を押す', reaction: '扉がもう一度ひらいた。', scores: { awareness: 12, kindness: 14 } },
      { id: 'wait', label: '何もしない', reaction: '扉は、そのまま閉まっていった。', scores: { awareness: 3, nerve: 5 } },
      { id: 'close', label: '「閉」を押す', reaction: '扉は少し早く閉まった。', scores: { assertiveness: 10, nerve: 14, kindness: -8 } },
    ],
  },
  {
    id: 'karaage',
    eyebrow: '最後のひとつ',
    prompt: '皿には唐揚げがひとつ。さっきまでの会話が、少し止まった。',
    timeoutMs: 14000,
    timeoutChoiceId: 'wait',
    choices: [
      { id: 'ask', label: '「誰か食べる？」と聞く', reaction: '一瞬の間のあと、みんな少し笑った。', scores: { awareness: 10, kindness: 12, assertiveness: 6 } },
      { id: 'eat', label: '自分で食べる', reaction: '最後のひとつは、なくなった。', scores: { assertiveness: 16, nerve: 14 } },
      { id: 'wait', label: 'まだ手を出さない', reaction: '誰も取らないまま、数秒たった。', scores: { awareness: 8, kindness: 6, assertiveness: -4 } },
    ],
  },
  {
    id: 'meeting',
    eyebrow: 'オンライン会議',
    prompt: '「ほかに意見ありますか？」――少しだけ沈黙が続く。',
    timeoutMs: 13000,
    timeoutChoiceId: 'silence',
    choices: [
      { id: 'speak', label: 'すぐに話す', reaction: '画面の視線が、あなたに集まった。', scores: { assertiveness: 15, nerve: 10, kindness: 3 } },
      { id: 'pause-speak', label: '少し待ってから話す', reaction: '誰も話し出さない。あなたがマイクを入れた。', scores: { awareness: 10, assertiveness: 9, kindness: 4 } },
      { id: 'silence', label: '最後まで黙る', reaction: '司会が「では次へ」と進めた。', scores: { awareness: 2, nerve: 5 } },
    ],
  },
  {
    id: 'ending',
    eyebrow: '帰り際',
    prompt: '「お疲れさまでした。」出口の近くに、小さな紙くずが落ちている。',
    timeoutMs: 15000,
    timeoutChoiceId: 'finish',
    choices: [
      { id: 'trash', label: '紙くずを拾う', reaction: '床から、ひとつだけ物が消えた。', scores: { awareness: 18, kindness: 16 } },
      { id: 'finish', label: 'そのまま帰る', reaction: '今日の予定は、これで終わり。', scores: { assertiveness: 5, nerve: 8 } },
      { id: 'hesitate', label: '少し気になるけど通り過ぎる', reaction: '数歩進んでから、少しだけ気になった。', scores: { awareness: 7, nerve: 4 } },
    ],
  },
]
