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

  { id: 'bus', eyebrow: 'バス', timeoutMs: 12000, actions: [
    action('stand', '席を立った', '高齢の人が、会釈して座った。', { awareness: 15, kindness: 17, assertiveness: 8 }),
    action('invite', '席を指して「どうぞ」と合図した', 'その人が、ゆっくり腰かけた。', { awareness: 16, kindness: 16, assertiveness: 5 }),
    action('wait', 'そのまま座っていた', 'バスは、次の停留所へ向かった。', { nerve: 10, hesitation: 6 }),
  ]},
  { id: 'cafe', eyebrow: 'カフェ', timeoutMs: 12000, actions: [
    action('move-bag', '隣の椅子からバッグをどけた', '空いた椅子に、その人が腰かけた。', { awareness: 15, kindness: 13 }),
    action('invite', '席を使うよう声をかけた', '小さく会釈が返ってきた。', { kindness: 15, assertiveness: 9 }),
    action('wait', 'バッグを置いたままにした', 'その人は、別の席を探しに歩いた。', { nerve: 9, hesitation: 6 }),
  ]},
  { id: 'snack', eyebrow: '休憩室', timeoutMs: 12000, actions: [
    action('take', '最後のお菓子を取った', '一瞬だけ、視線が集まった。', { assertiveness: 16, nerve: 14 }),
    action('offer', '最後のお菓子を誰かに勧めた', '「じゃあ」と、小さな手が伸びた。', { awareness: 11, kindness: 16 }),
    action('wait', '最後のお菓子を見ながら待った', '誰も手を伸ばさない時間が続いた。', { hesitation: 12, awareness: 7 }),
  ]},
  { id: 'rain', eyebrow: '雨宿り', timeoutMs: 12000, actions: [
    action('share', '傘に入るよう少し寄った', '二人ぶんの幅が、なんとかできた。', { awareness: 15, kindness: 15 }),
    action('lend', '傘を渡した', '相手が驚いて、何度も会釈した。', { kindness: 17, assertiveness: 5 }),
    action('wait', '雨脚を見ながら待った', '雨は、まだしばらく強そうだった。', { nerve: 10, hesitation: 6 }),
  ]},
  { id: 'photo', eyebrow: '集合写真', timeoutMs: 12000, actions: [
    action('shutter', 'そのままシャッターを切った', '三人の笑顔が、そのまま残った。', { assertiveness: 9, nerve: 8 }),
    action('timer', 'タイマーにして撮り直した', '少し慌てながら、全員で収まった。', { awareness: 12, kindness: 6, assertiveness: 6 }),
    action('wait', '構図を迷っているうちに待たせた', '笑顔が、ほんの少しだけ固くなった。', { hesitation: 11, awareness: 5 }),
  ]},
  { id: 'printer', eyebrow: '複合機', timeoutMs: 11000, actions: [
    action('hand', '印刷物を同僚に渡した', '相手が、そのまま受け取った。', { awareness: 15, kindness: 12 }),
    action('leave', '取り出し口にそっと置いた', '相手が近づき、自分で手に取った。', { awareness: 9, hesitation: 4 }),
    action('wait', '印刷物を持ったまま様子を見た', '一瞬だけ、二人とも止まった。', { hesitation: 9, awareness: 4 }),
  ]},
  { id: 'bill', eyebrow: '会計', timeoutMs: 13000, actions: [
    action('split', '割り勘にしようと声をかけた', '全員が、少しだけほっとした顔をした。', { assertiveness: 13, awareness: 9 }),
    action('pay', 'まとめて払うと手を伸ばした', '「あとで送るね」と声が重なった。', { kindness: 12, assertiveness: 12, nerve: 7 }),
    action('wait', '誰かが動くのを待った', '伝票だけが、テーブルの真ん中に残った。', { hesitation: 13, awareness: 5 }),
  ]},
  { id: 'door', eyebrow: '入口', timeoutMs: 10000, actions: [
    action('hold', 'ドアをそのまま押さえた', '荷物を抱えた人が、頭を下げて通った。', { awareness: 13, kindness: 15 }),
    action('release', '先に手を離した', '相手が、荷物を抱え直してドアに手を伸ばした。', { assertiveness: 8, nerve: 13 }),
    action('wait', '手を添えたまま様子を見た', '距離が少しずつ縮まった。', { hesitation: 8, kindness: 4 }),
  ]},
  { id: 'checkout', eyebrow: 'レジ', timeoutMs: 12000, actions: [
    action('yield', '後ろの人に先を譲った', '飲み物ひとつの人が、少し驚いて前に出た。', { awareness: 15, kindness: 16 }),
    action('proceed', 'そのまま会計を進めた', 'レジの読み取り音が続いた。', { assertiveness: 10, nerve: 9 }),
    action('wait', 'どうするか迷って、そのまま立っていた', '列が、少しだけ詰まった。', { hesitation: 9, awareness: 5 }),
  ]},
  { id: 'pantry', eyebrow: '給湯室', timeoutMs: 11000, actions: [
    action('yield', 'いったん場所を空けた', '同僚がマグを持って前に出た。', { awareness: 14, kindness: 13 }),
    action('continue', '先に自分の用事を済ませた', '同僚は、少し離れて待っていた。', { assertiveness: 11, nerve: 8 }),
    action('wait', '手を止めて相手の様子を見た', '二人とも、次の一歩を待った。', { hesitation: 9, awareness: 5 }),
  ]},

  { id: 'ending', eyebrow: '帰り際', timeoutMs: 14000, actions: [
    action('trash', '紙くずを拾ってから終了した', '床の端が、すっきりした。', { awareness: 18, kindness: 15 }),
    action('finish', 'そのまま終了した', '画面が、ゆっくり暗くなった。', { assertiveness: 5, nerve: 10 }),
    action('wait', '少しだけ、その場に残った', '「お疲れさま」が、まだ残っている。', { hesitation: 8, awareness: 3 }),
  ]},
]
