import { useCallback, useRef, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useSound } from '../../audio/context'
import { PixelIcon } from '../PixelIcon'
import './PixelPainter.css'

const SIZE = 16
const EMPTY: (string | null)[] = Array(SIZE * SIZE).fill(null)

/* Paleta de 16 colores al estilo de las consolas de 8 bits. */
const PALETTE = [
  '#000000', '#1d2b53', '#7e2553', '#008751',
  '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8',
  '#ff004d', '#ffa300', '#ffec27', '#00e436',
  '#29adff', '#83769c', '#ff77a8', '#ffccaa',
]

type Tool = 'brush' | 'eraser' | 'fill'

export function PixelPainter() {
  const [grid, setGrid] = useLocalStorage<(string | null)[]>('rn.canvas', EMPTY)
  const [color, setColor] = useState(PALETTE[12])
  const [tool, setTool] = useState<Tool>('brush')
  const painting = useRef(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const sound = useSound()

  /** Rellena por inundación desde una celda, respetando el color original. */
  const flood = useCallback(
    (start: number, next: string | null) => {
      setGrid((cells) => {
        const origin = cells[start]
        if (origin === next) return cells
        const out = [...cells]
        const queue = [start]

        while (queue.length) {
          const i = queue.pop() as number
          if (out[i] !== origin) continue
          out[i] = next

          const row = Math.floor(i / SIZE)
          const col = i % SIZE
          if (col > 0) queue.push(i - 1)
          if (col < SIZE - 1) queue.push(i + 1)
          if (row > 0) queue.push(i - SIZE)
          if (row < SIZE - 1) queue.push(i + SIZE)
        }
        return out
      })
    },
    [setGrid],
  )

  const paintAt = useCallback(
    (index: number) => {
      const next = tool === 'eraser' ? null : color
      if (tool === 'fill') {
        flood(index, next)
        sound.play('ok')
        return
      }
      setGrid((cells) => {
        if (cells[index] === next) return cells
        const out = [...cells]
        out[index] = next
        return out
      })
    },
    [color, flood, setGrid, sound, tool],
  )

  /** Traduce la posición del puntero a un índice de celda. */
  const cellFromEvent = (e: React.PointerEvent) => {
    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect) return -1
    const col = Math.floor(((e.clientX - rect.left) / rect.width) * SIZE)
    const row = Math.floor(((e.clientY - rect.top) / rect.height) * SIZE)
    if (col < 0 || col >= SIZE || row < 0 || row >= SIZE) return -1
    return row * SIZE + col
  }

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault()
    const index = cellFromEvent(e)
    if (index < 0) return
    /* El relleno es un disparo único: arrastrarlo no tendría sentido. */
    painting.current = tool !== 'fill'
    gridRef.current?.setPointerCapture(e.pointerId)
    paintAt(index)
  }

  const onMove = (e: React.PointerEvent) => {
    if (!painting.current) return
    const index = cellFromEvent(e)
    if (index >= 0) paintAt(index)
  }

  const stop = () => {
    painting.current = false
  }

  const clear = () => {
    setGrid(EMPTY)
    sound.play('error')
  }

  /** Exporta el dibujo a PNG ampliado x24, sin suavizado. */
  const download = () => {
    const scale = 24
    const canvas = document.createElement('canvas')
    canvas.width = SIZE * scale
    canvas.height = SIZE * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = false
    grid.forEach((cell, i) => {
      if (!cell) return
      ctx.fillStyle = cell
      ctx.fillRect((i % SIZE) * scale, Math.floor(i / SIZE) * scale, scale, scale)
    })

    const link = document.createElement('a')
    link.download = 'pixelart-reckernode.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    sound.play('coin')
  }

  const tools: { id: Tool; icon: 'palette' | 'trash' | 'download'; label: string }[] = [
    { id: 'brush', icon: 'palette', label: 'PINCEL' },
    { id: 'eraser', icon: 'trash', label: 'BORRAR' },
    { id: 'fill', icon: 'download', label: 'RELLENAR' },
  ]

  return (
    <div className="painter">
      <div className="painter__stage">
        <div
          ref={gridRef}
          className="painter__grid"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={stop}
          onPointerCancel={stop}
          onPointerLeave={stop}
          role="application"
          aria-label="Lienzo de 16 por 16 píxeles"
        >
          {grid.map((cell, i) => (
            <span
              key={i}
              className="painter__cell"
              style={cell ? { background: cell } : undefined}
            />
          ))}
        </div>
      </div>

      <div className="painter__side">
        <div className="painter__block">
          <p className="painter__label">COLOR</p>
          <div className="painter__palette">
            {PALETTE.map((c) => (
              <button
                key={c}
                className={`painter__swatch${color === c && tool !== 'eraser' ? ' is-active' : ''}`}
                style={{ background: c }}
                onClick={() => {
                  setColor(c)
                  if (tool === 'eraser') setTool('brush')
                  sound.play('hover')
                }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="painter__block">
          <p className="painter__label">HERRAMIENTA</p>
          <div className="painter__tools">
            {tools.map((t) => (
              <button
                key={t.id}
                className={`painter__tool${tool === t.id ? ' is-active' : ''}`}
                onClick={() => {
                  setTool(t.id)
                  sound.play('click')
                }}
              >
                <PixelIcon name={t.icon} size={16} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="painter__block painter__actions">
          <button className="btn btn--sm btn--primary" onClick={download}>
            <PixelIcon name="download" size={16} />
            PNG
          </button>
          <button className="btn btn--sm" onClick={clear}>
            <PixelIcon name="close" size={16} />
            LIMPIAR
          </button>
        </div>

        <p className="painter__hint">
          Arrastra para pintar. Tu dibujo se guarda solo en este navegador.
        </p>
      </div>
    </div>
  )
}
