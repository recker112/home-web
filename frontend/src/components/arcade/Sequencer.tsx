import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { tracks, type Track } from '../../data/tracks'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useSound } from '../../audio/context'
import { ROWS, normalizeRowId, type Row } from './notes'
import { PixelIcon } from '../PixelIcon'
import './Sequencer.css'

/* Medidas de la rejilla. Se pasan al CSS como variables para que el
   indicador de reproducción y las celdas no puedan desalinearse. */
const CELL = 22
const GAP = 2
const ADVANCE = CELL + GAP

const LENGTHS = [16, 32, 64] as const

type Pattern = Record<string, string>

const ROW_BY_ID = new Map(ROWS.map((r) => [r.id, r]))

/* Se calcula una vez al cargar el módulo: así los avisos por notas mal
   escritas en los presets aparecen cuanto antes en la consola. */
let initialPattern: Pattern

/** Une dos ritmos: 'Db4' y 'C#4' son la misma tecla y deben sumarse. */
function mergeRhythm(a: string, b: string) {
  const length = Math.max(a.length, b.length)
  let out = ''
  for (let i = 0; i < length; i++) out += a[i] === 'x' || b[i] === 'x' ? 'x' : '.'
  return out
}

/** Pasa un preset al patrón interno, avisando de las notas que no existen. */
function trackToPattern(track: Track): Pattern {
  const out: Pattern = {}
  for (const [rawId, rhythm] of Object.entries(track.track)) {
    const id = normalizeRowId(rawId)
    if (!id) {
      console.warn(
        `[secuenciador] "${rawId}" no existe en el preset "${track.name}". ` +
          'Usa notas de C3 a B5 (con # o b), o KICK / SNARE / HAT.',
      )
      continue
    }
    if (rhythm.length !== track.steps) {
      console.warn(
        `[secuenciador] "${rawId}" en "${track.name}" tiene ${rhythm.length} pasos, ` +
          `pero el preset declara ${track.steps}. Ejecuta "npm run check:tracks".`,
      )
    }
    out[id] = out[id] ? mergeRhythm(out[id], rhythm) : rhythm
  }
  return out
}

initialPattern = trackToPattern(tracks[0])

/* ── Una fila del piano roll ───────────────────────────────────
   Va memoizada y recibe su ritmo como cadena: al pulsar una celda solo
   se vuelve a dibujar la fila tocada, no las 39. */

type RowProps = {
  row: Row
  rhythm: string
  steps: number
  onToggle: (rowId: string, step: number) => void
}

const RollRow = memo(function RollRow({ row, rhythm, steps, onToggle }: RowProps) {
  return (
    <div
      className={`roll__row${row.sharp ? ' is-sharp' : ''}${row.kind === 'drum' ? ' is-drum' : ''}`}
    >
      <span className="roll__label">{row.label}</span>
      <div className="roll__cells">
        {Array.from({ length: steps }, (_, step) => {
          const on = rhythm[step] === 'x'
          return (
            <button
              key={step}
              className={`roll__cell${on ? ' is-on' : ''}${step % 4 === 0 ? ' is-beat' : ''}`}
              onClick={() => onToggle(row.id, step)}
              aria-label={`${row.label}, paso ${step + 1}`}
              aria-pressed={on}
            />
          )
        })}
      </div>
    </div>
  )
})

