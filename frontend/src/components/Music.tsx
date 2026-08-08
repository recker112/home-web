import { formatTime, useMusic } from '../music/context'
import { useSound } from '../audio/context'
import { useInView } from '../hooks/useInView'
import { MusicPlayer } from './MusicPlayer'
import { PixelIcon } from './PixelIcon'
import { SectionHead } from './SectionHead'
import './Music.css'

export function Music() {
  const { songs, index, playing, play, toggle, duration } = useMusic()
  const { ref, inView } = useInView()
  const sfx = useSound()

  if (songs.length === 0) return null

  const onPick = (i: number) => {
    /* Pulsar la que ya suena la pausa, como en cualquier reproductor. */
    if (i === index) toggle()
    else play(i)
    sfx.play('click')
  }

  return (
    <section id="musica" className="section">
      <div className="wrap">
        <SectionHead
          index="05"
          title="MÚSICA"
          subtitle="Lo que compongo cuando no estoy peleándome con un servidor. Dale al play: el mando te sigue por el resto de la página."
        />

        <div ref={ref} className={`music__grid reveal${inView ? ' is-visible' : ''}`}>
          <ol className="music__list panel">
            {songs.map((song, i) => {
              const current = i === index
              return (
                <li key={song.file}>
                  <button
                    className={`music__item${current ? ' is-current' : ''}`}
                    onClick={() => onPick(i)}
                    onPointerEnter={() => sfx.play('hover')}
                    aria-current={current ? 'true' : undefined}
                  >
                    <span className="music__num">
                      {current && playing ? (
                        <span className="music__bars" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : (
                        String(i + 1).padStart(2, '0')
                      )}
                    </span>

                    <span className="music__meta">
                      <span className="music__song">{song.title}</span>
                      {song.note ? <span className="music__note">{song.note}</span> : null}
                    </span>

                    <span className="music__len">
                      {current && duration ? formatTime(duration) : ''}
                    </span>

                    <PixelIcon name={current && playing ? 'pause' : 'play'} size={14} />
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="music__player">
            <MusicPlayer />
          </div>
        </div>
      </div>
    </section>
  )
}
