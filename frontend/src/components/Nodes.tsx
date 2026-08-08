import { useEffect, useState } from 'react'
import { services, type Service } from '../data/site'
import { useInView } from '../hooks/useInView'
import { useSound } from '../audio/context'
import { PixelIcon } from './PixelIcon'
import { SectionHead } from './SectionHead'
import './Nodes.css'

type ProbeState = 'off' | 'checking' | 'responds' | 'silent'

/**
 * Comprueba si el host contesta a una petición HTTP.
 *
 * Va en `no-cors`, así que la respuesta es opaca: sabemos que *algo*
 * respondió, pero no qué. Por eso las etiquetas hablan de "responde" y no
 * de "online": un servicio puede estar vivo y aun así no contestar aquí
 * (CORS, cortafuegos, o que ni siquiera hable HTTP, como TeamSpeak).
 */
function useProbe(url: string): ProbeState {
  const [state, setState] = useState<ProbeState>(url ? 'checking' : 'off')

  useEffect(() => {
    if (!url) return
    let cancelled = false
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)

    fetch(url, { mode: 'no-cors', cache: 'no-store', signal: controller.signal })
      .then(() => {
        if (!cancelled) setState('responds')
      })
      .catch(() => {
        if (!cancelled) setState('silent')
      })
      .finally(() => clearTimeout(timer))

    return () => {
      cancelled = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [url])

  return state
}

const PROBE_LABEL: Record<ProbeState, string> = {
  off: 'SIN SONDA',
  checking: 'COMPROBANDO',
  responds: 'RESPONDE',
  silent: 'SIN RESPUESTA',
}

const PROBE_HINT: Record<ProbeState, string> = {
  off: 'Este servicio no habla HTTP: conéctate con tu cliente.',
  checking: 'Enviando una petición al host…',
  responds: 'El host contestó a una petición HTTP desde tu navegador.',
  silent: 'No hubo respuesta. Puede estar caído, o simplemente bloquear esta petición.',
}

function NodeCard({ service, index }: { service: Service; index: number }) {
  const probe = useProbe(service.probeUrl)
  const { ref, inView } = useInView()
  const [copied, setCopied] = useState(false)
  const sound = useSound()

  const copyHost = async () => {
    try {
      await navigator.clipboard.writeText(service.name)
      setCopied(true)
      sound.play('ok')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      sound.play('error')
    }
  }

  return (
    <article
      ref={ref}
      className={`node node--${service.accent} panel panel--raised reveal${inView ? ' is-visible' : ''}`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <header className="node__bar">
        <span className={`node__probe node__probe--${probe}`} title={PROBE_HINT[probe]}>
          <span className="node__probe-dot" />
          {PROBE_LABEL[probe]}
        </span>
        <span className="node__bar-id">NODE_{String(index + 1).padStart(2, '0')}</span>
      </header>

      <div className="node__body">
        <div className="node__icon">
          <PixelIcon name={service.icon} size={48} />
        </div>

        <div className="node__content">
          <h3 className="node__name">{service.name}</h3>
          <p className="node__tagline">{service.tagline}</p>
          <p className="node__desc">{service.description}</p>

          <ul className="node__stack">
            {service.stack.map((s) => (
              <li key={s} className="tag">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="node__actions">
        <a
          className="btn btn--primary btn--sm"
          href={service.url}
          target="_blank"
          rel="noreferrer noopener"
          onPointerEnter={() => sound.play('hover')}
          onClick={() => sound.play('click')}
        >
          <PixelIcon name="external" size={16} />
          ABRIR
        </a>
        <button
          className="btn btn--sm"
          onClick={copyHost}
          onPointerEnter={() => sound.play('hover')}
        >
          <PixelIcon name={copied ? 'check' : 'terminal'} size={16} />
          {copied ? 'COPIADO' : 'COPIAR HOST'}
        </button>
      </footer>
    </article>
  )
}

export function Nodes() {
  return (
    <section id="nodos" className="section">
      <div className="wrap">
        <SectionHead
          index="01"
          title="MIS NODOS"
          subtitle="Servicios que hospedo en reckernode.dev. Se comprueban al cargar la página."
        />

        <div className="nodes__grid">
          {services.map((service, i) => (
            <NodeCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
