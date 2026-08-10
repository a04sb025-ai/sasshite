type Props = { sceneId: string; acted: string | null; onAction: (id: string) => void }

function Person({ pose = 'standing', shirt = 'sage', label }: { pose?: 'standing' | 'sitting' | 'running' | 'looking'; shirt?: string; label?: string }) {
  return <div className={`character ${pose}`} aria-hidden="true">
    <span className="hair" /><span className="head"><i className="eye" /><i className="nose" /><i className="mouth" /><i className="ear" /></span>
    <span className={`body ${shirt}`} /><span className="arm arm-left" /><span className="arm arm-right" />
    <span className="leg leg-left"><i /></span><span className="leg leg-right"><i /></span>{label && <small>{label}</small>}
  </div>
}

function Bag({ moved, onClick }: { moved: boolean; onClick: () => void }) {
  return <button className={`bag tap-object ${moved ? 'moved' : ''}`} onClick={onClick} aria-label="隣の席に置かれたバッグ">
    <span className="bag-strap" /><span className="bag-handle" /><span className="bag-body"><i /><b /></span>
  </button>
}

function Microphone() {
  return <span className="microphone-icon" aria-hidden="true"><i /><b /></span>
}

export function SceneArtwork({ sceneId, acted, onAction }: Props) {
  if (sceneId === 'train') return <section className="art train" aria-label="電車内。自分の隣の座席をバッグがふさぎ、乗客が近づいている">
    <div className="train-ceiling"><span className="rail" />{[1, 2, 3].map(item => <span className="strap" key={item}><i /></span>)}</div>
    <div className="train-wall"><div className="train-window"><span className="landscape" /><i>優先席</i></div><span className="route-map">●━●━●━●</span></div>
    <div className="train-floor" />
    <div className="bench"><span className="seat-back back-one" /><span className="seat-back back-two" /><span className="seat-back back-three" /><div className="self"><Person pose="sitting" shirt="rust" label="自分" /></div><Bag moved={acted === 'move-bag'} onClick={() => onAction('move-bag')} /></div>
    <div className="approaching-person"><Person pose="standing" shirt="blue" /><span className="look-mark">…</span></div>
  </section>

  if (sceneId === 'elevator') return <section className="art elevator" aria-label="閉まりかけたエレベーターへ、離れた場所から人が走ってくる">
    <div className="hallway-sign">ELEVATOR</div><div className="elevator-sign">▲　3F</div>
    <div className={`elevator-doors ${acted === 'open' ? 'opened' : acted === 'close' ? 'closed' : ''}`}><span className="door left" /><span className="door right" /><span className="door-gap" /></div>
    <div className="running-person"><Person pose="running" shirt="blue" /><span className="motion-lines"><i /><i /><i /></span><span className="hurry-mark">!</span></div>
    <div className="button-panel" aria-label="エレベーター操作ボタン">
      <button className={acted === 'open' ? 'selected' : ''} onClick={() => onAction('open')} aria-label="開ボタン"><span>◁　▷</span><b>開</b></button>
      <button className={acted === 'close' ? 'selected' : ''} onClick={() => onAction('close')} aria-label="閉ボタン"><span>▷　◁</span><b>閉</b></button>
    </div>
  </section>

  if (sceneId === 'karaage') return <section className="art karaage-scene" aria-label="4人で囲む食卓。手前が自分。中央の大皿には唐揚げが1個だけ残っている">
    <div className="dining-room"><span className="lamp" /><span className="picture-frame">食事中</span></div>
    <div className="diner diner-back"><Person pose="looking" shirt="blue" /></div><div className="diner diner-left"><Person pose="looking" shirt="sage" /></div><div className="diner diner-right"><Person pose="looking" shirt="rust" /></div>
    <div className="perspective-table"><span className="empty-plate plate-one"><i /></span><span className="empty-plate plate-two"><i /></span><span className="empty-plate plate-three"><i /></span><span className="self-plate"><i /></span>
      <div className="serving-plate"><button className={`karaage tap-object ${acted === 'eat' ? 'eaten' : ''}`} onClick={() => onAction('eat')} aria-label="大皿に残った最後の唐揚げ"><i /><b /><em /></button><small>最後のひとつ</small></div>
    </div>
    <div className="self-view"><span className="self-arm left" /><span className="self-arm right" /><b>自分</b></div>
  </section>

  if (sceneId === 'meeting') return <section className="art meeting" aria-label="4人が参加しているオンライン会議">
    <div className="laptop-bar"><i /><span>チーム ミーティング　<span className="live-dot">● 接続中</span></span><b>09:42　•••</b></div>
    <div className="call-grid">{['田中', '佐藤', 'あなた', '鈴木'].map((name, index) => <div className={name === 'あなた' ? 'me' : ''} key={name}><Person pose="standing" shirt={['blue', 'sage', 'rust', 'cream'][index]} /><span>{name}</span></div>)}</div>
    <p className="meeting-caption">誰か意見ありますか？</p>
    <div className="call-toolbar"><span className="camera-control" aria-hidden="true">▣<small>カメラ</small></span><button className={`mic-button ${acted === 'speak' ? 'active' : ''}`} onClick={() => onAction('speak')} aria-label={`マイク ${acted === 'speak' ? 'オン' : 'オフ'}`}><Microphone /><span>マイク {acted === 'speak' ? 'ON' : 'OFF'}</span></button><span className="hangup-control" aria-hidden="true">☎<small>退出</small></span></div>
  </section>

  return <section className="art final-scene" aria-label="お疲れさまでした。画面の端に小さな紙くずが落ちている">
    <div className="ending-card"><span className="check-mark">✓</span><h2>お疲れさまでした。</h2><button className="finish-button" onClick={() => onAction('finish')}>終了</button></div>
    <div className="floor-line" /><button className={`paper-trash ${acted === 'trash' ? 'picked' : ''}`} onClick={() => onAction('trash')} aria-label="床に落ちた丸められた紙くず"><span><i /><b /><em /></span><small>紙</small></button>
  </section>
}
