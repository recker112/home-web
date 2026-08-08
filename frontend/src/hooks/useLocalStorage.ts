import { useCallback, useState } from 'react'

/** useState que persiste en localStorage y sobrevive a un storage bloqueado. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        /* Sin cambio real no se toca el disco: pintar arrastrando sobre la
           misma celda no debe provocar una escritura por fotograma. */
        if (Object.is(resolved, prev)) return prev
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          /* modo privado o cuota llena: el valor sigue vivo en memoria */
        }
        return resolved
      })
    },
    [key],
  )

  return [value, update] as const
}
