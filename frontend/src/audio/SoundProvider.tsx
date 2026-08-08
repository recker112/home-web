import { useCallback, useMemo, useRef, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { SoundContext, type SfxName, type SoundApi } from './context'

/**
 * Efectos de sonido 8-bit generados con Web Audio (ningún archivo de audio).
 *
 * Los SFX de interfaz salen silenciados por defecto: nadie quiere que una
 * web le pite sin avisar. El usuario los activa desde la barra superior.
 */

type Tone = {
  type: OscillatorType
  from: number
  to?: number
  dur: number
  gain?: number
  /** Retardo respecto al inicio del efecto, para encadenar notas. */
  at?: number
}

const SFX: Record<SfxName, Tone[]> = {
  hover: [{ type: 'square', from: 620, dur: 0.035, gain: 0.03 }],
  click: [{ type: 'square', from: 880, to: 440, dur: 0.08, gain: 0.05 }],
  toggle: [
    { type: 'square', from: 440, dur: 0.05, gain: 0.05 },
    { type: 'square', from: 740, dur: 0.07, gain: 0.05, at: 0.05 },
  ],
  ok: [
    { type: 'square', from: 660, dur: 0.06, gain: 0.05 },
    { type: 'square', from: 880, dur: 0.06, gain: 0.05, at: 0.06 },
    { type: 'square', from: 1320, dur: 0.12, gain: 0.05, at: 0.12 },
  ],
  error: [{ type: 'sawtooth', from: 220, to: 70, dur: 0.24, gain: 0.05 }],
  hit: [{ type: 'triangle', from: 1400, to: 500, dur: 0.09, gain: 0.07 }],
  coin: [
    { type: 'square', from: 988, dur: 0.05, gain: 0.06 },
    { type: 'square', from: 1319, dur: 0.16, gain: 0.06, at: 0.05 },
  ],
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useLocalStorage('rn.sound', false)
  const ctxRef = useRef<AudioContext | null>(null)

  const ensureContext = useCallback(() => {
    if (typeof window === 'undefined') return null

    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      ctxRef.current = new Ctor()
    }

    /* Safari e iOS arrancan el contexto suspendido hasta el primer gesto. */
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const play = useCallback(
    (name: SfxName) => {
      if (!enabled) return
      const ctx = ensureContext()
      if (!ctx) return

      for (const tone of SFX[name]) {
        const start = ctx.currentTime + (tone.at ?? 0)
        const end = start + tone.dur
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const peak = tone.gain ?? 0.05

        osc.type = tone.type
        osc.frequency.setValueAtTime(tone.from, start)
        if (tone.to !== undefined) osc.frequency.exponentialRampToValueAtTime(tone.to, end)

        gain.gain.setValueAtTime(peak, start)
        gain.gain.exponentialRampToValueAtTime(0.0001, end)

        osc.connect(gain).connect(ctx.destination)
        osc.start(start)
        osc.stop(end)
      }
    },
    [enabled, ensureContext],
  )

  const toggle = useCallback(() => {
    setEnabled((on) => {
      const next = !on
      /* Confirmación audible al encender: el clic que lo activa no puede
         sonar todavía porque `enabled` aún es false en este render. */
      if (next) {
        const ctx = ensureContext()
        if (ctx) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'square'
          osc.frequency.setValueAtTime(880, ctx.currentTime)
          gain.gain.setValueAtTime(0.05, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12)
          osc.connect(gain).connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 0.12)
        }
      }
      return next
    })
  }, [ensureContext, setEnabled])

  const api = useMemo<SoundApi>(
    () => ({ enabled, toggle, play, ensureContext }),
    [enabled, toggle, play, ensureContext],
  )

  return <SoundContext.Provider value={api}>{children}</SoundContext.Provider>
}
