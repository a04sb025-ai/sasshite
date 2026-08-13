import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

const prototypePath = '/prototypes/train-pixi-v1'
const isTrainPrototype = window.location.pathname.replace(/\/$/, '') === prototypePath
const TrainPixiPrototype = lazy(() => import('./prototypes/TrainPixiPrototype'))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isTrainPrototype
      ? <Suspense fallback={<main className="train-prototype-page">プロトタイプを読み込んでいます…</main>}><TrainPixiPrototype /></Suspense>
      : <App />}
  </React.StrictMode>,
)
