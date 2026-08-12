import { useEffect, useState } from 'react'
import { navItems, profile } from '../data/site'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { useSound } from '../audio/context'
import { useA11y } from '../state/a11y'
import type { Theme } from '../hooks/useTheme'
import { PixelIcon } from './PixelIcon'
import './Navbar.css'

const IDS = navItems.map((n) => n.id)

type Props = {
  theme: Theme
  onToggleTheme: () => void
}

export function Navbar({ theme, onToggleTheme }: Props) {
  const [open, setOpen] = useState(false)
  const active = useScrollSpy(IDS)
  const sound = useSound()
  const a11y = useA11y()

  /* El menú desplegable no debe sobrevivir a un cambio a escritorio. */
  useEffect(() => {
    if (!open) return
    const mq = window.matchMedia('(min-width: 860px)')
    const close = () => setOpen(false)
    mq.addEventListener('change', close)
    return () => mq.removeEventListener('change', close)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    sound.play('click')
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="nav">
      <div className="nav__inner wrap">
        <button
          className="nav__brand"
          onClick={() => go('inicio')}
          onPointerEnter={() => sound.play('hover')}
        >
          <span className="nav__logo" aria-hidden="true">
            R
          </span>
          <span className="nav__brand-text">
            {profile.handle}
            <span className="nav__brand-dim">.dev</span>
          </span>
        </button>

        <nav className="nav__links" aria-label="Secciones">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav__link${active === item.id ? ' is-active' : ''}`}
              onClick={() => go(item.id)}
              onPointerEnter={() => sound.play('hover')}
              aria-current={active === item.id ? 'true' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="nav__tools">
          <button
            className="nav__icon-btn"
            onClick={() => {
              sound.toggle()
            }}
            aria-pressed={sound.enabled}
            title={sound.enabled ? 'Silenciar efectos' : 'Activar efectos de sonido'}
          >
            <PixelIcon
              name={sound.enabled ? 'volume' : 'mute'}
              size={16}
              title={sound.enabled ? 'Silenciar efectos' : 'Activar efectos de sonido'}
            />
          </button>

          <button
            className={`nav__icon-btn${a11y.enabled ? ' is-on' : ''}`}
            onClick={() => {
              sound.play('toggle')
              a11y.toggle()
            }}
            aria-pressed={a11y.enabled}
            title={
              a11y.enabled
                ? 'Salir del modo de accesibilidad'
                : 'Modo de accesibilidad: texto grande y alto contraste'
            }
          >
            <PixelIcon
              name="eye"
              size={16}
              title={
                a11y.enabled
                  ? 'Salir del modo de accesibilidad'
                  : 'Modo de accesibilidad: texto grande y alto contraste'
              }
            />
          </button>

          <button
            className="nav__icon-btn"
            onClick={() => {
              sound.play('toggle')
              onToggleTheme()
            }}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <PixelIcon
              name={theme === 'dark' ? 'sun' : 'moon'}
              size={16}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            />
          </button>

          <button
            className="nav__icon-btn nav__burger"
            onClick={() => {
              sound.play('click')
              setOpen((o) => !o)
            }}
            aria-expanded={open}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          >
            <PixelIcon name={open ? 'close' : 'menu'} size={16} />
          </button>
        </div>
      </div>

      <div className={`nav__drawer${open ? ' is-open' : ''}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav__drawer-link${active === item.id ? ' is-active' : ''}`}
            onClick={() => go(item.id)}
            tabIndex={open ? 0 : -1}
          >
            <PixelIcon name="arrow" size={12} />
            {item.label}
          </button>
        ))}
      </div>
    </header>
  )
}
