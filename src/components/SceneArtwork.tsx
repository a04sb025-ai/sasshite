type Props = { sceneId: string; acted: string | null }

type CharacterProps = {
  x: number
  y: number
  shirt: string
  hair?: string
  label?: string
  running?: boolean
  sitting?: boolean
  glasses?: boolean
  scale?: number
}

function Character({ x, y, shirt, hair = '#2e2b28', label, running = false, sitting = false, glasses = false, scale = 1 }: CharacterProps) {
  const legY = sitting ? 42 : 52
  return <g transform={`translate(${x} ${y}) scale(${scale})`} className={`scene-character ${running ? 'is-running' : ''}`}>
    <circle cx="0" cy="0" r="14" fill="#f0c3a2" stroke="#393531" strokeWidth="2" />
    <path d="M-14 -4 Q0 -22 15 -5 L12 -13 Q0 -20 -11 -12Z" fill={hair} />
    <circle cx="-4" cy="1" r="1.5" fill="#393531" /><circle cx="5" cy="1" r="1.5" fill="#393531" />
    {glasses && <><circle cx="-4" cy="1" r="5" fill="none" stroke="#393531" strokeWidth="1.5" /><circle cx="6" cy="1" r="5" fill="none" stroke="#393531" strokeWidth="1.5" /><path d="M1 1H2" stroke="#393531" /></>}
    <rect x="-15" y="16" width="30" height="36" rx="10" fill={shirt} stroke="#393531" strokeWidth="2" />
    <path d={running ? 'M-10 27 L-30 38 M11 28 L28 18' : 'M-12 27 L-24 43 M12 27 L24 43'} stroke="#393531" strokeWidth="6" strokeLinecap="round" />
    <path d={sitting ? 'M-8 52 L-17 70 M8 52 L25 61' : running ? `M-7 ${legY} L-28 73 M8 ${legY} L28 69` : `M-8 ${legY} L-11 78 M8 ${legY} L12 78`} stroke="#393531" strokeWidth="7" strokeLinecap="round" />
    {!sitting && <><path d="M-19 78h13" stroke="#f7f3e9" strokeWidth="7" strokeLinecap="round" /><path d="M7 78h13" stroke="#f7f3e9" strokeWidth="7" strokeLinecap="round" /></>}
    {label && <g transform="translate(-28 88)"><rect width="56" height="22" rx="11" fill="#fffdf7" stroke="#c7c0b1" /><text x="28" y="15" textAnchor="middle" fontSize="11" fill="#4c4842">{label}</text></g>}
  </g>
}

function TrainScene({ acted }: { acted: string | null }) {
  const moved = acted === 'move-bag'
  return <svg viewBox="0 0 360 420" role="img" aria-label="電車。あなたの隣の席をバッグがふさぎ、その前に立っている人がいる。">
    <rect width="360" height="420" fill="#f4efe3" />
    <rect x="0" y="0" width="360" height="85" fill="#e5e0d5" />
    <path d="M30 24H330" stroke="#55514b" strokeWidth="4" />
    {[78,180,282].map(x => <g key={x}><path d={`M${x} 24v26`} stroke="#55514b" strokeWidth="3" /><rect x={x-10} y="47" width="20" height="13" rx="6" fill="none" stroke="#55514b" strokeWidth="3" /></g>)}
    <rect x="27" y="98" width="205" height="90" rx="4" fill="#cbd8db" stroke="#55514b" strokeWidth="3" />
    <path d="M28 166 Q90 130 145 153 T232 138V188H28Z" fill="#9eb59a" />
    <rect x="250" y="105" width="82" height="35" rx="3" fill="#fffdf7" stroke="#9a9489" /><path d="M263 122h55" stroke="#719278" strokeWidth="3" strokeDasharray="8 5" />
    <rect x="22" y="245" width="270" height="112" rx="18" fill="#78947d" stroke="#48443f" strokeWidth="3" />
    <path d="M112 245v112M202 245v112" stroke="#586d5c" strokeWidth="2" />
    <Character x={67} y={259} shirt="#c66d4e" label="あなた" sitting />
    <g className={`train-bag ${moved ? 'is-moved' : ''}`} transform={moved ? 'translate(58 294) scale(.72)' : 'translate(157 286)'}>
      <rect width="66" height="52" rx="10" fill="#8a6248" stroke="#3e3833" strokeWidth="3" />
      <path d="M18 4 Q20 -16 33 -16 Q47 -16 49 4" fill="none" stroke="#3e3833" strokeWidth="5" />
      <rect x="16" y="22" width="34" height="20" rx="4" fill="#9f7457" stroke="#6e4d3a" />
    </g>
    <Character x={314} y={250} shirt="#607d91" scale={.95} />
    <g transform="translate(280 205)"><circle cx="0" cy="0" r="14" fill="#fffdf7" stroke="#b9b1a4" /><circle cx="-5" cy="1" r="1.6" fill="#777" /><circle cx="0" cy="1" r="1.6" fill="#777" /><circle cx="5" cy="1" r="1.6" fill="#777" /></g>
    {moved && <g className="tiny-reaction"><path d="M205 305q20-13 37 0" fill="none" stroke="#6f8a70" strokeWidth="3" strokeLinecap="round" /><circle cx="220" cy="289" r="3" fill="#6f8a70" /></g>}
  </svg>
}

