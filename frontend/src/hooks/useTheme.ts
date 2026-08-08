import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const KEY = 'rn.theme'

function readInitial(): Theme {
  /* El script inline de index.html ya decidió el tema antes del primer
     paint; aquí solo lo leemos para no provocar un cambio de color. */
  const applied = document.documentElement.dataset.theme
  return applied === 'light' ? 'light' : 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitial)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#070b14' : '#dfe8f8')
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* sin persistencia, pero el tema sigue aplicado en esta sesión */
    }
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggle }
}
