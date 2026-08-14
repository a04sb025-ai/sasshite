import { useState } from 'react'
import { GameScene } from './components/GameScene'
import { Player } from './components/SceneArtwork'
import { scenes } from './data/scenes'
import { ageModes, getAgeMode } from './data/ageModes'
import { applyAction, diagnose, initialScores } from './game/scoring'
import { createSceneOrder } from './game/sceneOrder'
import type { Action, AgeModeId, GameRecord, Scores } from './types'

type Screen = 'title' | 'game' | 'result'

export default function App() {
  const [screen, setScreen] = useState<Screen>('title')
  const [index, setIndex] = useState(0)
  const [scores, setScores] = useState<Scores>(initialScores)
  const [records, setRecords] = useState<GameRecord[]>([])
  const [playScenes, setPlayScenes] = useState(scenes)
  const [ageModeId, setAgeModeId] = useState<AgeModeId>('working-adult')
  const start = () => {
    const source = [...getAgeMode(ageModeId).scenes]
    setPlayScenes(current => createSceneOrder(source, screen === 'result' ? current.map(scene => scene.id) : []))
    setScores(initialScores)
    setRecords([])
    setIndex(0)
    setScreen('game')
  }
  const complete = (action: Action) => {
    setScores(current => applyAction(current, action))
    setRecords(current => [...current, { scene: playScenes[index].eyebrow, action: action.history }])
    if (index === playScenes.length - 1) setScreen('result')
    else setIndex(current => current + 1)
  }

  if (screen === 'title') return <main className="title-screen">
    <div className="title-character"><Player /></div>
    <div><p className="version">Ver. 0.6</p><h1>察して。</h1><p className="tagline">空気を読んでください。</p><p className="player-note">このオレンジの人が、あなたです。</p>
      <fieldset className="age-mode-picker"><legend>年代をえらぶ</legend>{ageModes.map(mode => <button
        type="button"
        key={mode.id}
        disabled={mode.status === 'development'}
        aria-pressed={ageModeId === mode.id}
        onClick={() => setAgeModeId(mode.id)}
      >{mode.label}<small>{mode.status === 'development' ? '開発中' : `${mode.scenes.length}場面`}</small></button>)}</fieldset>
      <button className="text-button" onClick={start}>はじめる</button></div>
  </main>
  if (screen === 'game') return <GameScene key={playScenes[index].id} scene={playScenes[index]} number={index + 1} total={playScenes.length} onComplete={complete} />

  const result = ageModeId === 'kindergarten'
    ? { title: 'きょうの えらびかた', comment: 'みたり、うごいたり、まったり。どれも きみが えらんだこと。' }
    : diagnose(scores)
  return <main className="result-screen">
    <p>あなたの察し方は</p><h1>「{result.title}」</h1><p className="comment">{result.comment}</p>
    <section className="history" aria-labelledby="history-title"><h2 id="history-title">あのとき、あなたは</h2><ol>{records.map(record => <li key={record.scene}><span>{record.scene}</span><p>{record.action}</p></li>)}</ol></section>
    <p className="result-mode">{getAgeMode(ageModeId).label}・{playScenes.length}場面のサンプル</p>
    <button className="text-button" onClick={start}>{playScenes.length > 2 ? '順番を変えてもう一度' : 'もう一度'}</button>
  </main>
}
