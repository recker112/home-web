import { useEffect, useRef, useState } from 'react'

/**
 * Marca un elemento como visible la primera vez que entra en pantalla.
 * Se usa para las animaciones de entrada; una vez visto, deja de observar.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(margin = '-60px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: `0px 0px ${margin} 0px`, threshold: 0.05 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [margin])

  return { ref, inView }
}
