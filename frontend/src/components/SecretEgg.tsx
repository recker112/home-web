import { useEffect, useRef, useState } from 'react'
import { useSound } from '../audio/context'
import { PixelIcon } from './PixelIcon'
import './SecretEgg.css'

/**
 * Modo CRT: sube las líneas de barrido y pone la rejilla del fondo en
 * movimiento. Se activa disparándole cinco veces al servidor del inicio,
 * que es quien emite el evento `rn:secret`.
 */
export function SecretEgg() {
  const [on, setOn] = useState(false)
  const [toast, setToast] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const sound = useSound()

  useEffect(() => {
    const unlock = () => {
      setOn((prev) => {
        const next = !prev
        document.documentElement.dataset.crt = next ? 'on' : 'off'
        return next
      })

      /* Si ya había un aviso en pantalla, se reinicia su cuenta atrás. */
      clearTimeout(timerRef.current)
      setToast(true)
      sound.play('coin')
      timerRef.current = setTimeout(() => setToast(false), 3200)
    }

    window.addEventListener('rn:secret', unlock)
    return () => {
      window.removeEventListener('rn:secret', unlock)
      clearTimeout(timerRef.current)
    }
  }, [sound])

  if (!toast) return null

  return (
    <div className="egg" role="status">
      <PixelIcon name="star" size={20} />
      <span>{on ? 'MODO CRT ACTIVADO' : 'MODO CRT DESACTIVADO'}</span>
    </div>
  )
}
