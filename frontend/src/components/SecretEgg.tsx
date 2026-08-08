import { useEffect, useState } from 'react'
import { useSound } from '../audio/context'
import { PixelIcon } from './PixelIcon'
import './SecretEgg.css'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

/**
 * Código Konami (o cinco toques al avatar, para quien no tenga teclado).
 * Al activarlo sube el efecto CRT de todo el sitio.
 */
export function SecretEgg() {
  const [on, setOn] = useState(false)
  const [toast, setToast] = useState(false)
  const sound = useSound()

  useEffect(() => {
    let progress = 0

    const unlock = () => {
      setOn((prev) => {
        const next = !prev
        document.documentElement.dataset.crt = next ? 'on' : 'off'
        return next
      })
      setToast(true)
      sound.play('coin')
      setTimeout(() => setToast(false), 3200)
    }

    const onKey = (e: KeyboardEvent) => {
      const expected = KONAMI[progress]
      if (e.key.toLowerCase() === expected.toLowerCase()) {
        progress++
        if (progress === KONAMI.length) {
          progress = 0
          unlock()
        }
      } else {
        /* Un fallo reinicia, salvo que la tecla sea el inicio de la secuencia. */
        progress = e.key === KONAMI[0] ? 1 : 0
      }
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('rn:secret', unlock)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('rn:secret', unlock)
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
