import trainArt from '../assets/scene-train.svg'
import elevatorArt from '../assets/scene-elevator.svg'
import karaageArt from '../assets/scene-karaage.svg'
import meetingArt from '../assets/scene-meeting.svg'
import endingArt from '../assets/scene-ending.svg'

type Props = { sceneId: string; acted: string | null; onAction: (id: string) => void }

type Hotspot = {
  id: string
  label: string
  className: string
}

const artByScene: Record<string, string> = {
  train: trainArt,
  elevator: elevatorArt,
  karaage: karaageArt,
  meeting: meetingArt,
  ending: endingArt,
}

const sceneLabels: Record<string, string> = {
  train: '電車内。オレンジ色の服の「あなた」が座り、隣の席をバッグがふさいでいる。近くに座りたそうな人がいる。',
  elevator: 'エレベーターホール。オレンジ色の服の「あなた」が操作盤の近くにいて、別の人が閉まりかけた扉へ急いでいる。',
  karaage: '4人の食卓。手前のオレンジ色の服の「あなた」を含む全員が、皿に残った最後の唐揚げを見ている。',
  meeting: '4人のオンライン会議。オレンジ色の服の「あなた」の枠が示され、誰かの意見を求められている。',
  ending: 'お疲れさまでしたという終了画面。「あなた」のオレンジ色の袖と白い靴が見え、床の右側に紙くずが落ちている。',
}

const hotspotsByScene: Record<string, Hotspot[]> = {
  train: [
    { id: 'move-bag', label: '隣の席に置いたバッグを動かす', className: 'hotspot-train-bag' },
  ],
  elevator: [
    { id: 'open', label: 'エレベーターの開ボタンを押す', className: 'hotspot-elevator-open' },
    { id: 'close', label: 'エレベーターの閉ボタンを押す', className: 'hotspot-elevator-close' },
  ],
  karaage: [
    { id: 'eat', label: '最後の唐揚げを取る', className: 'hotspot-karaage' },
  ],
  meeting: [
    { id: 'speak', label: 'マイクをオンにして発言する', className: 'hotspot-meeting-mic' },
  ],
  ending: [
    { id: 'finish', label: '終了する', className: 'hotspot-ending-finish' },
    { id: 'trash', label: '床の紙くずを拾う', className: 'hotspot-ending-trash' },
  ],
}

export function SceneArtwork({ sceneId, acted, onAction }: Props) {
  const src = artByScene[sceneId] ?? endingArt
  const hotspots = hotspotsByScene[sceneId] ?? hotspotsByScene.ending

  return <section
    className={`art image-scene image-scene-${sceneId} ${acted ? `acted acted-${acted}` : ''}`}
    aria-label={sceneLabels[sceneId] ?? sceneLabels.ending}
  >
    <img className="scene-image" src={src} alt="" draggable={false} />
    {hotspots.map(hotspot => <button
      key={hotspot.id}
      type="button"
      className={`scene-hotspot ${hotspot.className}`}
      aria-label={hotspot.label}
      disabled={Boolean(acted)}
      onClick={() => onAction(hotspot.id)}
    />)}
    {acted && <span className="scene-action-feedback" aria-hidden="true">✓</span>}
  </section>
}
