import { createContext, useContext } from 'react'
import type { SkillCategory } from '../data/site'

/**
 * Área seleccionada. Es un único filtro compartido: lo que elijas se
 * aplica a la vez a las skills y a los proyectos, para que siempre veas
 * una cosa y la otra en el mismo contexto.
 */
export type Area = SkillCategory | 'Todas'

export type AreaApi = {
  area: Area
  setArea: (area: Area) => void
}

export const AreaContext = createContext<AreaApi | null>(null)

export function useArea(): AreaApi {
  const ctx = useContext(AreaContext)
  if (!ctx) throw new Error('useArea debe usarse dentro de <AreaProvider>')
  return ctx
}