function ElevatorScene({ acted }: { acted: string | null }) {
  const opening = acted === 'open'
  const closed = acted === 'close' || acted === 'wait'
  return <svg viewBox="0 0 360 420" role="img" aria-label="閉まりかけのエレベーター。あなたは操作盤の前にいて、別の人が走ってくる。">
    <rect width="360" height="420" fill="#e8e3d8" />
    <rect x="70" y="48" width="220" height="310" rx="4" fill="#b8b5ad" stroke="#4f4b46" strokeWidth="3" />
    <rect x="150" y="18" width="60" height="26" rx="5" fill="#47433f" /><text x="180" y="36" textAnchor="middle" fontSize="13" fill="#e9b167">▲ 3F</text>
    <rect x="79" y="57" width={opening ? 72 : closed ? 103 : 93} height="292" fill="#d6d2c9" stroke="#77716b" />
    <rect x={opening ? 209 : closed ? 180 : 190} y="57" width={opening ? 72 : closed ? 101 : 91} height="292" fill="#d6d2c9" stroke="#77716b" />
    <rect x="298" y="120" width="48" height="106" rx="8" fill="#c7c1b7" stroke="#5d5852" strokeWidth="3" />
    <circle cx="322" cy="150" r="17" fill={opening ? '#d8e4d5' : '#f6f2e9'} stroke="#5d5852" strokeWidth="2" /><text x="322" y="155" textAnchor="middle" fontSize="13">開</text>
    <circle cx="322" cy="195" r="17" fill="#f6f2e9" stroke="#5d5852" strokeWidth="2" /><text x="322" y="200" textAnchor="middle" fontSize="13">閉</text>
    <Character x={305} y={265} shirt="#c66d4e" label="あなた" scale={.78} />
    <Character x={36} y={273} shirt="#607d91" running scale={.88} />
    <path d="M7 282h24M4 298h22" stroke="#929087" strokeWidth="3" strokeLinecap="round" />
    {opening && <path d="M44 256 Q63 241 79 245" fill="none" stroke="#6f8a70" strokeWidth="3" strokeLinecap="round" />}
  </svg>
}

function KaraageScene({ acted }: { acted: string | null }) {
  const eaten = acted === 'eat'
  return <svg viewBox="0 0 360 420" role="img" aria-label="4人の食卓。中央の皿に最後の唐揚げがひとつ残っている。">
    <rect width="360" height="420" fill="#f0e8d8" />
    <circle cx="180" cy="218" r="145" fill="#b8895d" stroke="#5d4938" strokeWidth="4" />
    <Character x={63} y={102} shirt="#607d91" scale={.72} />
    <Character x={180} y={63} shirt="#ded4b9" scale={.72} />
    <Character x={298} y={107} shirt="#42484b" glasses scale={.72} />
    <g transform="translate(180 360)"><rect x="-30" y="-2" width="60" height="24" rx="12" fill="#fffdf7" stroke="#c7c0b1" /><text x="0" y="14" textAnchor="middle" fontSize="11" fill="#4c4842">あなた</text></g>
    <path d="M112 377 L139 329 M248 377 L221 329" stroke="#c66d4e" strokeWidth="20" strokeLinecap="round" />
    {[{x:85,y:220},{x:180,y:118},{x:275,y:220},{x:180,y:319}].map((p,i)=><ellipse key={i} cx={p.x} cy={p.y} rx="34" ry="18" fill="#fbf8ef" stroke="#8c8174" strokeWidth="2" />)}
    <ellipse cx="180" cy="220" rx="58" ry="41" fill="#fbf8ef" stroke="#8c8174" strokeWidth="3" />
    {!eaten && <g className="last-karaage"><path d="M162 222 Q165 199 182 197 Q205 198 206 221 Q198 241 178 241 Q164 238 162 222Z" fill="#a75a31" stroke="#683a25" strokeWidth="3" /><circle cx="177" cy="211" r="3" fill="#c37b4d" /><circle cx="193" cy="224" r="3" fill="#c37b4d" /></g>}
    {eaten && <g transform="translate(180 319)"><path d="M-12 0q4-14 15-12q14 2 14 15q-5 12-17 12q-11-2-12-15Z" fill="#a75a31" stroke="#683a25" strokeWidth="2" /></g>}
    {acted === 'ask' && <g transform="translate(126 297)"><path d="M0 0h84a12 12 0 0 1 12 12v20H0a12 12 0 0 1-12-12V12A12 12 0 0 1 0 0Z" fill="#fffdf7" stroke="#b9b1a4" /><text x="42" y="21" textAnchor="middle" fontSize="12" fill="#4c4842">誰か食べる？</text></g>}
  </svg>
}

