import { useEffect, useRef } from 'react'
import './Backdrop.css'

type Star = { x: number; y: number; size: number; speed: number; depth: number; hue: string }

const COLORS = ['--blue', '--blue-bright', '--cyan', '--gold', '--text-dim']

/**
 * Campo de estrellas pixeladas detrás de todo el sitio.
 * Se mueven solas, hacen parallax con el puntero y con el scroll.
 * Con `prefers-reduced-motion` se dibuja una sola vez, quieto.
 */
export function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* Los colores del tema se resuelven una sola vez y se refrescan al
       cambiar de tema: leerlos en cada fotograma forzaría un recálculo
       de estilos por estrella. */
    let palette: Record<string, string> = {}
    let alpha = 1

    const readPalette = () => {
      const styles = getComputedStyle(document.documentElement)
      for (const name of COLORS) {
        palette[name] = styles.getPropertyValue(name).trim() || '#3b82f6'
      }
      alpha = Number(styles.getPropertyValue('--star-alpha')) || 1
    }

    let stars: Star[] = []
    let width = 0
    let height = 0
    let raf = 0
    /* Objetivo del parallax y valor suavizado que lo persigue. */
    const target = { x: 0, y: 0 }
    const eased = { x: 0, y: 0 }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(150, Math.round((width * height) / 9000))
      stars = Array.from({ length: count }, () => spawn())
    }

    const spawn = (atTop = false): Star => {
      const depth = Math.random() < 0.6 ? 1 : Math.random() < 0.8 ? 2 : 3
      return {
        x: Math.random() * width,
        y: atTop ? -4 : Math.random() * height,
        size: depth,
        speed: 0.08 + depth * 0.12,
        depth,
        hue: COLORS[Math.floor(Math.random() * COLORS.length)],
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const scrolled = window.scrollY * 0.02

      for (const s of stars) {
        const px = Math.round(s.x + eased.x * s.depth)
        const py = Math.round(s.y + eased.y * s.depth - scrolled * s.depth)
        ctx.globalAlpha = alpha * (0.25 + s.depth * 0.25)
        ctx.fillStyle = palette[s.hue]
        ctx.fillRect(px, ((py % height) + height) % height, s.size, s.size)
      }
      ctx.globalAlpha = 1
    }

    const tick = () => {
      eased.x += (target.x - eased.x) * 0.05
      eased.y += (target.y - eased.y) * 0.05
      for (const s of stars) {
        s.y += s.speed
        if (s.y > height + 4) {
          Object.assign(s, spawn(true))
          s.x = Math.random() * width
        }
      }
      draw()
      raf = requestAnimationFrame(tick)
    }

    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / width - 0.5) * -14
      target.y = (e.clientY / height - 0.5) * -14
    }

    readPalette()
    resize()
    window.addEventListener('resize', resize)

    /* Al cambiar de tema hay que releer los colores y, si el lienzo está
       congelado, repintarlo. */
    const themeWatcher = new MutationObserver(() => {
      readPalette()
      if (still) draw()
    })
    themeWatcher.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    if (still) {
      draw()
    } else {
      window.addEventListener('pointermove', onPointer, { passive: true })
      raf = requestAnimationFrame(tick)
    }

    return () => {
      cancelAnimationFrame(raf)
      themeWatcher.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [])

  return (
    <div className="backdrop" aria-hidden="true">
      <canvas ref={canvasRef} className="backdrop__stars" />
      <div className="backdrop__grid" />
      <div className="backdrop__scan" />
    </div>
  )
}
