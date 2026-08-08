import { useCallback, useEffect, useRef, useState } from 'react'
import { useSound } from '../../audio/context'
import { PixelIcon } from '../PixelIcon'
import './Sequencer.css'

const STEPS = 16

/**
 * Escala pentatónica: cualquier combinación de estas notas suena bien,
 * así que es imposible componer algo desagradable aquí.
 */
const ROWS = [
  { label: 'E5', freq: 659.25, kind: 'tone' },
  { label: 'D5', freq: 587.33, kind: 'tone' },
  { label: 'C5', freq: 523.25, kind: 'tone' },
  { label: 'A4', freq: 440.0, kind: 'tone' },
  { label: 'G4', freq: 392.0, kind: 'tone' },
  { label: 'E4', freq: 329.63, kind: 'tone' },
  { label: 'D4', freq: 293.66, kind: 'tone' },
  { label: 'C4', freq: 261.63, kind: 'tone' },
  { label: 'HAT', freq: 0, kind: 'hat' },
  { label: 'KICK', freq: 0, kind: 'kick' },
] as const

type Grid = boolean[][]

const emptyGrid = (): Grid => ROWS.map(() => Array<boolean>(STEPS).fill(false))

/** Patrón de arranque: un bucle sencillo para que Play suene desde el principio. */
const startingGrid = (): Grid => {
  const g = emptyGrid()
  const on = (row: number, steps: number[]) => steps.forEach((s) => (g[row][s] = true))
  on(9, [0, 4, 8, 12]) // kick a negras
  on(8, [2, 6, 10, 14]) // hat a contratiempo
  on(7, [0, 8]) // C4
  on(4, [3, 11]) // G4
  on(2, [6, 14]) // C5
  on(0, [12]) // E5
  return g
}

