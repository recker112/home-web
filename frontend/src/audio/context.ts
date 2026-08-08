import { createContext, useContext } from 'react'

/**
 * Contrato del sistema de sonido, separado del proveedor para que el
 * módulo del componente exporte solo componentes (así funciona el
 * refresco en caliente durante el desarrollo).
 */

export type SfxName = 'hover' | 'click' | 'toggle' | 'ok' | 'error' | 'hit' | 'coin'

export type SoundApi = {
  enabled: boolean
  toggle: () => void
  play: (name: SfxName) => void
  /** Contexto de audio compartido con el secuenciador del arcade. */
  ensureContext: () => AudioContext | null
}

export const SoundContext = createContext<SoundApi | null>(null)

export function useSound(): SoundApi {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound debe usarse dentro de <SoundProvider>')
  return ctx
}
