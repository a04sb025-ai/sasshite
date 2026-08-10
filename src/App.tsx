import { useState } from 'react'
import { GameScene } from './components/GameScene'
import { scenes } from './data/scenes'
import { applyChoice, diagnose, initialScores } from './game/scoring'
import type { Choice, Scores } from './types'

type Screen = 'title' | 'game' | 'result'
type Answer = { scene: string; action: string }

const labels: Record<keyof Scores, string> = {
  awareness: '察知力',
  kindness: '気遣い',
  assertiveness: '主張力',
  nerve: '鋼メンタル',
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('title')
  const [index, setIndex] = useState(0)
  const [scores, setScores] = useState(initialScores)
  const [answers, setAnswers] = useState<Answer[]>([])

  const start = () => {
    setScores(initialScores)
    setAnswers([])
    setIndex(0)
    setScreen('game')
  }

  const complete = (choice: Choice) => {
    setScores(current => applyChoice(current, choice))
    setAnswers(current => [...current, { scene: scenes[index].eyebrow, action: choice.label }])
    if (index === scenes.length - 1) setScreen('result')
    else setIndex(current => current + 1)
  }

  if (screen === 'title') return <main className="title-screen">
    <div className="title-wrap">
      <p className="title-kicker">5つの場面。正解はありません。</p>
      <h1>察して。</h1>
      <p className="title-copy">あなたなら、どうする？</p>
      <div className="how-to-play" aria-label="遊び方">
        <div><b>1</b><span>状況を見る</span></div>
        <div><b>2</b><span>自分ならどうするか選ぶ</span></div>
        <div><b>3</b><span>最後に「察し方」が出る</span></div>
      </div>
      <p className="quiet-note">選ばずに待つのも、あなたの答えです。</p>
      <button className="start-button" onClick={start}>はじめる</button>
    </div>
    <small>Ver. 0.5</small>
  </main>

  if (screen === 'game') return <GameScene key={scenes[index].id} scene={scenes[index]} number={index + 1} total={scenes.length} onComplete={complete} />

  const result = diagnose(scores)
  return <main className="result-screen">
    <p className="result-kicker">あなたの察し方</p>
    <h1>「{result.title}」</h1>
    <p className="comment">{result.comment}</p>

    <dl>{Object.entries(labels).map(([key, label]) => <div key={key}>
      <dt>{label}</dt>
      <dd><span><i style={{ width: `${scores[key as keyof Scores]}%` }} /></span><b>{scores[key as keyof Scores]}</b></dd>
    </div>)}</dl>

    <section className="answer-recap">
      <h2>あなたはこう動いた</h2>
      {answers.map((answer, answerIndex) => <div key={`${answer.scene}-${answerIndex}`}><span>{answer.scene}</span><b>{answer.action}</b></div>)}
    </section>

    <button className="start-button replay" onClick={start}>もう一度</button>
  </main>
}
