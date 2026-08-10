type Props = { sceneId: string; acted: string | null; onAction: (id: string) => void }

function Person({ pose = 'standing', shirt = 'sage', label }: { pose?: 'standing' | 'sitting' | 'running' | 'looking'; shirt?: string; label?: string }) {
  return <div className={`character ${pose}`} aria-hidden="true">
    <span className="hair" /><span className="head"><i className="eye" /><i className="nose" /></span>
    <span className={`body ${shirt}`} /><span className="arm arm-left" /><span className="arm arm-right" />
    <span className="leg leg-left" /><span className="leg leg-right" />{label && <small>{label}</small>}
  </div>
}

function Bag({ moved, onClick }: { moved: boolean; onClick: () => void }) {
  return <button className={`bag tap-object ${moved ? 'moved' : ''}`} onClick={onClick} aria-label="隣の席に置かれたバッグ">
    <span className="bag-handle" /><span className="bag-body"><i /></span>
  </button>
}

function Microphone() {
  return <span className="microphone-icon" aria-hidden="true"><i /><b /></span>
}

export function SceneArtwork({ sceneId, acted, onAction }: Props) {
  if (sceneId === 'train') return <section className="art train" aria-label="電車内。自分の隣の座席をバッグがふさぎ、乗客が近づいている">
    <div className="train-ceiling"><span className="rail" />{[1, 2, 3].map(item => <span className="strap" key={item}><i /></span>)}</div>
    <div className="train-window"><span className="landscape" /><i>車 内</i></div>
    <div className="train-floor" />
    <div className="bench"><span className="seat-line" /><div className="self"><Person pose="sitting" shirt="rust" label="自分" /></div><Bag moved={acted === 'move-bag'} onClick={() => onAction('move-bag')} /></div>
    <div className="approaching-person"><Person pose="standing" shirt="blue" /><span className="look-mark">…</span></div>
  </section>

  if (sceneId === 'elevator') return <section className="art elevator" aria-label="閉まりかけたエレベーターへ、離れた場所から人が走ってくる">
    <div className="elevator-sign">▲　3</div>
    <div className={`elevator-doors ${acted === 'open' ? 'opened' : acted === 'close' ? 'closed' : ''}`}><span className="door left" /><span className="door right" /><span className="door-gap" /></div>
    <div className="running-person"><Person pose="running" shirt="blue" /><span className="motion-lines">〰</span></div>
    <div className="button-panel" aria-label="エレベーター操作ボタン">
      <button className={acted === 'open' ? 'selected' : ''} onClick={() => onAction('open')} aria-label="開ボタン"><span>◁　▷</span><b>開</b></button>
      <button className={acted === 'close' ? 'selected' : ''} onClick={() => onAction('close')} aria-label="閉ボタン"><span>▷　◁</span><b>閉</b></button>
    </div>
  </section>

  if (sceneId === 'karaage') return <section className="art karaage-scene" aria-label="4人が囲むテーブル。中央の皿に唐揚げが1個だけ残っている">
    <div className="diner diner-top"><Person pose="looking" shirt="blue" /></div><div className="diner diner-left"><Person pose="looking" shirt="sage" /></div>
    <div className="diner diner-right"><Person pose="looking" shirt="rust" /></div><div className="diner diner-self"><Person pose="looking" shirt="cream" label="自分" /></div>
    <div className="round-table"><span className="empty-plate plate-one" /><span className="empty-plate plate-two" /><span className="empty-plate plate-three" /><span className="self-plate" />
      <div className="serving-plate"><button className={`karaage tap-object ${acted === 'eat' ? 'eaten' : ''}`} onClick={() => onAction('eat')} aria-label="皿に残った最後の唐揚げ"><i /><b /><em /></button><small>あとひとつ</small></div>
    </div>
  </section>

  if (sceneId === 'meeting') return <section className="art meeting" aria-label="4人が参加しているオンライン会議">
    <div className="laptop-bar"><i /><span>ミーティング</span><b>•••</b></div>
    <div className="call-grid">{['田中', '佐藤', 'あなた', '鈴木'].map((name, index) => <div className={name === 'あなた' ? 'me' : ''} key={name}><Person pose="standing" shirt={['blue', 'sage', 'rust', 'cream'][index]} /><span>{name}</span></div>)}</div>
    <p className="meeting-caption">誰か意見ありますか？</p>
    <button className={`mic-button ${acted === 'speak' ? 'active' : ''}`} onClick={() => onAction('speak')} aria-label={`マイク ${acted === 'speak' ? 'オン' : 'オフ'}`}><Microphone /><span>マイク {acted === 'speak' ? 'ON' : 'OFF'}</span></button>
  </section>

  return <section className="art final-scene" aria-label="お疲れさまでした。画面の端に小さな紙くずが落ちている">
    <div className="ending-card"><span className="check-mark">✓</span><h2>お疲れさまでした。</h2><button className="finish-button" onClick={() => onAction('finish')}>終了</button></div>
    <button className={`paper-trash ${acted === 'trash' ? 'picked' : ''}`} onClick={() => onAction('trash')} aria-label="床に落ちた小さな紙くず"><span><i /></span></button>
  </section>
}
