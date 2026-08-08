import { createContext, useContext } from 'react'
import type { Song } from '../data/music'

/**
 * Estado del reproductor de música.
 *
 * Va en dos contextos a propósito: el tiempo de reproducción cambia unas
 * cuatro veces por segundo y, si viajara junto al resto, arrastraría en
 * cada tic a todo el que escuche al reproductor (el secuenciador, entre
 * otros). Solo la barra de progreso se suscribe a `useMusicTime`.
 */

export type MusicApi = {
  songs: Song[]
  index: number
  song: Song | undefined
  /** Intención del usuario, no el estado real del elemento <audio>. */
  playing: boolean
  duration: number
  volume: number
  /** Mensaje si el archivo no se pudo cargar. */
  error: string | null
  toggle: () => void
  play: (index?: number) => void
  pause: () => void
  next: () => void
  prev: () => void
  seek: (seconds: number) => void
  setVolume: (value: number) => void
}

export const MusicContext = createContext<MusicApi | null>(null)
export const MusicTimeContext = createContext(0)

export function useMusic(): MusicApi {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic debe usarse dentro de <MusicProvider>')
  return ctx
}

export function useMusicTime(): number {
  return useContext(MusicTimeContext)
}

/** Segundos a `m:ss`, con guiones mientras no se conoce la duración. */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '-:--'
  const total = Math.floor(seconds)
  const mins = Math.floor(total / 60)
  return `${mins}:${String(total % 60).padStart(2, '0')}`
}
