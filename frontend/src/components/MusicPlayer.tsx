import { formatTime, useMusic, useMusicTime } from '../music/context'
import { useSound } from '../audio/context'
import { PixelIcon } from './PixelIcon'
import { Vinyl } from './Vinyl'
import './MusicPlayer.css'

/**
 * Barra de progreso. Va aparte porque es lo único que se redibuja al
 * ritmo del reloj del audio, varias veces por segundo.
 */
function Progress() {
  const { duration, seek } = useMusic()
  const time = useMusicTime()

  return (
    <div className="player__progress">
      <span className="player__time">{formatTime(time)}</span>
      <input
        className="player__seek"
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(time, duration || 0)}
        onChange={(e) => seek(Number(e.target.value))}
        disabled={!duration}
        aria-label="Posición de la canción"
      />
      <span className="player__time">{duration ? formatTime(duration) : '-:--'}</span>
    </div>
  )
}

export function MusicPlayer() {
  const { song, songs, index, playing, toggle, next, prev, volume, setVolume, error } = useMusic()
  const sfx = useSound()

  if (!song) return null

  return (
    <div className="player panel panel--raised">
      <div className="player__bar">
        <span className={`player__led${playing ? ' is-on' : ''}`} />
        <span className="player__bar-title">REPRODUCTOR</span>
        <span className="player__bar-count">
          {String(index + 1).padStart(2, '0')}/{String(songs.length).padStart(2, '0')}
        </span>
      </div>

      <div className="player__body">
        <Vinyl size={118} spinning={playing} className="player__disc" />

        <div className="player__info">
          <p className="player__now">{playing ? 'AHORA SUENA' : 'EN PAUSA'}</p>
          <h3 className="player__title">{song.title}</h3>
          {song.note ? <p className="player__note">{song.note}</p> : null}
          {song.year ? <p className="player__year">{song.year}</p> : null}
        </div>
      </div>

      <Progress />

      <div className="player__controls">
        <button
          className="player__btn"
          onClick={() => {
            prev()
            sfx.play('click')
          }}
          disabled={songs.length < 2}
          aria-label="Canción anterior"
        >
          <PixelIcon name="prev" size={16} />
        </button>

        <button
          className="player__btn player__btn--main"
          onClick={() => {
            toggle()
            sfx.play('click')
          }}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
        >
          <PixelIcon name={playing ? 'pause' : 'play'} size={20} />
        </button>

        <button
          className="player__btn"
          onClick={() => {
            next()
            sfx.play('click')
          }}
          disabled={songs.length < 2}
          aria-label="Canción siguiente"
        >
          <PixelIcon name="next" size={16} />
        </button>

        <label className="player__volume">
          <PixelIcon name={volume === 0 ? 'mute' : 'volume'} size={16} />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volumen"
          />
        </label>
      </div>

      {error ? <p className="player__error">{error}</p> : null}
    </div>
  )
}
