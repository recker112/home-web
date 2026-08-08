import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useSound } from '../../audio/context'
import { PixelIcon } from '../PixelIcon'
import './AimTrainer.css'

type Target = { id: number; x: number; y: number; born: number; ttl: number; size: number }
type Hole = { id: number; x: number; y: number }
type Phase = 'idle' | 'run' | 'over'

const DURATION = 30 // segundos
const MAX_TARGETS = 3
const MAX_HOLES = 14

export function AimTrainer() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [targets, setTargets] = useState<Target[]>([])
  const [holes, setHoles] = useState<Hole[]>([])
  const [hits, setHits] = useState(0)
  const [shots, setShots] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [best, setBest] = useLocalStorage('rn.aim.best', 0)

  const nextId = useRef(0)
  const areaRef = useRef<HTMLDivElement>(null)
  const sound = useSound()

  const accuracy = shots === 0 ? 0 : Math.round((hits / shots) * 100)

  const makeTarget = useCallback((now: number): Target => {
    const size = 34 + Math.round(Math.random() * 22)
    return {
      id: nextId.current++,
      /* Margen para que ningún objetivo se salga del área. */
      x: 8 + Math.random() * 84,
      y: 10 + Math.random() * 80,
      born: now,
      ttl: 850 + Math.random() * 700,
      size,
    }
  }, [])

  const start = () => {
    setPhase('run')
    setHits(0)
    setShots(0)
    setHoles([])
    setTimeLeft(DURATION)
    setTargets([makeTarget(performance.now())])
    sound.play('coin')
  }

  /* Reloj + aparición y caducidad de objetivos. */
  useEffect(() => {
    if (phase !== 'run') return

    const tick = setInterval(() => {
      setTimeLeft((t) => Math.max(0, Math.round((t - 0.1) * 10) / 10))
      const now = performance.now()
      setTargets((list) => {
        const alive = list.filter((t) => now - t.born < t.ttl)
        while (alive.length < MAX_TARGETS) alive.push(makeTarget(now))
        return alive
      })
    }, 100)

    return () => clearInterval(tick)
  }, [phase, makeTarget])

  /* Fin de partida en su propio efecto: así el reloj no dispara efectos. */
  useEffect(() => {
    if (phase !== 'run' || timeLeft > 0) return
    setPhase('over')
    setTargets([])
    sound.play(hits > best ? 'ok' : 'error')
    if (hits > best) setBest(hits)
  }, [phase, timeLeft, hits, best, setBest, sound])

  const onHitTarget = (e: React.PointerEvent, id: number) => {
    e.stopPropagation()
    if (phase !== 'run') return
    setHits((h) => h + 1)
    setShots((s) => s + 1)
    setTargets((list) => list.filter((t) => t.id !== id))
    sound.play('hit')
  }

  const onMiss = (e: React.PointerEvent) => {
    if (phase !== 'run') return
    const rect = areaRef.current?.getBoundingClientRect()
    if (!rect) return
    setShots((s) => s + 1)
    sound.play('error')
    const hole = {
      id: nextId.current++,
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    }
    setHoles((list) => [...list.slice(-(MAX_HOLES - 1)), hole])
  }

  return (
    <div className="aim">
      <div className="aim__hud">
        <Stat label="TIEMPO" value={phase === 'idle' ? `${DURATION}s` : `${timeLeft.toFixed(1)}s`} tone="gold" />
        <Stat label="ACIERTOS" value={String(hits)} tone="blue" />
        <Stat label="PRECISIÓN" value={`${accuracy}%`} tone="cyan" />
        <Stat label="RÉCORD" value={String(best)} tone="green" />
      </div>

      <div
        ref={areaRef}
        className={`aim__area${phase === 'run' ? ' is-live' : ''}`}
        onPointerDown={onMiss}
      >
        {holes.map((h) => (
          <span key={h.id} className="aim__hole" style={{ left: `${h.x}%`, top: `${h.y}%` }} />
        ))}

        {targets.map((t) => (
          <button
            key={t.id}
            className="aim__target"
            style={{ left: `${t.x}%`, top: `${t.y}%`, width: t.size, height: t.size }}
            onPointerDown={(e) => onHitTarget(e, t.id)}
            aria-label="Objetivo"
          >
            <span className="aim__ring" />
            <span className="aim__ring aim__ring--mid" />
            <span className="aim__core" />
          </button>
        ))}

        {phase !== 'run' && (
          <div className="aim__overlay">
            {phase === 'idle' ? (
              <>
                <PixelIcon name="crosshair" size={48} />
                <h4 className="aim__overlay-title">ENTRENAMIENTO DE PUNTERÍA</h4>
                <p className="aim__overlay-text">
                  {DURATION} segundos. Revienta todos los objetivos que puedas antes de que se
                  esfumen. Fallar cuenta en tu precisión.
                </p>
              </>
            ) : (
              <>
                <PixelIcon name={hits >= best && hits > 0 ? 'star' : 'crosshair'} size={48} />
                <h4 className="aim__overlay-title">
                  {hits >= best && hits > 0 ? '¡NUEVO RÉCORD!' : 'FIN DE LA RONDA'}
                </h4>
                <p className="aim__overlay-text">
                  {hits} aciertos de {shots} disparos · {accuracy}% de precisión
                </p>
              </>
            )}
            <button className="btn btn--gold" onPointerDown={(e) => e.stopPropagation()} onClick={start}>
              <PixelIcon name="play" size={16} />
              {phase === 'idle' ? 'EMPEZAR' : 'OTRA RONDA'}
            </button>
          </div>
        )}
      </div>

      <p className="aim__hint">
        Consejo: apunta al centro. En móvil funciona igual, toca los objetivos.
      </p>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`aim__stat aim__stat--${tone}`}>
      <span className="aim__stat-label">{label}</span>
      <span className="aim__stat-value">{value}</span>
    </div>
  )
}
