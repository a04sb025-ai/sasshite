import { useState } from 'react'
import '../../train-svg-prototype.css'

export type TrainPrototypeState = 'BEFORE' | 'AFTER_LAP' | 'AFTER_FLOOR'

const states: TrainPrototypeState[] = ['BEFORE', 'AFTER_LAP', 'AFTER_FLOOR']

function TrainBackground() {
  return <g id="train-background" className="train-svg__background">
    <rect width="1024" height="1536" fill="#f4ead6" />
    <path d="M0 1190H1024V1536H0Z" fill="#d9cbb1" />
    <path d="M0 1190H1024" stroke="#8d8578" strokeWidth="10" />
    <path d="M0 1390H1024" stroke="#c0ad82" strokeWidth="8" />

    <g id="train-window">
      <rect x="52" y="250" width="592" height="510" rx="54" fill="#d8d0c1" stroke="#5d5c56" strokeWidth="12" />
      <rect x="78" y="276" width="540" height="458" rx="38" fill="#d9eff1" stroke="#f9f4e9" strokeWidth="13" />
      <path d="M79 606C190 550 266 620 354 566C444 510 528 579 617 524V734H79Z" fill="#bed2bd" opacity=".75" />
    </g>
    <g id="train-door">
      <path d="M706 1190V240Q706 186 760 186H1024" fill="none" stroke="#74736d" strokeWidth="18" />
      <path d="M746 1190V276Q746 228 794 228H1024" fill="none" stroke="#fff9eb" strokeWidth="13" />
      <rect x="800" y="340" width="150" height="390" rx="54" fill="#d9eff1" stroke="#686964" strokeWidth="12" />
      <path d="M985 230V1190" stroke="#77756d" strokeWidth="10" />
    </g>
    <g id="train-handrail" fill="none" strokeLinecap="round">
      <path d="M0 150H652Q690 150 690 188V1190" stroke="#666661" strokeWidth="28" />
      <path d="M0 144H642Q673 144 673 177V1190" stroke="#d8d5cd" strokeWidth="12" />
    </g>
    <g id="train-straps" stroke="#5f5b52" strokeWidth="8">
      {[164, 396, 584].map((x) => <g key={x} transform={`translate(${x} 0)`}>
        <path d="M-16 146V254H16V146" fill="#d5bd8f" />
        <ellipse cx="0" cy="316" rx="48" ry="58" fill="#f7edda" />
        <ellipse cx="0" cy="316" rx="28" ry="36" fill="#f4ead6" strokeWidth="5" />
      </g>)}
    </g>
    <g id="train-bench">
      <rect x="0" y="774" width="683" height="318" rx="38" fill="#396fae" stroke="#334d69" strokeWidth="12" />
      <path d="M14 927H669" stroke="#2d5e97" strokeWidth="10" />
      <path d="M220 786V1080M452 786V1080" stroke="#2d5e97" strokeWidth="9" />
      <path d="M21 1087H660L624 1205H0Z" fill="#b9b2a6" stroke="#6d6a63" strokeWidth="10" />
      <path d="M280 1160H480" stroke="#77736b" strokeWidth="12" strokeDasharray="32 15" />
    </g>
  </g>
}

function Face({ prefix }: { prefix: string }) {
  return <g id={`${prefix}-head`}>
    <circle cx="0" cy="0" r="92" fill="#f3c58f" stroke="#493b31" strokeWidth="8" />
    <g id={`${prefix}-hair`} fill="#493b31">
      <path d="M-89-13Q-98-92-14-104Q70-111 92-33Q60-58 34-70Q6-29-21-51Q-48-18-89-13Z" />
      <path d="M-12-99Q-4-126 18-133Q8-108 30-101Z" />
    </g>
    <g id={`${prefix}-face`} fill="#40352e">
      <ellipse cx="-30" cy="8" rx="8" ry="13" /><ellipse cx="31" cy="8" rx="8" ry="13" />
      <path d="M-8 42Q0 47 9 42" fill="none" stroke="#40352e" strokeWidth="6" strokeLinecap="round" />
    </g>
  </g>
}

function Player() {
  return <g id="player" transform="translate(258 720)">
    <g id="player-body">
      <path d="M-89 184Q-105 91-74 60Q0 29 74 60Q105 91 91 187Z" fill="#dc762f" stroke="#493b31" strokeWidth="9" />
      <path d="M-31 64H31L45 181H-45Z" fill="#fff0d1" stroke="#b98b59" strokeWidth="5" />
    </g>
    <g id="player-left-arm" transform="rotate(10 -71 94)"><rect x="-108" y="71" width="47" height="147" rx="23" fill="#dc762f" stroke="#493b31" strokeWidth="8" /><circle cx="-81" cy="213" r="25" fill="#f3c58f" stroke="#493b31" strokeWidth="8" /></g>
    <g id="player-right-arm" transform="rotate(-8 71 94)"><rect x="61" y="71" width="47" height="147" rx="23" fill="#dc762f" stroke="#493b31" strokeWidth="8" /><circle cx="81" cy="213" r="25" fill="#f3c58f" stroke="#493b31" strokeWidth="8" /></g>
    <g id="player-left-leg"><path d="M-64 184H-4L-31 292H-117Z" fill="#263650" stroke="#3c3936" strokeWidth="9" /><path d="M-117 292H-29V336H-126Q-143 317-117 292Z" fill="#f5f0e4" stroke="#55504a" strokeWidth="8" /></g>
    <g id="player-right-leg"><path d="M4 184H64L117 292H31Z" fill="#263650" stroke="#3c3936" strokeWidth="9" /><path d="M31 292H117Q143 317 126 336H29Z" fill="#f5f0e4" stroke="#55504a" strokeWidth="8" /></g>
    <g transform="translate(0 0)"><Face prefix="player" /></g>
  </g>
}