export function Sequencer() {
  const [pattern, setPattern] = useLocalStorage<Pattern>('rn.track', initialPattern)
  const [bpm, setBpm] = useState(tracks[0].bpm)
  const [steps, setSteps] = useState<number>(tracks[0].steps)
  const [preset, setPreset] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [uiStep, setUiStep] = useState(-1)

  const { ensureContext } = useSound()

  /* El planificador de audio lee estos refs, así nunca hay que
     reiniciarlo porque hayas movido el tempo o pintado una nota. */
  const patternRef = useRef(pattern)
  const bpmRef = useRef(bpm)
  const stepsRef = useRef(steps)
  patternRef.current = pattern
  bpmRef.current = bpm
  stepsRef.current = steps

  const stepRef = useRef(0)
  const nextTimeRef = useRef(0)
  const queueRef = useRef<{ step: number; time: number }[]>([])
  const noiseRef = useRef<AudioBuffer | null>(null)
  const masterRef = useRef<{ ctx: AudioContext; node: AudioNode } | null>(null)

  /** Compresor de salida: con muchas notas a la vez, evita que sature. */
  const getMaster = useCallback((ctx: AudioContext) => {
    if (masterRef.current?.ctx !== ctx) {
      const comp = ctx.createDynamicsCompressor()
      const gain = ctx.createGain()
      gain.gain.value = 0.85
      comp.connect(gain).connect(ctx.destination)
      masterRef.current = { ctx, node: comp }
    }
    return masterRef.current.node
  }, [])

  const getNoise = useCallback((ctx: AudioContext) => {
    if (!noiseRef.current) {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      noiseRef.current = buffer
    }
    return noiseRef.current
  }, [])

  /** Dispara la voz que corresponda a una fila en un instante dado. */
  const trigger = useCallback(
    (ctx: AudioContext, row: Row, time: number) => {
      const dest = getMaster(ctx)

      if (row.kind === 'note') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(row.freq, time)
        gain.gain.setValueAtTime(0.0001, time)
        gain.gain.exponentialRampToValueAtTime(0.075, time + 0.008)
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2)
        osc.connect(gain).connect(dest)
        osc.start(time)
        osc.stop(time + 0.22)
        return
      }

      if (row.drum === 'kick') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(150, time)
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.16)
        gain.gain.setValueAtTime(0.4, time)
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18)
        osc.connect(gain).connect(dest)
        osc.start(time)
        osc.stop(time + 0.2)
        return
      }

      /* Caja y charles salen del mismo ruido blanco: cambia el filtro
         y lo rápido que se apagan. */
      const src = ctx.createBufferSource()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      src.buffer = getNoise(ctx)

      if (row.drum === 'snare') {
        filter.type = 'bandpass'
        filter.frequency.value = 1900
        filter.Q.value = 0.8
        gain.gain.setValueAtTime(0.22, time)
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14)
        src.connect(filter).connect(gain).connect(dest)
        src.start(time)
        src.stop(time + 0.16)

        /* Un tono grave corto le da cuerpo al golpe. */
        const body = ctx.createOscillator()
        const bodyGain = ctx.createGain()
        body.type = 'triangle'
        body.frequency.setValueAtTime(190, time)
        bodyGain.gain.setValueAtTime(0.12, time)
        bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09)
        body.connect(bodyGain).connect(dest)
        body.start(time)
        body.stop(time + 0.1)
        return
      }

      filter.type = 'highpass'
      filter.frequency.value = 7000
      gain.gain.setValueAtTime(0.12, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05)
      src.connect(filter).connect(gain).connect(dest)
      src.start(time)
      src.stop(time + 0.06)
    },
    [getMaster, getNoise],
  )

  /* Reloj de audio: programa por adelantado y deja marcar el tiempo al
     hardware. Un setInterval por sí solo se iría desviando. */
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

        for (const row of ROWS) {
          if (patternRef.current[row.id]?.[step] === 'x') trigger(ctx, row, time)
        }

        queueRef.current.push({ step, time })
        nextTimeRef.current += stepDur
        stepRef.current = (step + 1) % stepsRef.current
      }
    }

    schedule()
    const timer = setInterval(schedule, 25)

    /* El cabezal visual se mueve con el reloj de audio, no con el de JS. */
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
  }, [playing, ensureContext, trigger])

  const toggle = useCallback(
    (rowId: string, step: number) => {
      const wasOn = patternRef.current[rowId]?.[step] === 'x'

      setPattern((prev) => {
        const line = (prev[rowId] ?? '').padEnd(step + 1, '.')
        return {
          ...prev,
          [rowId]: line.slice(0, step) + (wasOn ? '.' : 'x') + line.slice(step + 1),
        }
      })

      /* Al encender una celda suena la nota, para saber qué has puesto. */
      if (!wasOn) {
        const ctx = ensureContext()
        const row = ROW_BY_ID.get(rowId)
        if (ctx && row) trigger(ctx, row, ctx.currentTime)
      }
    },
    [ensureContext, setPattern, trigger],
  )

  const loadPreset = (index: number) => {
    const track = tracks[index]
    if (!track) return
    setPreset(index)
    setPattern(trackToPattern(track))
    setBpm(track.bpm)
    setSteps(track.steps)
  }

  /** Patrón al azar, limitado a una pentatónica para que siempre suene bien. */
  const randomize = () => {
    const pool = ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5']
    const next: Pattern = {}
    const put = (id: string, step: number) => {
      const line = (next[id] ?? '').padEnd(step + 1, '.')
      next[id] = line.slice(0, step) + 'x' + line.slice(step + 1)
    }

    for (let s = 0; s < steps; s++) {
      if (s % 4 === 0) put('KICK', s)
      if (s % 8 === 4) put('SNARE', s)
      if (s % 4 === 2 && Math.random() > 0.3) put('HAT', s)
      if (Math.random() > 0.76) put(pool[Math.floor(Math.random() * pool.length)], s)
    }
    setPattern(next)
  }

  const style = { '--cell': `${CELL}px`, '--gap': `${GAP}px` } as CSSProperties

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

        <label className="seq__field">
          <span className="seq__field-label">PRESET</span>
          <select
            className="seq__select"
            value={preset}
            onChange={(e) => loadPreset(Number(e.target.value))}
          >
            {tracks.map((t, i) => (
              <option key={t.name} value={i}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <div className="seq__field">
          <span className="seq__field-label">PASOS</span>
          <div className="seq__lengths">
            {LENGTHS.map((n) => (
              <button
                key={n}
                className={`seq__length${steps === n ? ' is-active' : ''}`}
                onClick={() => setSteps(n)}
                title={
                  n < steps
                    ? `Muestra solo los primeros ${n} pasos (no se borra lo que hay más allá)`
                    : `Patrón de ${n} pasos`
                }
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <label className="seq__field seq__field--grow">
          <span className="seq__field-label">TEMPO {bpm}</span>
          <input
            type="range"
            min={50}
            max={200}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            aria-label="Tempo en pulsaciones por minuto"
          />
        </label>

        <button className="btn btn--sm" onClick={randomize} title="Patrón aleatorio">
          <PixelIcon name="bolt" size={16} />
          AZAR
        </button>

        <button className="btn btn--sm" onClick={() => setPattern({})} title="Vaciar la rejilla">
          <PixelIcon name="close" size={16} />
          LIMPIAR
        </button>
      </div>

      <div className="roll" style={style}>
        <div className="roll__inner">
          <div
            className="roll__playhead"
            style={{ transform: `translateX(${uiStep * ADVANCE}px)`, opacity: uiStep < 0 ? 0 : 1 }}
          />
          {ROWS.map((row) => (
            <RollRow
              key={row.id}
              row={row}
              rhythm={pattern[row.id] ?? ''}
              steps={steps}
              onToggle={toggle}
            />
          ))}
        </div>
      </div>

      <p className="seq__hint">
        Tres octavas cromáticas (C3–B5) con todos los semitonos, más batería. Añade tus canciones en{' '}
        <code>src/data/tracks.ts</code>. Suena aunque tengas los efectos de la web silenciados.
      </p>
    </div>
  )
}
