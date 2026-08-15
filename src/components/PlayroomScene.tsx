import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

type Props = {
  acted: string | null
  onAction: (id: string) => void
}

type Point = { x: number; y: number }

const friendDropStyle: CSSProperties = {
  position: 'absolute',
  left: '58%',
  top: '34%',
  width: '37%',
  height: '55%',
}

const playDropStyle: CSSProperties = {
  position: 'absolute',
  left: '7%',
  top: '42%',
  width: '51%',
  height: '52%',
}

const toyStyle: CSSProperties = {
  position: 'absolute',
  left: '37%',
  top: '53%',
  width: '28%',
  aspectRatio: '1 / 1',
}

function releaseCapture(element: HTMLButtonElement, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId)
  } catch {
    // Pointer capture can already be gone after cancellation or a mobile gesture.
  }
}

export function PlayroomScene({ acted, onAction }: Props) {
  const pointerId = useRef<number | null>(null)
  const origin = useRef<Point>({ x: 0, y: 0 })
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const resolved = acted !== null
  const positiveAfter = acted === 'bring-toy' || acted === 'invite'

  const resetDrag = (element?: HTMLButtonElement, id?: number) => {
    if (element && id !== undefined) releaseCapture(element, id)
    pointerId.current = null
    setDragging(false)
    setOffset({ x: 0, y: 0 })
  }

  const startDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (resolved || event.button !== 0 || pointerId.current !== null) return
    event.preventDefault()
    pointerId.current = event.pointerId
    origin.current = { x: event.clientX, y: event.clientY }
    setDragging(true)
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* non-fatal */ }
  }

  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerId.current !== event.pointerId) return
    setOffset({ x: event.clientX - origin.current.x, y: event.clientY - origin.current.y })
  }

  const finishDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerId.current !== event.pointerId) return
    const drop = document.elementsFromPoint(event.clientX, event.clientY)
      .map(element => element.closest<HTMLElement>('[data-playroom-drop]'))
      .find(Boolean)?.dataset.playroomDrop

    resetDrag(event.currentTarget, event.pointerId)
    if (drop === 'friend') onAction('bring-toy')
    else if (drop === 'play') onAction('keep-playing')
  }

  const cancelDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerId.current !== event.pointerId) return
    resetDrag(event.currentTarget, event.pointerId)
  }

  const keyboardAction = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      onAction('bring-toy')
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      onAction('keep-playing')
    }
  }

  return <div
    className="art playroom-image-scene"
    aria-label="おへやで遊んでいる子と、少し離れてその様子を見ている子がいる"
    style={{ position: 'relative' }}
  >
    <img
      className="scene-background"
      src={positiveAfter ? '/scene-art/playroom-after.png' : '/scene-art/playroom-before.png'}
      alt=""
      draggable={false}
    />

    {!resolved && <>
      <span data-playroom-drop="friend" aria-hidden="true" style={{ ...friendDropStyle, pointerEvents: 'auto' }} />
      <span data-playroom-drop="play" aria-hidden="true" style={{ ...playDropStyle, pointerEvents: 'auto' }} />
      <button
        type="button"
        className={`playroom-drag-toy ${dragging ? 'dragging' : ''}`}
        aria-label="積み木の家。右の子のほうへ動かしたり、遊んでいる場所へ戻したりできる"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
        onPointerCancel={cancelDrag}
        onKeyDown={keyboardAction}
        style={{
          ...toyStyle,
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${dragging ? 1.06 : 1})`,
          zIndex: dragging ? 20 : 8,
        }}
      >
        <img src="/scene-art/playroom-block-house.png" alt="" draggable={false} />
      </button>
    </>}
  </div>
}
