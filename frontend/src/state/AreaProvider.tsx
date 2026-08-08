import { useMemo, useState, type ReactNode } from 'react'
import { AreaContext, type Area, type AreaApi } from './areaContext'

export function AreaProvider({ children }: { children: ReactNode }) {
  const [area, setArea] = useState<Area>('Todas')
  const value = useMemo<AreaApi>(() => ({ area, setArea }), [area])
  return <AreaContext.Provider value={value}>{children}</AreaContext.Provider>
}
