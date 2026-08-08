import { useEffect, useState } from 'react'

/**
 * Devuelve el id de la sección que ocupa la parte alta del viewport.
 * Se calcula en scroll (throttled con rAF) en vez de con IntersectionObserver
 * porque aquí importa el orden, no solo si algo es visible.
 */
export function useScrollSpy(ids: string[], offset = 90) {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    let raf = 0

    const measure = () => {
      raf = 0
      const y = window.scrollY + offset

      /* Si estamos al final de la página, gana la última sección:
         las cortas nunca llegarían a cruzar el umbral. */
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
        setActive(ids[ids.length - 1] ?? '')
        return
      }

      let current = ids[0] ?? ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= y) current = id
      }
      setActive(current)
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids, offset])

  return active
}