export function Sequencer() {
  const [grid, setGrid] = useState<Grid>(startingGrid)
  const [bpm, setBpm] = useState(112)
  const [playing, setPlaying] = useState(false)
  const [uiStep, setUiStep] = useState(-1)
  const sound = useSound()

  /* Los refs mantienen al scheduler leyendo siempre el valor más reciente
     sin tener que reiniciarlo en cada cambio. */
  const gridRef = useRef(grid)
  const bpmRef = useRef(bpm)
  gridRef.current = grid
  bpmRef.current = bpm

  const stepRef = useRef(0)
  const nextTimeRef = useRef(0)
  const queueRef = useRef<{ step: number; time: number }[]>([])
  const noiseRef = useRef<AudioBuffer | null>(null)

  const { ensureContext } = sound

  /** Un pitido de onda cuadrada, el sonido clásico de 8 bits. */
  const playTone = useCallback((ctx: AudioContext, freq: number, time: number) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, time)
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(0.09, time + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18)
    osc.connect(gain).connect(ctx.destination)
    osc.start(time)
    osc.stop(time + 0.2)
  }, [])

  const playKick = useCallback((ctx: AudioContext, time: number) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, time)
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.16)
    gain.gain.setValueAtTime(0.4, time)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18)
    osc.connect(gain).connect(ctx.destination)
    osc.start(time)
    osc.stop(time + 0.2)
  }, [])

  const playHat = useCallback((ctx: AudioContext, time: number) => {
    if (!noiseRef.current) {
      /* Medio segundo de ruido blanco, reutilizado en cada golpe. */
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      noiseRef.current = buffer
    }

    const src = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    src.buffer = noiseRef.current
    filter.type = 'highpass'
    filter.frequency.value = 7000
    gain.gain.setValueAtTime(0.12, time)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05)
    src.connect(filter).connect(gain).connect(ctx.destination)
    src.start(time)
    src.stop(time + 0.06)
  }, [])

  /* Reloj de audio: programa por adelantado y deja que el hardware
     marque el tiempo. Un setInterval solo no daría un ritmo estable. */
  useEffect(() => {
    if (!playing) return
    const ctx = ensureContext()
    if (!ctx) return

    stepRef.current = 0
    queueRef.current = []
    nextTimeRef.current = ctx.currentTime + 0.08

    const schedule = () => {
      const stepDur = 60 / bpmRef.current / 4
      while (nextTimeRef.current < ctx.currentTime + 0.12) {
        const step = stepRef.current
        const time = nextTimeRef.current

        ROWS.forEach((row, r) => {
          if (!gridRef.current[r][step]) return
          if (row.kind === 'kick') playKick(ctx, time)
          else if (row.kind === 'hat') playHat(ctx, time)
          else playTone(ctx, row.freq, time)
        })

        queueRef.current.push({ step, time })
        nextTimeRef.current += stepDur
        stepRef.current = (step + 1) % STEPS
      }
    }

    schedule()
    const timer = setInterval(schedule, 25)

    /* El resalte visual se sincroniza con el reloj de audio, no con el de JS. */
    let raf = requestAnimationFrame(function draw() {
      const queue = queueRef.current
      while (queue.length && queue[0].time <= ctx.currentTime) {
        setUiStep(queue.shift()!.step)
      }
      raf = requestAnimationFrame(draw)
    })

    return () => {
      clearInterval(timer)
      cancelAnimationFrame(raf)
      setUiStep(-1)
    }
  }, [playing, ensureContext, playKick, playHat, playTone])

  const toggleCell = (row: number, step: number) => {
    setGrid((g) => {
      const out = g.map((r) => [...r])
      out[row][step] = !out[row][step]
      return out
    })

    /* Al activar una celda, suena la nota para saber qué acabas de poner. */
    if (!grid[row][step]) {
      const ctx = ensureContext()
      if (ctx) {
        const time = ctx.currentTime
        const kind = ROWS[row].kind
        if (kind === 'kick') playKick(ctx, time)
        else if (kind === 'hat') playHat(ctx, time)
        else playTone(ctx, ROWS[row].freq, time)
      }
    }
  }

  const randomize = () => {
    const g = emptyGrid()
    for (let s = 0; s < STEPS; s++) {
      if (s % 4 === 0) g[9][s] = true
      if (s % 4 === 2) g[8][s] = Math.random() > 0.35
      if (Math.random() > 0.78) g[Math.floor(Math.random() * 8)][s] = true
    }
    setGrid(g)
    sound.play('coin')
  }

  return (
    <div className="seq">
      <div className="seq__controls">
        <button
          className={`btn btn--sm ${playing ? '' : 'btn--primary'}`}
          onClick={() => setPlaying((p) => !p)}
        >
          <PixelIcon name={playing ? 'stop' : 'play'} size={16} />
          {playing ? 'PARAR' : 'TOCAR'}
        </button>

        <button className="btn btn--sm" onClick={randomize}>
          <PixelIcon name="bolt" size={16} />
          ALEATORIO
        </button>

        <button
          className="btn btn--sm"
          onClick={() => {
            setGrid(emptyGrid())
            sound.play('error')
          }}
        >
          <PixelIcon name="close" size={16} />
          LIMPIAR
        </button>

        <label className="seq__tempo">
          <span className="seq__tempo-label">TEMPO {bpm}</span>
          <input
            type="range"
            min={60}
            max={180}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            aria-label="Tempo en pulsaciones por minuto"
          />
        </label>
      </div>

      <div className="seq__scroll">
        <div className="seq__grid">
          {ROWS.map((row, r) => (
            <div key={row.label} className={`seq__row${row.kind !== 'tone' ? ' is-drum' : ''}`}>
              <span className="seq__row-label">{row.label}</span>
              <div className="seq__cells">
                {grid[r].map((on, s) => (
                  <button
                    key={s}
                    className={`seq__cell${on ? ' is-on' : ''}${uiStep === s ? ' is-current' : ''}${
                      s % 4 === 0 ? ' is-beat' : ''
                    }`}
                    onClick={() => toggleCell(r, s)}
                    aria-label={`${row.label} paso ${s + 1}`}
                    aria-pressed={on}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="seq__hint">
        Toca las casillas para componer. Este instrumento suena aunque tengas los efectos de la web
        silenciados.
      </p>
    </div>
  )
}
