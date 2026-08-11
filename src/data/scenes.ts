import type { Action, Scene } from '../types'

const action = (id: string, history: string, reaction: string, scores: Action['scores']): Action => ({ id, history, reaction, scores })

export const scenes: Scene[] = [
  { id: 'train', eyebrow: '電車', timeoutMs: 12000, actions: [
    action('bag-lap', 'バッグを膝に移した', '席がひとつ空いた。', { awareness: 16, kindness: 16 }),
    action('bag-floor', 'バッグを床に置いた', '足もとに、少し場所ができた。', { awareness: 13, kindness: 10, assertiveness: 3 }),
    action('bag-other', 'バッグを別の場所へ移した', 'とりあえず、隣の席は空いた。', { awareness: 10, kindness: 8, assertiveness: 4 }),
    action('stand', '席を立った', '座席がふたつ、並んで空いた。', { kindness: 13, assertiveness: 8 }),
    action('wait', 'しばらく、そのままにした', '電車は、次の駅へ向かった。', { nerve: 11, hesitation: 8 }),
  ]},
  { id: 'elevator', eyebrow: 'エレベーター', timeoutMs: 11000, actions: [
    action('open', '開ボタンを押した', '扉がもう一度開いた。', { awareness: 14, kindness: 15 }),
    action('hold-open', '開ボタンを長押しした', '扉は、その人を待っていた。', { awareness: 17, kindness: 17 }),
    action('close', '閉ボタンを押した', '扉は静かに閉じた。', { assertiveness: 12, nerve: 15 }),
    action('wait', '閉まる扉を見ていた', '扉は、そのまま閉じた。', { hesitation: 6, nerve: 6 }),
  ]},
  { id: 'karaage', eyebrow: '食卓', timeoutMs: 13000, actions: [
    action('take-self', '最後の唐揚げを自分の皿へ運んだ', '一瞬、全員の目が動いた。', { assertiveness: 17, nerve: 16 }),
    action('give-left', '最後の唐揚げを隣の人の皿へ運んだ', '隣の人が、小さく笑った。', { awareness: 12, kindness: 16 }),
    action('give-right', '最後の唐揚げを向かいの人の皿へ運んだ', '向かいの人が、少し驚いた。', { kindness: 14, assertiveness: 5 }),
    action('return', '唐揚げを持ち上げて、皿へ戻した', '箸が止まり、また静かになった。', { hesitation: 16, awareness: 7 }),
    action('table-other', '唐揚げを別の場所へ動かした', '食卓の視線が、その動きを追った。', { awareness: 8, nerve: 5 }),
    action('wait', '最後のひとつを見ながら待った', 'しばらく、ひとつのままだった。', { hesitation: 10, awareness: 8 }),
  ]},
  { id: 'meeting', eyebrow: 'オンライン会議', timeoutMs: 12000, actions: [
    action('mic', 'マイクをオンにした', '少しして、沈黙が途切れた。', { assertiveness: 17, awareness: 8 }),
    action('hand', '挙手機能を使った', '画面の隅に、手がひとつ上がった。', { kindness: 7, assertiveness: 13 }),
    action('chat', 'チャットに短い反応を送った', 'チャット欄に、一行増えた。', { awareness: 11, hesitation: 5 }),
    action('wait', 'ミュートのまま待った', 'カーソルだけが、点滅していた。', { hesitation: 10, nerve: 6 }),
  ]},
  { id: 'ending', eyebrow: '帰り際', timeoutMs: 14000, actions: [
    action('trash', '紙くずを拾ってから終了した', '床の端が、すっきりした。', { awareness: 18, kindness: 15 }),
    action('finish', 'そのまま終了した', '画面が、ゆっくり暗くなった。', { assertiveness: 5, nerve: 10 }),
    action('wait', '少しだけ、その場に残った', '「お疲れさま」が、まだ残っている。', { hesitation: 8, awareness: 3 }),
  ]},
]
