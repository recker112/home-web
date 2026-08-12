import { useEffect, useState } from 'react'
import { useA11y } from '../state/a11y'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Escribe una lista de líneas en cascada, como un arranque de terminal.
 * Devuelve las líneas ya escritas más la que se está tecleando.
 */
export function useBootLines(lines: string[], speed = 18) {
  const [done, setDone] = useState(0)
  const [chars, setChars] = useState(0)
  /* Sin movimiento por preferencia del sistema o por el modo de
     accesibilidad: el texto aparece entero, no se teclea. */
  const [still] = useState(reduced)
  const a11y = useA11y().enabled
  const instant = still || a11y

  useEffect(() => {
    if (instant || done >= lines.length) return

    const line = lines[done]
    if (chars < line.length) {
      const t = setTimeout(() => setChars((c) => c + 1), speed)
      return () => clearTimeout(t)
    }

    const t = setTimeout(() => {
      setDone((d) => d + 1)
      setChars(0)
    }, 220)
    return () => clearTimeout(t)
  }, [chars, done, instant, lines, speed])

  if (instant) return { rendered: lines, finished: true }

  return {
    rendered: done >= lines.length ? lines : [...lines.slice(0, done), lines[done].slice(0, chars)],
    finished: done >= lines.length,
  }
}

/** Escribe y borra frases en bucle. */
export function useRotatingText(texts: string[], typeSpeed = 45, hold = 1900) {
  const [index, setIndex] = useState(0)
  const [chars, setChars] = useState(0)
  const [erasing, setErasing] = useState(false)
  const [still] = useState(reduced)
  const a11y = useA11y().enabled
  const instant = still || a11y

  useEffect(() => {
    if (instant || texts.length === 0) return
    const text = texts[index % texts.length]

    if (!erasing) {
      if (chars < text.length) {
        const t = setTimeout(() => setChars((c) => c + 1), typeSpeed)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setErasing(true), hold)
      return () => clearTimeout(t)
    }

    if (chars > 0) {
      const t = setTimeout(() => setChars((c) => c - 1), typeSpeed / 2)
      return () => clearTimeout(t)
    }

    setErasing(false)
    setIndex((i) => (i + 1) % texts.length)
  }, [chars, erasing, hold, index, instant, texts, typeSpeed])

  if (instant) return texts[0] ?? ''
  return (texts[index % texts.length] ?? '').slice(0, chars)
}