function MeetingScene({ acted }: { acted: string | null }) {
  const speaking = acted === 'speak' || acted === 'pause-speak'
  return <svg viewBox="0 0 360 420" role="img" aria-label="4人のオンライン会議。意見を求められ、あなたのマイクはオフになっている。">
    <rect width="360" height="420" fill="#303639" />
    <rect x="18" y="20" width="324" height="30" rx="6" fill="#ece8de" /><circle cx="35" cy="35" r="5" fill="#c66d4e" /><text x="180" y="40" textAnchor="middle" fontSize="12" fill="#4c4842">ミーティング</text>
    {[[25,62,'#42484b',true],[187,62,'#ded4b9',false],[25,191,'#c66d4e',false],[187,191,'#607d91',false]].map(([x,y,shirt,glasses],i)=><g key={i}><rect x={Number(x)} y={Number(y)} width="148" height="116" rx="6" fill={i===2 && speaking ? '#d9e2d5' : '#bfc8c9'} stroke={i===2 ? '#dfaa5a' : '#596164'} strokeWidth={i===2 ? 4 : 2} /><Character x={Number(x)+74} y={Number(y)+37} shirt={String(shirt)} glasses={Boolean(glasses)} scale={.62} />{i===2 && <g><rect x={Number(x)+8} y={Number(y)+86} width="52" height="20" rx="10" fill="#fffdf7" /><text x={Number(x)+34} y={Number(y)+100} textAnchor="middle" fontSize="10">あなた</text></g>}</g>)}
    <rect x="48" y="319" width="264" height="42" rx="12" fill="#fffdf7" /><text x="180" y="345" textAnchor="middle" fontSize="14" fill="#444">ほかに意見ありますか？</text>
    <rect x="75" y="374" width="210" height="38" rx="18" fill="#202426" />
    <circle cx="180" cy="393" r="14" fill={speaking ? '#78947d' : '#eee9df'} />
    <path d="M180 385v12M175 392q0 7 5 7t5-7" stroke={speaking ? '#fff' : '#494641'} strokeWidth="2" fill="none" strokeLinecap="round" />
    {!speaking && <path d="M170 382l20 22" stroke="#b7584b" strokeWidth="3" />}
  </svg>
}

function EndingScene({ acted }: { acted: string | null }) {
  const picked = acted === 'trash'
  return <svg viewBox="0 0 360 420" role="img" aria-label="帰り際。出口の近くの床に小さな紙くずが落ちている。">
    <rect width="360" height="420" fill="#f1ede3" />
    <rect x="0" y="0" width="360" height="275" fill="#faf7ef" />
    <path d="M0 275H360" stroke="#9e978b" strokeWidth="3" />
    <rect x="115" y="80" width="130" height="76" rx="10" fill="#fffdf7" stroke="#a9a194" strokeWidth="2" />
    <path d="M163 117l13 13l25-31" fill="none" stroke="#78947d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <text x="180" y="190" textAnchor="middle" fontSize="18" fill="#4c4842">お疲れさまでした。</text>
    <rect x="137" y="214" width="86" height="38" rx="8" fill="#ece6dc" stroke="#6e6960" strokeWidth="2" /><text x="180" y="239" textAnchor="middle" fontSize="14">出口へ</text>
    <path d="M112 420l35-68M248 420l-35-68" stroke="#c66d4e" strokeWidth="22" strokeLinecap="round" />
    <path d="M129 416h31M200 416h31" stroke="#f7f3e9" strokeWidth="13" strokeLinecap="round" />
    {!picked && <g className="paper-trash" transform="translate(305 333)"><path d="M0 0l19 5l-4 22l-23-3l3-15Z" fill="#fffdf7" stroke="#8e887e" strokeWidth="2" /><path d="M-3 9l14 7M4 2l2 21" stroke="#b7b0a4" strokeWidth="1.5" /><ellipse cx="7" cy="31" rx="18" ry="5" fill="#c8c1b5" opacity=".55" /></g>}
    {picked && <g transform="translate(302 333)" className="tiny-reaction"><circle cx="0" cy="0" r="18" fill="#dbe6d8" /><path d="M-7 0l5 6l11-14" fill="none" stroke="#668064" strokeWidth="3" /></g>}
  </svg>
}

export function SceneArtwork({ sceneId, acted }: Props) {
  if (sceneId === 'train') return <div className="art"><TrainScene acted={acted} /></div>
  if (sceneId === 'elevator') return <div className="art"><ElevatorScene acted={acted} /></div>
  if (sceneId === 'karaage') return <div className="art"><KaraageScene acted={acted} /></div>
  if (sceneId === 'meeting') return <div className="art"><MeetingScene acted={acted} /></div>
  return <div className="art"><EndingScene acted={acted} /></div>
}
