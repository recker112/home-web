import { useCallback, useSyncExternalStore } from 'react'

/**
 * Modo de accesibilidad para personas con baja visión: tipografía legible,
 * texto más grande, contraste alto y cero distracciones.
 *
 * No es un contexto de React a propósito. Lo consultan sitios muy dispersos
 * (la barra superior, el fondo animado, los efectos de tecleo), y algunos son
 * hooks que no cuelgan de un proveedor común. Un store diminuto con
 * `useSyncExternalStore` evita pasar la bandera por media aplicación.
 *
 * La marca vive en `data-a11y` del `<html>` porque el script inline de
 * `index.html` la aplica antes del primer paint, igual que el tema: si se
 * activara desde React, la página parpadearía con la estética normal.
 */

const KEY = 'rn.a11y'

const listeners = new Set<() => void>()

let enabled = document.documentElement.dataset.a11y === 'on'

const getSnapshot = () => enabled
/* En render de servidor (el smoke test) no hay preferencia guardada. */
const getServerSnapshot = () => false

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setA11y(next: boolean) {
  if (next === enabled) return
  enabled = next

  const root = document.documentElement
  if (next) root.dataset.a11y = 'on'
  else delete root.dataset.a11y

  try {
    localStorage.setItem(KEY, next ? 'on' : 'off')
  } catch {
    /* sin persistencia, pero el modo sigue activo en esta sesión */
  }

  for (const listener of listeners) listener()
}

export function useA11y() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const toggle = useCallback(() => setA11y(!enabled), [])
  return { enabled: value, toggle }
}
