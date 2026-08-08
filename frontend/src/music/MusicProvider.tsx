import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { songs } from '../data/music'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { MusicContext, MusicTimeContext, type MusicApi } from './context'

/**
 * Reproduce los MP3 de `data/music.ts`.
 *
 * El elemento <audio> vive aquí, en la raíz de la aplicación, y no dentro
 * del reproductor: así la música no se corta cuando el mando pasa de
 * flotar en un lado a incrustarse en su sección, porque lo que se monta y
 * desmonta es la interfaz, nunca el audio.
 *
 * Nunca arranca solo. Además de ser lo que se quiere aquí, los navegadores
 * bloquean la reproducción con sonido que no venga de un gesto del usuario.
 */
export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [time, setTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [volume, setStoredVolume] = useLocalStorage('rn.music.vol', 0.8)

  const song = songs[index]

  /* Cambio de pista: recargar el archivo y volver al principio. El efecto
     de reproducción va después y se encarga de seguir sonando si tocaba. */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !song) return
    /* El nombre puede llevar espacios o acentos, como llegue del disco. */
    audio.src = encodeURI(song.file)
    audio.load()
    setTime(0)
    setDuration(0)
    setError(null)
  }, [song])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!playing) {
      audio.pause()
      return
    }
    audio.play().catch(() => {
      /* Reproducción rechazada (sin gesto previo o archivo ilegible). */
      setPlaying(false)
    })
  }, [playing, index])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.volume = volume
  }, [volume])

  const play = useCallback((next?: number) => {
    if (next !== undefined) setIndex(next)
    setPlaying(true)
  }, [])

  const pause = useCallback(() => setPlaying(false), [])
  const toggle = useCallback(() => setPlaying((p) => !p), [])

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % songs.length)
  }, [])

  const prev = useCallback(() => {
    const audio = audioRef.current
    /* Como en cualquier reproductor: si ya ha avanzado, "anterior"
       reinicia la canción antes de saltar a la de atrás. */
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    setIndex((i) => (i - 1 + songs.length) % songs.length)
  }, [])

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = seconds
    setTime(seconds)
  }, [])

  const setVolume = useCallback(
    (value: number) => setStoredVolume(Math.min(1, Math.max(0, value))),
    [setStoredVolume],
  )

  /* Al terminar, la siguiente. Con una sola canción no hay "siguiente":
     hay que rebobinarla a mano o se quedaría en silencio. */
  const handleEnded = () => {
    if (songs.length <= 1) {
      const audio = audioRef.current
      if (audio) {
        audio.currentTime = 0
        audio.play().catch(() => setPlaying(false))
      }
      return
    }
    setIndex((i) => (i + 1) % songs.length)
  }

  const api = useMemo<MusicApi>(
    () => ({
      songs,
      index,
      song,
      playing,
      duration,
      volume,
      error,
      toggle,
      play,
      pause,
      next,
      prev,
      seek,
      setVolume,
    }),
    [index, song, playing, duration, volume, error, toggle, play, pause, next, prev, seek, setVolume],
  )

  return (
    <MusicContext.Provider value={api}>
      <MusicTimeContext.Provider value={time}>
        {children}
        <audio
          ref={audioRef}
          preload="metadata"
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={handleEnded}
          onError={() => {
            setPlaying(false)
            setError(`No se pudo cargar ${song?.file ?? 'el archivo'}`)
          }}
        />
      </MusicTimeContext.Provider>
    </MusicContext.Provider>
  )
}
