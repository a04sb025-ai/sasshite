import type { AgeModeId, Scene } from '../types'
import { scenes } from './scenes'

export type AgeMode = {
  id: AgeModeId
  label: string
  status: 'sample' | 'development'
  scenes: readonly Scene[]
}

const kindergartenScenes: Scene[] = [{
  id: 'kindergarten-blocks', eyebrow: 'ようちえん', timeoutMs: 12_000,
  presentation: {
    situation: 'つみき。おともだちも みている。',
    choices: [
      { actionId: 'share', label: 'いっしょに つかう', symbol: '🧱🧱' },
      { actionId: 'finish-first', label: 'もうすこし つくる', symbol: '🧱' },
    ],
  },
  actions: [
    { id: 'share', history: 'つみきを いっしょに つかった', reaction: 'ふたりの まちが できた。', scores: { awareness: 15, kindness: 15 } },
    { id: 'finish-first', history: 'もうすこし つくってから わたした', reaction: 'おともだちは、となりで まった。', scores: { assertiveness: 10, awareness: 5 } },
    { id: 'wait', history: 'つみきを もったまま まった', reaction: 'ふたりで つみきを みていた。', scores: { hesitation: 7 } },
  ],
}]

const juniorHighScenes: Scene[] = [{
  id: 'junior-high-cleanup', eyebrow: '部活のあと', timeoutMs: 13_000,
  presentation: {
    situation: '先輩は話している。友達はまだ一人で片付けている。',
    choices: [
      { actionId: 'help', label: '友達の片付けを手伝う', symbol: '📦' },
      { actionId: 'invite', label: '先輩にも声をかける', symbol: '💬' },
      { actionId: 'leave', label: '先に帰る', symbol: '🎒' },
    ],
  },
  actions: [
    { id: 'help', history: '友達の片付けを手伝った', reaction: '箱が、少し早く空になった。', scores: { awareness: 14, kindness: 14 } },
    { id: 'invite', history: '先輩にも片付けを呼びかけた', reaction: '話が止まり、手が二つ増えた。', scores: { awareness: 12, assertiveness: 13 } },
    { id: 'leave', history: '声をかけず先に帰った', reaction: '友達は、残りの箱を持ち上げた。', scores: { nerve: 12 } },
    { id: 'wait', history: '少し様子を見た', reaction: '片付けの音だけが続いた。', scores: { awareness: 6, hesitation: 9 } },
  ],
}]

const workingAdultSample: Scene = {
  id: 'working-adult-documents', eyebrow: '会議の前', timeoutMs: 12_000,
  presentation: {
    situation: '同僚が資料を配っている。会議はもうすぐ始まりそう。',
    choices: [
      { actionId: 'help', label: '残りを受け取って配る', symbol: '📄' },
      { actionId: 'ask', label: '手伝うか聞く', symbol: '💬' },
      { actionId: 'prepare', label: '自分の準備を続ける', symbol: '💻' },
    ],
  },
  actions: [
    { id: 'help', history: '残りの資料を受け取って配った', reaction: '資料が、全員の前にそろった。', scores: { awareness: 14, kindness: 12, assertiveness: 5 } },
    { id: 'ask', history: '手伝うか同僚に聞いた', reaction: '同僚は半分の束を差し出した。', scores: { awareness: 12, kindness: 10 } },
    { id: 'prepare', history: '自分の会議準備を続けた', reaction: '配り終えるころ、画面の準備も整った。', scores: { assertiveness: 10, nerve: 7 } },
    { id: 'wait', history: '始まるまで様子を見た', reaction: '最後の一枚が配られた。', scores: { hesitation: 7, awareness: 4 } },
  ],
}

export const ageModes: readonly AgeMode[] = [
  { id: 'kindergarten', label: '幼稚園', status: 'sample', scenes: kindergartenScenes },
  { id: 'lower-elementary', label: '小学校低学年', status: 'development', scenes: [] },
  { id: 'upper-elementary', label: '小学校高学年', status: 'development', scenes: [] },
  { id: 'junior-high', label: '中学生', status: 'sample', scenes: juniorHighScenes },
  { id: 'high-school', label: '高校生', status: 'development', scenes: [] },
  { id: 'university', label: '大学生', status: 'development', scenes: [] },
  { id: 'working-adult', label: '社会人', status: 'sample', scenes: [...scenes, workingAdultSample] },
]

export function getAgeMode(id: AgeModeId): AgeMode {
  return ageModes.find(mode => mode.id === id) ?? ageModes[0]
}
