import { useEffect, useRef, useState } from 'react'
import './Cursor.css'

/**
 * Mira que acompaña al puntero, al estilo de un FPS.
 * Solo se activa con ratón: en táctil no tendría sentido, y con
 * `prefers-reduced-motion` tampoco se muestra.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || still) return
    setEnabled(true)

    let raf = 0
    const pos = { x: -100, y: -100 }
    let over = false

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      const target = e.target as Element | null
      over = Boolean(target?.closest('button, a, input, [role="tab"]'))
      if (!raf) raf = requestAnimationFrame(paint)
    }

    const paint = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      el.dataset.over = over ? 'true' : 'false'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  if (!enabled) return null

  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span className="cursor__arm cursor__arm--n" />
      <span className="cursor__arm cursor__arm--s" />
      <span className="cursor__arm cursor__arm--w" />
      <span className="cursor__arm cursor__arm--e" />
    </div>
  )
}
