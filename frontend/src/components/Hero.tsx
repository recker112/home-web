import { useRef } from 'react'
import { profile, projects, services, skills } from '../data/site'
import { useBootLines, useRotatingText } from '../hooks/useTypewriter'
import { useSound } from '../audio/context'
import { Avatar } from './Avatar'
import { PixelIcon } from './PixelIcon'
import './Hero.css'

const BOOT = [
  '$ ssh recker@reckernode.dev',
  '> handshake ....... OK',
  '$ systemctl status --nodes',
  '[ OK ] music.reckernode.dev',
  '[ OK ] ts3.reckernode.dev',
  '[ OK ] portfolio.service',
  '$ whoami',
]

export function Hero() {
  const { rendered, finished } = useBootLines(BOOT)
  const tagline = useRotatingText(profile.taglines)
  const sound = useSound()
  const taps = useRef(0)

  const stats = [
    { value: String(services.length), label: 'NODOS' },
    { value: String(skills.length), label: 'SKILLS' },
    { value: String(projects.length), label: 'PROYECTOS' },
  ]

  const scrollTo = (id: string) => {
    sound.play('click')
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const tapAvatar = () => {
    sound.play('hover')
    taps.current += 1
    if (taps.current >= 5) {
      taps.current = 0
      window.dispatchEvent(new Event('rn:secret'))
    }
  }

  return (
    <section id="inicio" className="hero">
      <div className="wrap hero__grid">
        <div className="hero__left">
          <p className="hero__badge">
            <span className="hero__badge-dot" />
            {profile.availability}
          </p>

          <h1 className="hero__title">
            <span className="hero__hi">HOLA, SOY</span>
            <span className="hero__name" data-text={profile.handle.toUpperCase()}>
              {profile.handle.toUpperCase()}
            </span>
          </h1>

          <p className="hero__role">{profile.role}</p>

          <p className="hero__typed">
            <span className="hero__prompt">&gt;</span>
            <span>{tagline}</span>
            <span className="hero__caret" />
          </p>

          <div className="hero__cta">
            <button
              className="btn btn--primary"
              onClick={() => scrollTo('nodos')}
              onPointerEnter={() => sound.play('hover')}
            >
              <PixelIcon name="server" size={16} />
              VER MIS NODOS
            </button>
            <button
              className="btn btn--gold"
              onClick={() => scrollTo('arcade')}
              onPointerEnter={() => sound.play('hover')}
            >
              <PixelIcon name="crosshair" size={16} />
              ABRIR ARCADE
            </button>
          </div>

          <ul className="hero__stats">
            {stats.map((s) => (
              <li key={s.label} className="hero__stat">
                <span className="hero__stat-value">{s.value}</span>
                <span className="hero__stat-label">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__right">
          {/* Cinco toques al avatar activan el modo CRT: el código Konami
              para quien navega sin teclado. */}
          <button className="hero__avatar" onClick={tapAvatar} aria-label="Avatar de recker">
            <Avatar size={132} />
          </button>

          <div className="terminal panel panel--raised">
            <div className="terminal__bar">
              <span className="terminal__dot" style={{ background: 'var(--red)' }} />
              <span className="terminal__dot" style={{ background: 'var(--gold)' }} />
              <span className="terminal__dot" style={{ background: 'var(--green)' }} />
              <span className="terminal__title">recker@reckernode: ~</span>
            </div>
            <div className="terminal__body">
              {rendered.map((line, i) => (
                <p
                  key={i}
                  className={`terminal__line${line.startsWith('[ OK ]') ? ' is-ok' : ''}${
                    line.startsWith('$') ? ' is-cmd' : ''
                  }`}
                >
                  {line}
                </p>
              ))}
              {finished && (
                <p className="terminal__line is-answer">
                  {profile.handle} :: {profile.role}
                  <span className="hero__caret" />
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <button className="hero__scroll" onClick={() => scrollTo('nodos')} aria-label="Bajar a nodos">
        <span>SCROLL</span>
        <PixelIcon name="download" size={16} />
      </button>
    </section>
  )
}
