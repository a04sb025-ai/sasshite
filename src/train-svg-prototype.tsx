import React from 'react'
import ReactDOM from 'react-dom/client'
import { TrainSvgPrototype } from './components/TrainSvgPrototype'
import './train-svg-prototype.css'

ReactDOM.createRoot(document.getElementById('train-svg-prototype-root')!).render(
  <React.StrictMode><TrainSvgPrototype /></React.StrictMode>,
)
