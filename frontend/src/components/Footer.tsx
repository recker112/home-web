import { useState } from 'react'
import { profile, socials } from '../data/site'
import { useSound } from '../audio/context'
import { useInView } from '../hooks/useInView'
import { PixelIcon } from './PixelIcon'
import './Footer.css'

export function Footer() {
  const { ref, inView } = useInView()
  const [copied, setCopied] = useState(false)
  const sound = useSound()

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      sound.play('ok')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      sound.play('error')
    }
  }

  return (
    <footer id="contacto" className="footer">
      <div className="wrap">
        <div ref={ref} className={`footer__cta panel panel--raised reveal${inView ? ' is-visible' : ''}`}>
          <PixelIcon name="heart" size={40} />
          <h2 className="footer__title">¿HABLAMOS?</h2>
          <p className="footer__text">
            Si tienes un proyecto entre manos, una duda de infraestructura o simplemente quieres
            jugar una partida, escríbeme.
          </p>

          <div className="footer__actions">
            <a
              className="btn btn--primary"
              href={`mailto:${profile.email}`}
              onPointerEnter={() => sound.play('hover')}
              onClick={() => sound.play('click')}
            >
              <PixelIcon name="mail" size={16} />
              ESCRÍBEME
            </a>
            <button className="btn" onClick={copyEmail} onPointerEnter={() => sound.play('hover')}>
              <PixelIcon name={copied ? 'check' : 'terminal'} size={16} />
              {copied ? '¡COPIADO!' : profile.email}
            </button>
          </div>

          <ul className="footer__socials">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  className="footer__social"
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  onPointerEnter={() => sound.play('hover')}
                >
                  <PixelIcon name={s.icon} size={20} />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__bottom">
          <p>
            © {new Date().getFullYear()} {profile.handle} · {profile.domain}
          </p>
          <p className="footer__credit">
            React + Vite · iconos dibujados píxel a píxel · prueba el código Konami
          </p>
        </div>
      </div>
    </footer>
  )
}
