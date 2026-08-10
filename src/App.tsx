import { useState } from 'react'
import { GameScene } from './components/GameScene'
import { scenes } from './data/scenes'
import { applyChoice, diagnose, initialScores } from './game/scoring'
import type { Choice, Scores } from './types'

type Screen = 'title' | 'guide' | 'game' | 'result'
const labels: Record<keyof Scores, string> = { awareness: '察知力', kindness: '気遣い', assertiveness: '主張力', nerve: '鋼メンタル' }

export default function App() {
  const [screen, setScreen] = useState<Screen>('title')
  const [index, setIndex] = useState(0)
  const [scores, setScores] = useState(initialScores)
  const start = () => {
    setScores(initialScores)
    setIndex(0)
    setScreen(window.localStorage.getItem('sasshite-guide-seen') ? 'game' : 'guide')
  }
  const closeGuide = () => {
    window.localStorage.setItem('sasshite-guide-seen', 'true')
    setScreen('game')
  }
  const complete = (choice: Choice) => {
    setScores(current => applyChoice(current, choice))
    if (index === scenes.length - 1) setScreen('result')
    else setIndex(current => current + 1)
  }
  if (screen === 'title') return <main className="title-screen"><div><h1>察して。</h1><p>空気を読んでください。</p><button className="text-button" onClick={start}>はじめる</button></div><small>Ver. 0.2</small></main>
  if (screen === 'guide') return <main className="guide-screen"><div role="dialog" aria-labelledby="guide-title"><p id="guide-title">気になるものを<br />タップしてください。</p><p>何もしないのも答えです。</p><button className="text-button" onClick={closeGuide}>わかりました</button></div></main>
  if (screen === 'game') return <GameScene key={scenes[index].id} scene={scenes[index]} number={index + 1} total={scenes.length} onComplete={complete} />
  const result = diagnose(scores)
  return <main className="result-screen"><p>あなたは</p><h1>「{result.title}」</h1><p className="comment">{result.comment}</p><dl>{Object.entries(labels).map(([key, label]) => <div key={key}><dt>{label}</dt><dd><span><i style={{ width: `${scores[key as keyof Scores]}%` }} /></span><b>{scores[key as keyof Scores]}</b></dd></div>)}</dl><button className="text-button" onClick={start}>もう一度遊ぶ</button></main>
}
