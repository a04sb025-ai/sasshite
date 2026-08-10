import { useState } from 'react'
import { GameScene } from './components/GameScene'
import { Player } from './components/SceneArtwork'
import { scenes } from './data/scenes'
import { applyAction, diagnose, initialScores } from './game/scoring'
import type { Action, GameRecord, Scores } from './types'

type Screen = 'title' | 'game' | 'result'

export default function App() {
  const [screen, setScreen] = useState<Screen>('title')
  const [index, setIndex] = useState(0)
  const [scores, setScores] = useState<Scores>(initialScores)
  const [records, setRecords] = useState<GameRecord[]>([])
  const start = () => { setScores(initialScores); setRecords([]); setIndex(0); setScreen('game') }
  const complete = (action: Action) => {
    setScores(current => applyAction(current, action))
    setRecords(current => [...current, { scene: scenes[index].eyebrow, action: action.history }])
    if (index === scenes.length - 1) setScreen('result')
    else setIndex(current => current + 1)
  }

  if (screen === 'title') return <main className="title-screen">
    <div className="title-character"><Player /></div>
    <div><p className="version">Ver. 0.6</p><h1>察して。</h1><p className="tagline">空気を読んでください。</p><p className="player-note">このオレンジの人が、あなたです。</p><button className="text-button" onClick={start}>はじめる</button></div>
  </main>
  if (screen === 'game') return <GameScene key={scenes[index].id} scene={scenes[index]} number={index + 1} total={scenes.length} onComplete={complete} />

  const result = diagnose(scores)
  return <main className="result-screen">
    <p>あなたの察し方は</p><h1>「{result.title}」</h1><p className="comment">{result.comment}</p>
    <section className="history" aria-labelledby="history-title"><h2 id="history-title">あのとき、あなたは</h2><ol>{records.map(record => <li key={record.scene}><span>{record.scene}</span><p>{record.action}</p></li>)}</ol></section>
    <button className="text-button" onClick={start}>もう一度</button>
  </main>
}
