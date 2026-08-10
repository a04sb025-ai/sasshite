type Props = { sceneId: string; acted: string | null; onAction: (id: string) => void }

const Person = ({ running = false }: { running?: boolean }) => <span className={`person ${running ? 'running' : ''}`} aria-hidden="true"><i /><b /></span>

export function SceneArtwork({ sceneId, acted, onAction }: Props) {
  if (sceneId === 'train') return <div className="art train" aria-label="電車の座席。隣の席にバッグがあり、人が近づいてくる">
    <div className="window"><span /><span /><span /></div><div className="visitor"><Person /></div>
    <div className="seats"><span className="you">自分</span><button className={`bag ${acted ? 'moved' : ''}`} onClick={() => onAction('move-bag')} aria-label="隣の席のバッグ">▰</button></div>
  </div>
  if (sceneId === 'elevator') return <div className="art elevator" aria-label="閉まりかけのエレベーターへ人が走ってくる">
    <div className={`doors ${acted === 'open' ? 'opened' : acted === 'close' ? 'closed' : ''}`}><span /><span /></div><div className="runner"><Person running /></div>
    <div className="lift-buttons"><button onClick={() => onAction('open')} aria-label="開く">◁ ▷</button><button onClick={() => onAction('close')} aria-label="閉じる">▷ ◁</button></div>
  </div>
  if (sceneId === 'karaage') return <div className="art table-scene" aria-label="4人で囲むテーブル。唐揚げが1個残っている">
    <div className="heads">{[1,2,3,4].map(n => <i key={n} />)}</div><div className="table"><button className={`karaage ${acted ? 'eaten' : ''}`} onClick={() => onAction('eat')} aria-label="最後の唐揚げ">●</button></div>
  </div>
  if (sceneId === 'meeting') return <div className="art meeting" aria-label="オンライン会議の画面">
    <div className="call-grid">{[1,2,3,4].map(n => <div key={n}><Person /></div>)}</div><p>「誰か意見ありますか？」</p>
    <button className={`mic ${acted ? 'active' : ''}`} onClick={() => onAction('speak')} aria-label="マイクをオンにする">♩<span>{acted ? 'ON' : 'OFF'}</span></button>
  </div>
  return <div className="art final-scene" aria-label="お疲れさまでした。画面の端に小さな紙くずがある">
    <div><h2>お疲れさまでした。</h2><button className="finish" onClick={() => onAction('finish')}>終了</button></div>
    {!acted && <button className="trash" onClick={() => onAction('trash')} aria-label="小さな紙くず">⌁</button>}
  </div>
}