function Npc({ pose }: { pose: 'standing' | 'seated' }) {
  const seated = pose === 'seated'
  return <g id="npc" className={`train-svg__npc train-svg__npc--${pose}`} transform={seated ? 'translate(520 728)' : 'translate(806 604)'}>
    <g id="npc-body">
      <path d="M-78 178Q-92 80-59 56Q0 28 59 56Q91 80 79 180Z" fill="#a8afa8" stroke="#493b31" strokeWidth="9" />
      <path d="M-25 58H25L37 178H-37Z" fill="#f5ebd5" />
    </g>
    <g id="npc-left-arm" transform={seated ? 'rotate(-58 -67 88)' : 'rotate(7 -67 88)'}><rect x="-99" y="66" width="43" height="145" rx="21" fill="#a8afa8" stroke="#493b31" strokeWidth="8" /><circle cx="-76" cy="205" r="22" fill="#e6b783" stroke="#493b31" strokeWidth="8" /></g>
    <g id="npc-right-arm" transform={seated ? 'rotate(53 67 88)' : 'rotate(-6 67 88)'}><rect x="56" y="66" width="43" height="145" rx="21" fill="#a8afa8" stroke="#493b31" strokeWidth="8" /><circle cx="76" cy="205" r="22" fill="#e6b783" stroke="#493b31" strokeWidth="8" /></g>
    <g id="npc-left-leg" transform={seated ? 'rotate(72 -28 178)' : undefined}><rect x="-65" y="172" width="55" height="210" rx="24" fill="#465264" stroke="#3e3c3a" strokeWidth="9" /><path d="M-67 355H-8V402H-79Q-102 380-67 355Z" fill="#57493d" stroke="#3e3c3a" strokeWidth="8" /></g>
    <g id="npc-right-leg" transform={seated ? 'rotate(-72 28 178)' : undefined}><rect x="10" y="172" width="55" height="210" rx="24" fill="#465264" stroke="#3e3c3a" strokeWidth="9" /><path d="M8 355H67Q102 380 79 402H8Z" fill="#57493d" stroke="#3e3c3a" strokeWidth="8" /></g>
    <g transform="translate(0 0)"><Face prefix="npc" /></g>
  </g>
}

function Bag({ state }: { state: TrainPrototypeState }) {
  const transform = state === 'BEFORE' ? 'translate(506 915) scale(1)' : state === 'AFTER_LAP' ? 'translate(258 864) scale(.82)' : 'translate(520 1287) scale(1)'
  return <g id="bag" className="train-svg__bag" transform={transform} role="img" aria-label={state === 'BEFORE' ? '隣席のバッグ' : state === 'AFTER_LAP' ? 'プレイヤーの膝上のバッグ' : '床のバッグ'}>
    <path id="bag-handle" d="M-55-42Q-50-104 0-104Q50-104 55-42" fill="none" stroke="#65442d" strokeWidth="18" />
    <rect id="bag-body" x="-108" y="-50" width="216" height="142" rx="35" fill="#93613b" stroke="#493727" strokeWidth="9" />
    <path id="bag-flap" d="M-96-35H96V35Q0 77-96 35Z" fill="#a97245" stroke="#493727" strokeWidth="7" />
    <rect id="bag-buckle" x="-17" y="24" width="34" height="42" rx="7" fill="#d0a260" stroke="#493727" strokeWidth="7" />
  </g>
}

export function TrainSvgPrototype() {
  const [state, setState] = useState<TrainPrototypeState>('BEFORE')
  const npcPose = state === 'BEFORE' ? 'standing' : 'seated'

  return <main className="train-svg-prototype">
    <header className="train-svg-prototype__header"><span>DEVELOPMENT PROTOTYPE</span><strong>{state.replace('_', ' ')}</strong></header>
    <svg className="train-svg" viewBox="0 0 1024 1536" role="img" aria-labelledby="train-prototype-title train-prototype-description">
      <title id="train-prototype-title">電車ステージ SVG シーングラフ試作</title>
      <desc id="train-prototype-description">青い座席の電車内でプレイヤーが座り、乗客とバッグの位置が状態に応じて変わる</desc>
      <TrainBackground />
      <Player />
      <Npc pose={npcPose} />
      <Bag state={state} />
    </svg>
    <nav className="train-svg-prototype__controls" aria-label="プロトタイプ状態切り替え">
      {states.map(value => <button type="button" key={value} aria-pressed={state === value} onClick={() => setState(value)}>{value.replace('_', ' ')}</button>)}
    </nav>
  </main>
}
