import { useEffect, useState } from 'react'
import { useMusic, useMusicTime } from '../music/context'
import { useSound } from '../audio/context'
import { PixelIcon } from './PixelIcon'
import { Vinyl } from './Vinyl'
import './MusicDock.css'

/** Línea de avance del dock: se redibuja al ritmo del audio, así que va aparte. */
function DockProgress() {
  const { duration } = useMusic()
  const time = useMusicTime()
  const percent = duration ? (time / duration) * 100 : 0

  return (
    <div className="dock__progress">
      <span className="dock__progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}

/**
 * Mando flotante en el lado derecho.
 *
 * Desaparece cuando la sección de música entra en pantalla: allí el
 * reproductor ya está incrustado, y tener los dos a la vez sobraría. La
 * música no se interrumpe en el relevo porque el <audio> vive en el
 * proveedor, no aquí.
 */
export function MusicDock() {
  const { song, playing, toggle, next, songs } = useMusic()
  const sfx = useSound()
  const [atSection, setAtSection] = useState(false)

  useEffect(() => {
    const section = document.getElementById('musica')
    if (!section || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => setAtSection(entry.isIntersecting),
      /* Un tercio de la sección a la vista basta para dar el relevo. */
      { threshold: 0.32 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  if (!song) return null

  const goToSection = () => {
    sfx.play('click')
    document.getElementById('musica')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <aside
      className={`dock${atSection ? ' is-docked' : ''}`}
      aria-label="Reproductor de música"
      aria-hidden={atSection}
    >
      <button
        className="dock__disc"
        onClick={goToSection}
        tabIndex={atSection ? -1 : 0}
        aria-label="Ir a la sección de música"
      >
        <Vinyl size={40} spinning={playing} />
      </button>

      <div className="dock__info">
        <span className="dock__label">{playing ? 'SUENA' : 'EN PAUSA'}</span>
        <span className="dock__title">{song.title}</span>
        <DockProgress />
      </div>

      <div className="dock__controls">
        <button
          className="dock__btn dock__btn--main"
          onClick={() => {
            toggle()
            sfx.play('click')
          }}
          tabIndex={atSection ? -1 : 0}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
        >
          <PixelIcon name={playing ? 'pause' : 'play'} size={16} />
        </button>

        {songs.length > 1 && (
          <button
            className="dock__btn"
            onClick={() => {
              next()
              sfx.play('click')
            }}
            tabIndex={atSection ? -1 : 0}
            aria-label="Canción siguiente"
          >
            <PixelIcon name="next" size={16} />
          </button>
        )}
      </div>
    </aside>
  )
}
