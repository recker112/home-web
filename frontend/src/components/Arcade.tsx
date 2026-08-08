import { useState } from 'react'
import { useSound } from '../audio/context'
import { AimTrainer } from './arcade/AimTrainer'
import { PixelPainter } from './arcade/PixelPainter'
import { Sequencer } from './arcade/Sequencer'
import { PixelIcon, type IconName } from './PixelIcon'
import { SectionHead } from './SectionHead'
import './Arcade.css'

type GameId = 'aim' | 'paint' | 'chiptune'

const GAMES: { id: GameId; label: string; icon: IconName; blurb: string }[] = [
  { id: 'aim', label: 'PUNTERÍA', icon: 'crosshair', blurb: '30 segundos, tus reflejos y una diana.' },
  { id: 'paint', label: 'PIXEL ART', icon: 'palette', blurb: 'Un lienzo de 16x16 y 16 colores.' },
  { id: 'chiptune', label: 'CHIPTUNE', icon: 'music', blurb: 'Caja de ritmos de 8 bits, en tu navegador.' },
]

export function Arcade() {
  const [game, setGame] = useState<GameId>('aim')
  const sound = useSound()
  const current = GAMES.find((g) => g.id === game)!

  return (
    <section id="arcade" className="section">
      <div className="wrap">
        <SectionHead
          index="04"
          title="ARCADE"
          subtitle="Mis tres aficiones, jugables. Todo corre en tu navegador: sin servidor, sin cuentas, sin nada que instalar."
        />

        <div className="arcade panel panel--raised">
          <div className="arcade__cabinet-top">
            <span className="arcade__light" />
            <span className="arcade__light" />
            <span className="arcade__light" />
            <span className="arcade__marquee">RECKERNODE ARCADE</span>
            <span className="arcade__coin">INSERT COIN</span>
          </div>

          <div className="arcade__tabs" role="tablist" aria-label="Elegir minijuego">
            {GAMES.map((g) => (
              <button
                key={g.id}
                role="tab"
                aria-selected={game === g.id}
                className={`arcade__tab${game === g.id ? ' is-active' : ''}`}
                onClick={() => {
                  setGame(g.id)
                  sound.play('click')
                }}
                onPointerEnter={() => sound.play('hover')}
              >
                <PixelIcon name={g.icon} size={20} />
                {g.label}
              </button>
            ))}
          </div>

          <div className="arcade__screen">
            <p className="arcade__blurb">{current.blurb}</p>
            {game === 'aim' && <AimTrainer />}
            {game === 'paint' && <PixelPainter />}
            {game === 'chiptune' && <Sequencer />}
          </div>
        </div>
      </div>
    </section>
  )
}
